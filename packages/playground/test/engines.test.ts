import type { EngineError, GraphData, Run, SolutionData, SolveRequest } from '@tuprolog/arg2p-ui';
import { assert, describe, it } from 'vitest';
import { EnginePool, type WorkerEngine } from '../src/engines.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const EMPTY: GraphData = { profile: 'aspicPlus', arguments: [], attacks: [] };
const GONE: EngineError = { name: 'Error', message: 'This query is no longer running.', syntax: null };

// A worker whose queries have [count] solutions, numbered; what it was asked, kept. Like the worker of the page, it
// keeps its latest query alone, and its queries end with it
class FakeWorker implements WorkerEngine {
    static made: FakeWorker[] = [];
    readonly solved: SolveRequest[] = [];
    disposed = false;
    // what the next solution waits for
    gate: Promise<void> = Promise.resolve();
    private current = 0;

    constructor(private readonly count: number) {
        FakeWorker.made.push(this);
    }

    async solve(request: SolveRequest, output: (text: string) => void = () => {}): Promise<Run> {
        this.solved.push(request);
        const id = ++this.current;
        let given = 0;
        const alive = () => !this.disposed && this.current === id;
        return {
            query: request.query,
            hasNext: () => alive() && given < this.count,
            next: async (): Promise<SolutionData> => {
                await this.gate;
                if (!alive()) throw GONE;
                given++;
                output(`printed ${given}\n`);
                return { result: 'yes', query: `${request.query} #${given}`, bindings: [], error: null, graph: EMPTY, branch: given };
            },
            graphAt: async (branch: number) => {
                if (!alive()) throw GONE;
                return { ...EMPTY, profile: `stage ${branch} of ${given}` };
            },
        };
    }

    async check() {
        return null;
    }

    async settings() {
        return {};
    }

    stop(): void {
        this.current = 0;
    }

    start(): void {}

    dispose(): void {
        this.disposed = true;
    }
}

function pool(limit: number, count = 5) {
    FakeWorker.made = [];
    const shared = { check: async () => null, settings: async () => ({ shared: ['yes'] }) };
    return new EnginePool(shared, () => limit, () => new FakeWorker(count));
}

const REQUEST = (query: string): SolveRequest => ({ theory: 'a.', query, flags: '' });

describe('The engines of the documents', function () {
    it('should give each document a worker of its own, started once it solves', async function () {
        const engines = pool(3);
        const a = engines.engine('a');
        equal(engines.engine('a'), a);
        equal(FakeWorker.made.length, 0, 'none before a run');
        deepEqual(await a.settings('a.', ''), { shared: ['yes'] }, 'the settings are asked of the page');
        const runA = await a.solve(REQUEST('qa'));
        const runB = await engines.engine('b').solve(REQUEST('qb'));
        equal(FakeWorker.made.length, 2);
        // each goes on, apart
        equal((await runA.next()).query, 'qa #1');
        equal((await runB.next()).query, 'qb #1');
        equal((await runA.next()).query, 'qa #2');
    });

    it('should keep the workers of the documents used last, and go on with the others where they were', async function () {
        const engines = pool(2);
        const outputs: string[] = [];
        const runA = await engines.engine('a').solve(REQUEST('qa'), text => outputs.push(text));
        await runA.next();
        await runA.next();
        await (await engines.engine('b').solve(REQUEST('qb'))).next();
        await (await engines.engine('c').solve(REQUEST('qc'))).next();
        equal(engines.workers, 2);
        ok(FakeWorker.made[0]!.disposed, 'the worker of a, used least, let go');
        ok(!engines.engine('a').alive);
        ok(runA.hasNext(), 'its run has more all the same');
        // asked for the next solution: solved again on a fresh worker, past the two given, silently
        const third = await runA.next();
        equal(third.query, 'qa #3');
        equal(FakeWorker.made.length, 4);
        deepEqual(FakeWorker.made[3]!.solved, [REQUEST('qa')]);
        deepEqual(outputs, ['printed 1\n', 'printed 2\n', 'printed 3\n']);
        ok(FakeWorker.made[1]!.disposed, 'b, used least now, let its worker go');
    });

    it('should read the stages of a run whose worker was let go, solved again to where it was', async function () {
        const engines = pool(1);
        const runA = await engines.engine('a').solve(REQUEST('qa'));
        await runA.next();
        await runA.next();
        await (await engines.engine('b').solve(REQUEST('qb'))).next();
        equal((await runA.graphAt(1)).profile, 'stage 1 of 2');
    });

    it('should go on with a run stopped, and end the runs of a query replaced', async function () {
        const engines = pool(3);
        const a = engines.engine('a');
        const first = await a.solve(REQUEST('q1'));
        await first.next();
        a.stop();
        equal((await first.next()).query, 'q1 #2', 'stopped: solved again past the first');
        const second = await a.solve(REQUEST('q2'));
        equal(first.hasNext(), false);
        let failed = false;
        await first.next().catch(() => (failed = true));
        ok(failed);
        equal((await second.next()).query, 'q2 #1');
    });

    it('should end the engines of the documents closed', async function () {
        const engines = pool(3);
        await engines.engine('a').solve(REQUEST('qa'));
        await engines.engine('b').solve(REQUEST('qb'));
        engines.keep(['b']);
        ok(FakeWorker.made[0]!.disposed);
        ok(!FakeWorker.made[1]!.disposed);
        equal(engines.workers, 1);
    });

    it('should not let a worker go while it computes', async function () {
        const engines = pool(1);
        const runA = await engines.engine('a').solve(REQUEST('qa'));
        const worker = FakeWorker.made[0]!;
        let go = () => {};
        worker.gate = new Promise<void>(resolve => (go = resolve));
        const pending = runA.next();
        ok(engines.engine('a').busy);
        await engines.engine('b').solve(REQUEST('qb'));
        ok(!worker.disposed, 'computing: kept, over the limit for a while');
        go();
        equal((await pending).query, 'qa #1');
        ok(!engines.engine('a').busy);
    });
});
