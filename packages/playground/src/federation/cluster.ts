import { Flags, WebWorkerCluster, type Solution } from '@tuprolog/arg2p';
import type { GraphData, SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';
import { graphData } from '@tuprolog/arg2p-ui/js';
import { profileOf } from '../documents.js';
import { workerCount, type Cluster, type FederationStats, type ParallelRun } from './federation.js';
import workerUrl from './worker.ts?worker&url';

// The cluster of the playground: a WebWorkerCluster of @tuprolog/arg2p on Web Workers of this device (see worker.ts).
// Loaded once a federation, or a parallel run, is asked for: it brings the solver with it.

/**
 * A WebWorkerCluster as a solver: any goal on the theory and the flags of a run, solved by its workers and by those of
 * the devices it is paired with, one solution at a time with the graph of the last stage of its resolution
 */
export class WebCluster implements Cluster {
    onChange: (() => void) | null = null;

    private readonly cluster = new WebWorkerCluster(workerCount(), workerUrl);

    constructor() {
        this.cluster.onPeersChanged = () => this.onChange?.();
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

    async solve(request: SolveRequest, output: (text: string) => void): Promise<ParallelRun> {
        const goal = request.query.trim().replace(/\.$/, '');
        if (goal === '') throw { name: 'Query error', message: 'Query is a mandatory field.', syntax: null };
        // the flags of the run, for the evaluations from now on: the pairings stay
        this.cluster.flags = Flags.parse(request.flags);
        this.cluster.load(request.theory);
        const solver = this.cluster.solver;
        solver.output = output;
        const profile = profileOf(request);
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
        this.cluster.solver.stop();
    }

    stats(): FederationStats {
        // as plain data: what the cluster gives is read anew every time
        const { site, sites, evaluation } = this.cluster.stats;
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
        this.cluster.close();
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
