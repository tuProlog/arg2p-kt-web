import type { SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';
import { keepSetting, setting } from '../storage.js';
import { DEFAULT_RELAY, Inviting, decodeInvitation, decodeReply, handOff, join, type HandedOff, type InvitingOptions, type Joined, type Peer } from './pairing.js';
import { relayUrl } from './relay.js';

// The federation of the playground with the playgrounds of other devices (see Federation in the documentation of the
// parallel solver): a cluster of the parallel solver on the Web Workers of this device, lending them to the devices it
// is paired with (see pairing.ts) and borrowing theirs, which solves the parallel runs. Its solver is loaded, and its
// workers started, once it is asked for.

/** The solutions of a query, one at a time, each with its graph (no stages) */
export interface ParallelRun {
    /** The query, as the solver read it */
    readonly query: string;
    hasNext(): boolean;
    next(): Promise<SolutionData>;
}

/** What solves in parallel: a query on a theory with its flags, as the solver of the page would (see ClusterEngine) */
export interface ParallelSolver {
    /** The solutions of [request]: a rejected promise holds an EngineError; what the solver prints goes to [output] */
    solve(request: SolveRequest, output: (text: string) => void): Promise<ParallelRun>;
    /** Stops the evaluation going on */
    stop(): void;
}

/** What a federation is, as one of its sites ([site]) knows it: the sites it knows, itself first, and its last evaluation */
export interface FederationStats {
    readonly site: string;
    readonly sites: readonly SiteStats[];
    readonly evaluation: EvaluationStats | null;
}

/**
 * A site: the workers it offers (those of its delegates included; null when not known), whether it is a delegate of
 * the site knowing it (one of its Web Workers), and the site it is reached through (null: linked to it directly)
 */
export interface SiteStats {
    readonly id: string;
    readonly workers: number | null;
    readonly delegate: boolean;
    readonly via: string | null;
}

/**
 * An evaluation: the part of the graph it was answered on (directional or connected in query mode, whole_graph
 * otherwise), the arguments and attacks of the graph, the arguments it added to it, what each worker built, and how
 * long it took, in milliseconds
 */
export interface EvaluationStats {
    readonly locality: string;
    readonly arguments: number;
    readonly attacks: number;
    readonly added: number;
    readonly workers: readonly WorkerStats[];
    readonly milliseconds: number;
}

/** A worker of a graph: its partition of the theory, the site that ran it, the arguments and attacks it built */
export interface WorkerStats {
    readonly partition: number;
    readonly site: string;
    readonly arguments: number;
    readonly attacks: number;
}

/** A cluster, as the playground uses it (see cluster.ts, which makes one of a WebWorkerCluster) */
export interface Cluster extends Peer, ParallelSolver {
    stats(): FederationStats;
    /** Called as sites join or leave, and evaluations end */
    onChange: (() => void) | null;
    /** Leaves the federation: the links to the other devices close, and the Web Workers stop */
    close(): void;
}

/** A device of a federation, as the user reads it: this one, or another by its rank among those known */
export interface Device {
    readonly id: string;
    readonly name: string;
    /** Its workers, those of its Web Workers included: null when not known (a device reached through another) */
    readonly workers: number | null;
    /** The device it is reached through: null for this one, and those linked to it */
    readonly via: string | null;
}

/** The sites of the other devices of [stats]: neither this one nor the Web Workers of any */
export function otherDevices(stats: FederationStats): SiteStats[] {
    return stats.sites.filter(it => !it.delegate && it.id !== stats.site);
}

/** The devices of [stats]: this one first, then the others (the Web Workers of each are among its workers) */
export function devicesOf(stats: FederationStats): Device[] {
    const name = (id: string) => deviceName(stats, id);
    return [...stats.sites.filter(it => it.id === stats.site), ...otherDevices(stats)].map(it => ({
        id: it.id,
        name: name(it.id),
        workers: it.workers,
        via: it.via === null ? null : name(it.via),
    }));
}

/** The device the site [id] of [stats] is on: this one for its Web Workers, another by its rank, or the site itself */
export function deviceName(stats: FederationStats, id: string): string {
    if (id === stats.site || stats.sites.some(it => it.delegate && it.id === id)) return 'This device';
    const rank = otherDevices(stats).findIndex(it => it.id === id);
    return rank === -1 ? id : `Device ${rank + 1}`;
}

/** The Web Workers a cluster runs on this device: one less than its processors, at most 4 (a phone has little memory to spare) */
export function workerCount(): number {
    return Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency ?? 2) - 1));
}

const RELAY_SETTING = 'arg2p.relay';

/**
 * What a federation tells as it goes: it changed (its devices, its last evaluation, its invitation), a device was paired
 * (with an invitation of this one, or to the one whose invitation this device joined), or the invitation going on ended
 * by itself, with no pairing (its lifetime over, its page gone, its pairing failed)
 */
export type FederationEvent = 'changed' | 'paired' | 'dropped';

export class Federation {
    private cluster: Promise<Cluster> | null = null;
    // the cluster, once started
    private ready: Cluster | null = null;
    // the invitation going on
    private current: Inviting | null = null;
    // the invitations asked for: one asked for before the last is dropped as soon as it is ready
    private invitations = 0;
    // the other devices when this one joined an invitation: one more is the device that invited
    private joined: number | null = null;
    private known: FederationStats | null = null;
    private readonly listeners = new Set<(event: FederationEvent) => void>();

    /**
     * A federation of the clusters [create] makes; [pairing] tells how its invitations reach the relay, the other pages
     * of this device and their page, and how long they last (as they do in the browser unless told: for tests)
     */
    constructor(
        private readonly create: () => Promise<Cluster>,
        private readonly pairing: Pick<InvitingOptions, 'fetch' | 'channels' | 'page' | 'lifetime'> = {},
    ) {}

    /** Tells [listener] what the federation tells (see FederationEvent): gives what stops it */
    subscribe(listener: (event: FederationEvent) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** Whether the cluster runs (its Web Workers started) */
    get running(): boolean {
        return this.cluster !== null;
    }

    /** What the federation is, as this device knows it: null while its cluster does not run */
    get stats(): FederationStats | null {
        return this.known;
    }

    /** The other devices paired: those linked, and those reached through them */
    get devices(): readonly SiteStats[] {
        return this.known === null ? [] : otherDevices(this.known);
    }

    /** The relay the replies to invitations go through (ntfy, https://ntfy.sh unless another is set) */
    get relay(): string {
        return relayUrl(setting(RELAY_SETTING) ?? '') ?? DEFAULT_RELAY;
    }

    /** Sets the relay to [url], or to the default one when it is empty: false when it is no https address */
    setRelay(url: string): boolean {
        const relay = url.trim() === '' ? DEFAULT_RELAY : relayUrl(url);
        if (relay === null) return false;
        keepSetting(RELAY_SETTING, relay === DEFAULT_RELAY ? null : relay);
        return true;
    }

    /** The solver of the parallel runs: the cluster, started if it was not */
    solver(): Promise<ParallelSolver> {
        return this.started();
    }

    /**
     * A new invitation (the one before dropped), its link opening the playground at [base]; [reached] tells whether the
     * relay of its replies can be read. It fails when it is dropped before it is ready: another one asked for, the
     * invitation dropped, the federation left.
     */
    async invite(base: string, reached: (ok: boolean) => void): Promise<string> {
        this.dropInvitation();
        const asked = this.invitations;
        const cluster = await this.started();
        if (asked !== this.invitations) throw new Error('The invitation was dropped.');
        const inviting: Inviting = await Inviting.start(cluster, {
            ...this.pairing,
            relay: this.relay,
            base,
            reached,
            handedOff: () => this.paired(inviting),
            dropped: () => this.dropped(inviting),
        });
        if (asked !== this.invitations) {
            inviting.close();
            throw new Error('The invitation was dropped.');
        }
        this.current = inviting;
        return inviting.link;
    }

    /** Whether an invitation is going on: none once it paired, or was dropped */
    get inviting(): boolean {
        return this.current !== null;
    }

    /** Pairs with the reply to the invitation whose code is [code], once it comes */
    async pair(code: string): Promise<void> {
        const inviting = this.invitation();
        await inviting.pair(code);
        this.paired(inviting);
    }

    /** Pairs with the reply of the link [code] (scanned, pasted, or opened on this device) */
    async take(code: string): Promise<void> {
        const reply = decodeReply(code);
        if (reply === null) throw new Error('That is not the reply to an invitation.');
        const inviting = this.invitation();
        if (!(await inviting.take(reply))) throw new Error('That reply answers another invitation: invite again, and use its new reply.');
        this.paired(inviting);
    }

    /** Drops the invitation going on, or the one being prepared: no reply pairs with it any longer */
    dropInvitation(): void {
        this.invitations++;
        const current = this.current;
        this.current = null;
        current?.close();
    }

    /**
     * Joins the invitation of the link [code]: what to show the device that invited. Cancelled with [signal], it fails,
     * and sends that device no reply.
     */
    async join(code: string, base: string, signal?: AbortSignal): Promise<Joined> {
        const invitation = decodeInvitation(code);
        if (invitation === null) throw new Error('That is not an invitation.');
        const cluster = await this.started();
        signal?.throwIfAborted();
        const joined = await join(cluster, invitation, base, { fetch: this.pairing.fetch, signal });
        this.joined = this.devices.length;
        this.changed();
        return joined;
    }

    /** Hands the reply of the link [code], opened in this page, to the page of this device that invited */
    handOff(code: string): Promise<HandedOff> {
        const reply = decodeReply(code);
        return reply === null ? Promise.resolve({ paired: false, message: 'That is not the reply to an invitation.' }) : handOff(reply, { channels: this.pairing.channels });
    }

    /** Leaves the federation: the links to the other devices close, and the Web Workers stop (those starting once started) */
    leave(): void {
        this.dropInvitation();
        this.ready?.close();
        this.ready = null;
        this.cluster = null;
        this.joined = null;
        this.changed();
    }

    private invitation(): Inviting {
        if (this.current === null) throw new Error('No invitation is going on: invite first.');
        return this.current;
    }

    // [inviting] paired
    private paired(inviting: Inviting): void {
        if (this.current === inviting) this.current = null;
        this.changed();
        this.tell('paired');
    }

    // [inviting] ended by itself, with no pairing: told when it is the one going on
    private dropped(inviting: Inviting): void {
        if (this.current !== inviting) return;
        this.current = null;
        this.changed();
        this.tell('dropped');
    }

    // The cluster, started if it was not: a failure when the federation is left meanwhile
    private async started(): Promise<Cluster> {
        if (this.cluster === null) {
            const cluster = this.create();
            this.cluster = cluster;
            cluster.then(
                it => {
                    // left meanwhile
                    if (this.cluster !== cluster) return it.close();
                    this.ready = it;
                    it.onChange = () => this.ready === it && this.changed();
                    this.changed();
                },
                () => {
                    // tried again next time
                    if (this.cluster === cluster) this.cluster = null;
                },
            );
        }
        const cluster = this.cluster;
        const started = await cluster;
        if (this.cluster !== cluster) throw new Error('The federation was left.');
        return started;
    }

    private changed(): void {
        this.known = this.ready?.stats() ?? null;
        this.tell('changed');
        // the device whose invitation this one joined is linked
        if (this.joined !== null && this.devices.length > this.joined) {
            this.joined = null;
            this.tell('paired');
        }
    }

    private tell(event: FederationEvent): void {
        this.listeners.forEach(it => it(event));
    }
}
