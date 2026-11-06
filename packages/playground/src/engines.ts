import type { Engine, EngineError, GraphData, Run, SolutionData, SolveRequest, SyntaxProblem } from '@tuprolog/arg2p-ui';
import type { Settings } from '@tuprolog/arg2p-ui/data';
import { JsEngine } from '@tuprolog/arg2p-ui/js';

// The engines of the documents: each document solves on an engine of its own, so that its run goes on while another
// document is shown (its Next, its stages). An engine has a Web Worker while it is used; the workers kept are as many
// as the device affords, the documents used last keeping theirs. A document whose worker was let go keeps its run
// all the same: asked for the next solution, or a stage, the run is started again, on a fresh worker, and taken past
// the solutions already given, without a word, before it answers.
//
// The checks of the texts and the settings, asked of every document, go to the one engine of the page.

/** A worker engine, ended when let go */
export interface WorkerEngine extends Engine {
    start(): void;
    dispose(): void;
}

const GONE: EngineError = { name: 'Error', message: 'This query is no longer running.', syntax: null };

/** How many workers the device affords: fewer on phones, and on devices with little memory */
export function workerLimit(): number {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const small = typeof matchMedia === 'function' && matchMedia('(max-width: 600px)').matches;
    return small || memory <= 4 ? 3 : 6;
}

export class EnginePool {
    private readonly engines = new Map<string, DocumentEngine>();
    // the engines with a worker, the one used last at the end
    private live: DocumentEngine[] = [];

    constructor(
        private readonly shared: Pick<Engine, 'check' | 'settings'>,
        private readonly limit: () => number = workerLimit,
        private readonly spawn: () => WorkerEngine = () => new JsEngine(),
    ) {}

    /** The engine of the document [id] */
    engine(id: string): DocumentEngine {
        let engine = this.engines.get(id);
        if (engine === undefined) {
            engine = new DocumentEngine(this, this.shared, this.spawn);
            this.engines.set(id, engine);
        }
        return engine;
    }

    /** Starts the worker of the document [id] ahead of a run, warming it up, if there is room for one more */
    warm(id: string): void {
        const engine = this.engine(id);
        if (engine.alive || this.live.length < Math.max(1, this.limit())) engine.start();
    }

    /** Ends the engines of the documents not among [open] (closed) */
    keep(open: Iterable<string>): void {
        const kept = new Set(open);
        for (const [id, engine] of this.engines) {
            if (kept.has(id)) continue;
            engine.release();
            this.engines.delete(id);
        }
    }

    /** How many workers there are */
    get workers(): number {
        return this.live.length;
    }

    /** [engine] has used its worker: it is the one used last, and those used least let theirs go, beyond the limit */
    used(engine: DocumentEngine): void {
        this.live = [...this.live.filter(it => it !== engine), engine];
        while (this.live.length > Math.max(1, this.limit())) {
            // a worker computing is let be
            const oldest = this.live.find(it => it !== engine && !it.busy);
            if (oldest === undefined) break;
            oldest.release();
        }
    }

    /** [engine] has let its worker go */
    released(engine: DocumentEngine): void {
        this.live = this.live.filter(it => it !== engine);
    }
}

/** The engine of a document: a worker while used, and runs that outlive it */
export class DocumentEngine implements Engine {
    private worker: WorkerEngine | null = null;
    // the run of the latest query: the ones before it are over
    private latest: DocumentRun | null = null;
    private working = 0;

    constructor(
        private readonly pool: EnginePool,
        private readonly shared: Pick<Engine, 'check' | 'settings'>,
        private readonly spawn: () => WorkerEngine,
    ) {}

    /** Whether it is computing */
    get busy(): boolean {
        return this.working > 0;
    }

    /** Whether it has a worker */
    get alive(): boolean {
        return this.worker !== null;
    }

    async solve(request: SolveRequest, output: (text: string) => void = () => {}): Promise<Run> {
        const worker = this.acquire();
        const run = await this.during(worker.solve(request, output));
        this.latest = new DocumentRun(this, request, output, worker, run);
        return this.latest;
    }

    check(text: string, kind: 'theory' | 'query'): Promise<SyntaxProblem | null> {
        return this.shared.check(text, kind);
    }

    settings(theory: string, flags: string): Promise<Settings> {
        return this.shared.settings(theory, flags);
    }

    stop(): void {
        this.worker?.stop();
    }

    /** Starts the worker ahead of a run, warming it up */
    start(): void {
        this.acquire().start();
    }

    /** Lets the worker go: the runs go on, started again when asked for more */
    release(): void {
        this.worker?.dispose();
        this.worker = null;
        this.pool.released(this);
    }

    /** The worker, started if there is none */
    acquire(): WorkerEngine {
        this.worker ??= this.spawn();
        this.pool.used(this);
        return this.worker;
    }

    /** Whether [run] is the run of the latest query */
    isLatest(run: DocumentRun): boolean {
        return this.latest === run;
    }

    /** Whether [worker] is the worker of now */
    owns(worker: WorkerEngine): boolean {
        return this.worker === worker;
    }

    /** [promise], counted as computing until it settles */
    async during<T>(promise: Promise<T>): Promise<T> {
        this.working++;
        try {
            return await promise;
        } finally {
            this.working--;
        }
    }
}

/** A run of a document: on its worker while there is one, started again on a fresh one when it is not */
class DocumentRun implements Run {
    readonly query: string;
    // the solutions given, and whether there are more
    private taken = 0;
    private more: boolean;
    private reviving: Promise<void> | null = null;

    constructor(
        private readonly document: DocumentEngine,
        private readonly request: SolveRequest,
        private readonly output: (text: string) => void,
        private worker: WorkerEngine,
        private inner: Run,
    ) {
        this.query = inner.query;
        this.more = inner.hasNext();
    }

    hasNext(): boolean {
        return this.document.isLatest(this) && this.more;
    }

    async next(): Promise<SolutionData> {
        if (!this.document.isLatest(this)) throw GONE;
        // its worker let go, or stopped (which ended the run there): started again
        if (!this.document.owns(this.worker) || !this.inner.hasNext()) await this.revive();
        else this.document.acquire();
        const solution = await this.document.during(this.inner.next());
        this.taken++;
        this.more = this.inner.hasNext();
        return solution;
    }

    async graphAt(branch: number): Promise<GraphData> {
        if (!this.document.isLatest(this)) throw GONE;
        if (!this.document.owns(this.worker)) await this.revive();
        try {
            return await this.document.during(this.inner.graphAt(branch));
        } catch (error) {
            // the run ended on its worker (stopped): started again, once
            if ((error as EngineError).stopped) throw error;
            await this.revive();
            return this.document.during(this.inner.graphAt(branch));
        }
    }

    // The query solved again on the worker of now (a fresh one if need be), taken past the solutions given: what it
    // prints meanwhile was printed already
    private revive(): Promise<void> {
        this.reviving ??= (async () => {
            const worker = this.document.acquire();
            let quiet = true;
            const inner = await this.document.during(worker.solve(this.request, text => quiet || this.output(text)));
            for (let i = 0; i < this.taken; i++) await this.document.during(inner.next());
            quiet = false;
            this.worker = worker;
            this.inner = inner;
        })().finally(() => (this.reviving = null));
        return this.reviving;
    }
}
