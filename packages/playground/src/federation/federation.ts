import type { SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';
import { DEFAULT_RELAY, Inviting, decodeInvitation, decodeReply, handOff, join, type Joined, type Peer } from './pairing.js';

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

/** The Web Workers a cluster runs on this device: one less than its processors, at most 4 (a phone has little memory to spare) */
export function workerCount(): number {
    return Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency ?? 2) - 1));
}

const RELAY_SETTING = 'arg2p.relay';

export class Federation {
    private cluster: Promise<Cluster> | null = null;
    // the cluster, once started
    private ready: Cluster | null = null;
    // the invitation going on
    private current: Inviting | null = null;
    private known: FederationStats | null = null;
    private readonly listeners = new Set<() => void>();

    /** A federation of the clusters [create] makes */
    constructor(private readonly create: () => Promise<Cluster>) {}

    /** Tells [listener] whenever the federation changes: gives what stops it */
    subscribe(listener: () => void): () => void {
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
        return (this.known?.sites ?? []).filter(it => !it.delegate && it.id !== this.known?.site);
    }

    /** The relay the replies to invitations go through (ntfy, https://ntfy.sh unless another is set) */
    get relay(): string {
        try {
            return localStorage.getItem(RELAY_SETTING) ?? DEFAULT_RELAY;
        } catch {
            return DEFAULT_RELAY;
        }
    }

    set relay(url: string) {
        try {
            if (url.trim() === '' || url.trim() === DEFAULT_RELAY) localStorage.removeItem(RELAY_SETTING);
            else localStorage.setItem(RELAY_SETTING, url.trim());
        } catch {
            // not remembered
        }
    }

    /** The solver of the parallel runs: the cluster, started if it was not */
    solver(): Promise<ParallelSolver> {
        return this.started();
    }

    /**
     * A new invitation (the one before dropped), its link opening the playground at [base]; [reached] tells whether the
     * relay of its replies can be read
     */
    async invite(base: string, reached: (ok: boolean) => void): Promise<string> {
        this.dropInvitation();
        const inviting = await Inviting.start(await this.started(), { relay: this.relay, base, reached, handedOff: () => this.paired() });
        this.current = inviting;
        return inviting.link;
    }

    /** Whether an invitation is going on: none once it paired, or was dropped */
    get inviting(): boolean {
        return this.current !== null;
    }

    /** Pairs with the reply to the invitation whose code is [code], once it comes */
    async pair(code: string): Promise<void> {
        await this.invitation().pair(code);
        this.paired();
    }

    /** Pairs with the reply of the link [code] (scanned, pasted, or opened on this device) */
    async take(code: string): Promise<void> {
        const reply = decodeReply(code);
        if (reply === null) throw new Error('That is not the reply to an invitation.');
        if (!(await this.invitation().take(reply))) throw new Error('That reply answers another invitation: invite again, and use its new reply.');
        this.paired();
    }

    /** Drops the invitation going on: no reply pairs with it any longer */
    dropInvitation(): void {
        this.current?.close();
        this.current = null;
    }

    /** Joins the invitation of the link [code]: what to show the device that invited */
    async join(code: string, base: string): Promise<Joined> {
        const invitation = decodeInvitation(code);
        if (invitation === null) throw new Error('That is not an invitation.');
        const joined = await join(await this.started(), invitation, base);
        this.changed();
        return joined;
    }

    /** Hands the reply of the link [code], opened in this page, to the page of this device that invited */
    handOff(code: string): ReturnType<typeof handOff> {
        const reply = decodeReply(code);
        return reply === null ? Promise.resolve({ paired: false, message: 'That is not the reply to an invitation.' }) : handOff(reply);
    }

    /** Leaves the federation: the links to the other devices close, and the Web Workers stop */
    leave(): void {
        this.dropInvitation();
        // one still starting is closed once started
        this.ready?.close();
        this.ready = null;
        this.cluster = null;
        this.changed();
    }

    private invitation(): Inviting {
        if (this.current === null) throw new Error('No invitation is going on: invite first.');
        return this.current;
    }

    private paired(): void {
        this.current = null;
        this.changed();
    }

    private started(): Promise<Cluster> {
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
        return this.cluster;
    }

    private changed(): void {
        this.known = this.ready?.stats() ?? null;
        this.listeners.forEach(it => it());
    }
}
