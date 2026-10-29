import { Flags, WebWorkerCluster, type Graph, type Solution } from '@tuprolog/arg2p';
import type { GraphData, SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';
import { graphData } from '@tuprolog/arg2p-ui/js';
import { workerCount, type Cluster, type FederationStats, type ParallelRun } from './federation.js';
import workerUrl from './worker.ts?worker&url';

// The cluster of the playground: a WebWorkerCluster of @tuprolog/arg2p on Web Workers of this device (see worker.ts).
// Loaded once a federation, or a parallel run, is asked for: it brings the solver with it.

/**
 * What a WebWorkerCluster is from the version of @tuprolog/arg2p after 0.20.0 on: a solver of any goal, on flags that
 * can be set, which tells what its federation is. The playground may be built with a version that has none of it: its
 * cluster pairs, and runs no query.
 */
interface SolvingCluster {
    flags: Flags;
    onPeersChanged: (() => void) | null;
    readonly solver: {
        output: (text: string) => void;
        solve(goal: string): Promise<{ hasNext(): boolean; next(): Promise<Solution> }>;
        /** The graph of the last solution given */
        graph(): Graph;
        /** Ends the goal going on: its next solution is a halt */
        stop(): void;
    };
    readonly stats: {
        readonly site: string;
        readonly sites: readonly { id: string; workers?: number | null; delegate: boolean; via?: string | null }[];
        readonly evaluation?: {
            locality: string;
            arguments: number;
            attacks: number;
            added: number;
            milliseconds: number;
            workers: readonly { partition: number; site: string; arguments: number; attacks: number }[];
        } | null;
    };
}

/** How often the sites of a cluster that does not tell when they change are looked at */
const LOOK_EVERY = 1000;

/**
 * A WebWorkerCluster as a solver: any goal on the theory and the flags of a run, solved by its workers and by those of
 * the devices it is paired with, one solution at a time with the graph of the last stage of its resolution
 */
export class WebCluster implements Cluster {
    onChange: (() => void) | null = null;

    private readonly threads = workerCount();
    private readonly cluster = new WebWorkerCluster(this.threads, workerUrl);
    // the cluster as a solver, if this version of @tuprolog/arg2p has it
    private readonly solving: SolvingCluster | null = 'solver' in this.cluster ? (this.cluster as unknown as SolvingCluster) : null;
    private readonly timer: ReturnType<typeof setInterval> | undefined;

    constructor() {
        if (this.solving !== null) {
            this.solving.onPeersChanged = () => this.onChange?.();
            return;
        }
        let seen = 0;
        this.timer = setInterval(() => {
            if (this.cluster.peers.length === seen) return;
            seen = this.cluster.peers.length;
            this.onChange?.();
        }, LOOK_EVERY);
    }

    invite(): Promise<string> {
        return this.cluster.invite();
    }

    accept(invitation: string): Promise<string> {
        return this.cluster.accept(invitation);
    }

    complete(reply: string): Promise<void> {
        return this.cluster.complete(reply);
    }

    async solve({ theory, query, flags }: SolveRequest, output: (text: string) => void): Promise<ParallelRun> {
        const cluster = this.solving;
        if (cluster === null) {
            throw { name: 'Parallel solver error', message: 'This version of @tuprolog/arg2p runs no query in parallel: a newer one is needed.', syntax: null };
        }
        const goal = query.trim().replace(/\.$/, '');
        if (goal === '') throw { name: 'Query error', message: 'Query is a mandatory field.', syntax: null };
        // the flags of the run, for the evaluations from now on: the pairings stay
        cluster.flags = Flags.parse(flags);
        this.cluster.load(theory);
        const solver = cluster.solver;
        solver.output = output;
        const profile = await profileOf(cluster);
        const solutions = await solver.solve(goal);
        return {
            query: goal,
            hasNext: () => solutions.hasNext(),
            next: async () => {
                const solution = await solutions.next();
                // what the evaluation built is told once it is over
                this.onChange?.();
                return solutionData(solution, graphData(solver.graph(), profile));
            },
        };
    }

    stop(): void {
        this.solving?.solver.stop();
    }

    stats(): FederationStats {
        // as plain data: what the cluster gives is read anew every time
        if (this.solving === null) return this.counted();
        const { site, sites, evaluation } = this.solving.stats;
        return {
            site,
            sites: sites.map(({ id, workers, delegate, via }) => ({ id, workers: workers ?? null, delegate, via: via ?? null })),
            evaluation:
                evaluation == null
                    ? null
                    : {
                          locality: evaluation.locality,
                          arguments: evaluation.arguments,
                          attacks: evaluation.attacks,
                          added: evaluation.added,
                          milliseconds: evaluation.milliseconds,
                          workers: evaluation.workers.map(({ partition, site, arguments: built, attacks }) => ({ partition, site, arguments: built, attacks })),
                      },
        };
    }

    close(): void {
        clearInterval(this.timer);
        this.cluster.close();
    }

    // The federation of a cluster that tells none: its sites counted (its own Web Workers are sites too)
    private counted(): FederationStats {
        const self = 'This device';
        const others = Math.max(0, this.cluster.peers.length - this.threads);
        return {
            site: self,
            sites: [
                { id: self, workers: this.threads, delegate: false, via: null },
                ...Array.from({ length: others }, (_, i) => ({ id: `Device ${i + 1}`, workers: null, delegate: false, via: null })),
            ],
            evaluation: null,
        };
    }
}

// A solution of the cluster, with [graph], as the components read it: no stages, the graph of the last one alone
function solutionData(solution: Solution, graph: GraphData): SolutionData {
    return {
        result: solution.isYes ? 'yes' : solution.isNo ? 'no' : 'halt',
        query: solution.query,
        bindings: solution.variables.map(name => ({ name, value: solution.text(name) ?? '' })),
        error: solution.error ?? null,
        graph,
        branch: 0,
    };
}

// The profile the theory is read in (it states it, or the flags, or it is the default), asked before the goal
async function profileOf(cluster: SolvingCluster): Promise<string> {
    try {
        const found = await (await cluster.solver.solve('setting(graphBuildMode, Profile)')).next();
        return found.isYes ? (found.text('Profile') ?? '') : '';
    } catch {
        return '';
    }
}
