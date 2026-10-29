import {
    EMPTY_GRAPH,
    type Engine,
    type EngineError,
    type GraphData,
    type Run,
    type Settings,
    type SolutionData,
    type SolveRequest,
    type SyntaxProblem,
} from '@tuprolog/arg2p-ui/data';
import { messageOf } from '../errors.js';
import type { ParallelSolver } from './federation.js';

const STOPPED: EngineError = { name: 'Stopped', message: 'The query was stopped.', syntax: null, stopped: true };

/**
 * The engine of the parallel runs: the solver of a cluster (the Web Workers of this device, and those of the devices
 * paired), which answers any query as the solver of the page does, one solution at a time, each with its graph. It has
 * no stages: the graph of a run is that of its last solution. The texts are checked, and the flags in effect told, by
 * the engine of the page ([local]).
 */
export class ClusterEngine implements Engine {
    // the run going on: what one no longer the latest answers is let go
    private runs = 0;
    // what is waited for, failed as stopped when the run is stopped
    private readonly waiting = new Set<(error: EngineError) => void>();
    private solver: ParallelSolver | null = null;

    constructor(
        private readonly start: () => Promise<ParallelSolver>,
        private readonly local: Engine,
    ) {}

    async solve(request: SolveRequest, output: (text: string) => void = () => {}): Promise<Run> {
        const id = ++this.runs;
        const syntax = await this.stoppable(this.problem(request));
        if (syntax !== null) throw syntax;
        this.solver = await this.stoppable(this.start());
        const run = await this.stoppable(this.solver.solve(request, text => id === this.runs && output(text)));
        let graph: GraphData = EMPTY_GRAPH;
        return {
            query: run.query,
            // a run replaced, or stopped, has no more
            hasNext: () => id === this.runs && run.hasNext(),
            next: async (): Promise<SolutionData> => {
                const solution = await this.stoppable(run.next());
                graph = solution.graph;
                return { ...solution, branch: 0 };
            },
            graphAt: () => Promise.resolve(graph),
        };
    }

    check(text: string, kind: 'theory' | 'query'): Promise<SyntaxProblem | null> {
        return this.local.check(text, kind);
    }

    settings(theory: string, flags: string): Promise<Settings> {
        return this.local.settings(theory, flags);
    }

    // Where the theory, the flags or the query of [request] do not parse, as the engine of the page reads them, as the
    // error of a run that cannot start; null if they all do
    private async problem({ theory, flags, query }: SolveRequest): Promise<EngineError | null> {
        const texts = [
            { where: 'theory', text: theory, kind: 'theory', name: 'Theory error' },
            { where: 'flags', text: flags, kind: 'theory', name: 'Flags error' },
            { where: 'query', text: query, kind: 'query', name: 'Query error' },
        ] as const;
        const problems = await Promise.all(texts.map(it => this.local.check(it.text, it.kind)));
        const at = problems.findIndex(it => it !== null);
        if (at === -1) return null;
        const problem = problems[at]!;
        return { name: texts[at]!.name, message: problem.message, syntax: { ...problem, where: texts[at]!.where } };
    }

    stop(): void {
        // nothing is being evaluated: the cluster is let be
        if (this.waiting.size === 0) return;
        this.runs++;
        [...this.waiting].forEach(fail => fail(STOPPED));
        this.waiting.clear();
        this.solver?.stop();
    }

    // [promise], failing as stopped should the run be stopped first; a failure of the cluster as an EngineError
    private stoppable<T>(promise: Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const fail = (error: EngineError) => reject(error);
            this.waiting.add(fail);
            promise.then(
                value => {
                    if (!this.waiting.delete(fail)) return;
                    resolve(value);
                },
                error => {
                    if (!this.waiting.delete(fail)) return;
                    reject(engineError(error));
                },
            );
        });
    }
}

// What the cluster failed with, as an EngineError: as it is when it is one already
function engineError(error: unknown): EngineError {
    if (typeof error === 'object' && error !== null && 'syntax' in error && 'name' in error) return error as EngineError;
    return { name: 'Parallel solver error', message: messageOf(error), syntax: null };
}
