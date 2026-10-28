import { type Engine, type EngineError, type GraphData, type SolutionData, type SolveRequest } from '@tuprolog/arg2p-ui/data';
import { assert, describe, it } from 'vitest';
import { ClusterEngine } from '../src/federation/engine.js';
import type { ParallelRun, ParallelSolver } from '../src/federation/federation.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const graph = (id: string): GraphData => ({
    profile: 'aspic_plus',
    arguments: [{ id, descriptor: '', conclusion: id, topRule: 'none', label: 'in', supports: [] }],
    attacks: [],
});

const solution = (value: string): SolutionData => ({
    result: 'yes',
    query: `q(${value})`,
    bindings: [{ name: 'X', value }],
    error: null,
    graph: graph(value),
    branch: 3,
});

/** A cluster that answers its runs with [solutions]; held, what it answers waits to be let go */
class FakeCluster implements ParallelSolver {
    readonly requests: SolveRequest[] = [];
    stops = 0;
    hold = false;
    private readonly held: (() => void)[] = [];

    constructor(private readonly solutions: SolutionData[], private readonly failure: unknown = null) {}

    solve(request: SolveRequest): Promise<ParallelRun> {
        this.requests.push(request);
        if (this.failure !== null) return Promise.reject(this.failure);
        let next = 0;
        return Promise.resolve({
            query: request.query,
            hasNext: () => next < this.solutions.length,
            next: () => this.answer(this.solutions[next++]!),
        });
    }

    stop(): void {
        this.stops++;
    }

    go(): void {
        this.held.splice(0).forEach(it => it());
    }

    private answer<T>(value: T): Promise<T> {
        return this.hold ? new Promise(resolve => this.held.push(() => resolve(value))) : Promise.resolve(value);
    }
}

const local: Engine = {
    solve: () => Promise.reject(new Error('not the engine of the page')),
    check: async text => (text === 'bad' ? { line: 1, column: 1, length: 1, message: 'bad' } : null),
    settings: async () => ({ queryMode: ['true'] }),
    stop: () => {},
};

const REQUEST: SolveRequest = { theory: 'f1 :=> a.', query: 'buildLabelSets(In, Out, Und)', flags: 'queryMode.' };

describe('The engine of the parallel runs', function () {
    it('should solve on the cluster, a solution at a time with its graph, and no stages', async function () {
        const cluster = new FakeCluster([solution('a'), solution('b')]);
        const engine = new ClusterEngine(async () => cluster, local);
        const run = await engine.solve(REQUEST);
        // the flags go as flags, with the theory and the query
        deepEqual(cluster.requests, [REQUEST]);
        equal(run.query, REQUEST.query);
        ok(run.hasNext());
        const first = await run.next();
        deepEqual(first.bindings, [{ name: 'X', value: 'a' }]);
        equal(first.branch, 0);
        deepEqual(await run.graphAt(0), graph('a'));
        await run.next();
        equal(run.hasNext(), false);
        deepEqual(await run.graphAt(0), graph('b'));
    });

    it('should check the texts, and tell the flags, on the engine of the page', async function () {
        const engine = new ClusterEngine(async () => new FakeCluster([]), local);
        equal(await engine.check('ok.', 'theory'), null);
        equal((await engine.check('bad', 'query'))?.message, 'bad');
        deepEqual(await engine.settings('', ''), { queryMode: ['true'] });
    });

    it('should stop a run: what it waits for fails as stopped, and it has no more', async function () {
        const cluster = new FakeCluster([solution('a'), solution('b')]);
        const engine = new ClusterEngine(async () => cluster, local);
        const run = await engine.solve(REQUEST);
        cluster.hold = true;
        const next = run.next();
        engine.stop();
        const error = await next.then(
            () => null,
            (failure: EngineError) => failure,
        );
        equal(error?.stopped, true);
        equal(cluster.stops, 1);
        equal(run.hasNext(), false);
        // what the cluster answers afterwards is let go
        cluster.go();
        // nothing going on: the cluster is let be
        engine.stop();
        equal(cluster.stops, 1);
    });

    it('should tell what the cluster failed with as an error of the engine', async function () {
        const syntax: EngineError = { name: 'Theory error', message: 'm', syntax: { line: 1, column: 2, length: 1, message: 'm', where: 'theory' } };
        const failing = (failure: unknown) => new ClusterEngine(async () => new FakeCluster([], failure), local).solve(REQUEST).then(() => null, (error: EngineError) => error);
        deepEqual(await failing(syntax), syntax);
        deepEqual(await failing(new Error('no site answers')), { name: 'Parallel solver error', message: 'no site answers', syntax: null });
        deepEqual(
            await new ClusterEngine(() => Promise.reject(new Error('no workers')), local).solve(REQUEST).then(() => null, (error: EngineError) => error.message),
            'no workers',
        );
    });
});
