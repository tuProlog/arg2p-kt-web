import type { SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';

// The federation of the playground with a server (an instance of Arg2P on the JVM or Node.js listening, as the extension
// of VS Code does, see Federation in the documentation of the parallel solver): a parallel solver on the Web Workers of
// this device, which solves the parallel runs, connected to the server it is given, lending its workers to the server
// and to the devices linked to it, and borrowing theirs. With no server it solves on this device alone: browsers cannot
// link to one another. Its solver is loaded, and its workers started, once it is asked for.

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

/** A site: its name (empty when it has none), and the workers it offers (null when not known) */
export interface SiteStats {
    readonly id: string;
    readonly name: string;
    readonly workers: number | null;
}

/**
 * An evaluation: the part of the graph it was answered on (directional or connected in query mode, wholeGraph
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

/** A cluster, as the playground uses it (see cluster.ts, which makes one of a WebWorkerSolver and its Federation) */
export interface Cluster extends ParallelSolver {
    /** Connects to the server at [url] (ws:// or wss://), proving it knows [code] if the server requires one */
    connect(url: string, code: string | null): Promise<void>;
    stats(): FederationStats;
    /** Called as sites join or leave, and evaluations end */
    onChange: (() => void) | null;
    /** Leaves the federation: the link to the server closes, and the Web Workers stop */
    close(): void;
}

/** A device of a federation, as the user reads it: this one, or another by its name, or its rank among those known */
export interface Device {
    readonly id: string;
    readonly name: string;
    /** Its workers: null when not known */
    readonly workers: number | null;
}

/** The sites of the other devices of [stats]: all but this one */
export function otherDevices(stats: FederationStats): SiteStats[] {
    return stats.sites.filter(it => it.id !== stats.site);
}

/** The devices of [stats]: this one first, then the others */
export function devicesOf(stats: FederationStats): Device[] {
    return [...stats.sites.filter(it => it.id === stats.site), ...otherDevices(stats)].map(it => ({
        id: it.id,
        name: deviceName(stats, it.id),
        workers: it.workers,
    }));
}

/** The device the site [id] of [stats] is: this one, another by its name or else its rank, or the site itself */
export function deviceName(stats: FederationStats, id: string): string {
    if (id === stats.site) return 'This device';
    const others = otherDevices(stats);
    const rank = others.findIndex(it => it.id === id);
    if (rank === -1) return id;
    return others[rank]!.name !== '' ? others[rank]!.name : `Device ${rank + 1}`;
}

/** The Web Workers a cluster runs on this device: one less than its processors, at most 4 (a phone has little memory to spare) */
export function workerCount(): number {
    return Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency ?? 2) - 1));
}

/** What a federation tells as it goes: it changed (its devices, its last evaluation, the server it is connected to) */
export type FederationEvent = 'changed';

export class Federation {
    private cluster: Promise<Cluster> | null = null;
    // the cluster, once started
    private ready: Cluster | null = null;
    private known: FederationStats | null = null;
    private connected: string | null = null;
    private readonly listeners = new Set<(event: FederationEvent) => void>();

    /** A federation of the clusters [create] makes */
    constructor(private readonly create: () => Promise<Cluster>) {}

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

    /** The other devices of the federation: the server, and those it links to */
    get devices(): readonly SiteStats[] {
        return this.known === null ? [] : otherDevices(this.known);
    }

    /** The server this device connected to, if any (the address of its WebSockets) */
    get server(): string | null {
        return this.connected;
    }

    /** The solver of the parallel runs: the cluster, started if it was not */
    solver(): Promise<ParallelSolver> {
        return this.started();
    }

    /**
     * Connects to the server at [url], with [code] if it requires one: once the server admits this device. It fails if
     * the server cannot be reached, refuses the code, or does not answer in a few seconds.
     */
    async connect(url: string, code: string | null): Promise<void> {
        const cluster = await this.started();
        await cluster.connect(url, code);
        if (this.ready !== cluster) throw new Error('The federation was left.');
        this.connected = url;
        this.changed();
    }

    /** Leaves the federation: the link to the server closes, and the Web Workers stop (those starting once started) */
    leave(): void {
        this.ready?.close();
        this.ready = null;
        this.cluster = null;
        this.connected = null;
        this.changed();
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
        this.listeners.forEach(it => it('changed'));
    }
}
