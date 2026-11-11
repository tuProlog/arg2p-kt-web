import { Federation, Flags, WebWorkerSolver, type Solution } from '@tuprolog/arg2p';
import type { GraphData, SolutionData, SolveRequest } from '@tuprolog/arg2p-ui/data';
import { compactGraphData } from '@tuprolog/arg2p-ui/js';
import { profileOf } from '../documents.js';
import { workerCount, type Cluster, type FederationStats, type ParallelRun } from './federation.js';
import workerUrl from './worker.ts?worker&url';

// The cluster of the playground: a WebWorkerSolver of @tuprolog/arg2p on Web Workers of this device (see worker.ts),
// with its Federation, which connects to a server. Loaded once a federation, or a parallel run, is asked for: it brings
// the solver with it.

/**
 * A WebWorkerSolver as a solver: any goal on the theory and the flags of a run, solved by its workers and by those of
 * the federation of the server it is connected to, one solution at a time with the graph of the last stage of its
 * resolution
 */
export class WebCluster implements Cluster {
    onChange: (() => void) | null = null;

    private readonly solver = new WebWorkerSolver(workerCount(), workerUrl);
    private readonly federation = new Federation(this.solver);

    constructor() {
        this.federation.onPeersChanged = () => this.onChange?.();
    }

    connect(url: string, code: string | null): Promise<void> {
        return this.federation.connect(url, code);
    }

    async solve(request: SolveRequest, output: (text: string) => void): Promise<ParallelRun> {
        const goal = request.query.trim().replace(/\.$/, '');
        if (goal === '') throw { name: 'Query error', message: 'Query is a mandatory field.', syntax: null };
        // the flags of the run, for the evaluations from now on: the federation stays
        this.solver.flags = Flags.parse(request.flags);
        this.solver.load(request.theory);
        const solver = this.solver.goals;
        solver.output = output;
        const profile = profileOf(request);
        const solutions = await solver.solve(goal);
        // whether there is another, known only by looking for it
        let more = await solutions.hasNext();
        return {
            query: goal,
            hasNext: () => more,
            next: async () => {
                const solution = await solutions.next();
                more = await solutions.hasNext();
                // what the evaluation built is told once it is over
                this.onChange?.();
                return solutionData(solution, compactGraphData(solver.compactGraph(), profile));
            },
        };
    }

    stop(): void {
        this.solver.goals.stop();
    }

    stats(): FederationStats {
        // as plain data: what the federation and the solver give is read anew every time
        const { site, sites } = this.federation.stats;
        const evaluation = this.solver.evaluation;
        return {
            site,
            sites: sites.map(({ id, name, workers }) => ({ id, name, workers: workers ?? null })),
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
        void this.federation.close().finally(() => this.solver.close());
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
