import type { Engine, EngineError, GraphData, Run, SolutionData, SolveRequest, SyntaxProblem } from '../engine.js';
import type { Answer, Request } from './host.js';

/** What [JsEngine] runs the solver on: a Worker, or anything that answers as one (a host of the same thread, for tests) */
export interface Channel {
    postMessage(request: Request): void;
    onmessage: ((event: { data: Answer }) => void) | null;
    terminate(): void;
}

// The worker of this module, as bundlers (Vite, webpack) find it
const spawnWorker = (): Channel =>
    new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }) as unknown as Channel;

/**
 * The engine of the browser: the solver of @tuprolog/arg2p in a worker (see host for the messages), so that the page
 * stays responsive while it works. Stopping an evaluation ends the worker (the only way to interrupt it) and starts a
 * fresh one, which warms itself up in the background.
 */
export class JsEngine implements Engine {
    private channel: Channel | null = null;
    private sequence = 0;
    // the answers waited for, by kind and id
    private readonly pending = new Map<string, { resolve(answer: Answer): void; reject(error: EngineError): void }>();
    // where the output of each query goes
    private readonly outputs = new Map<number, (text: string) => void>();

    constructor(private readonly spawn: () => Channel = spawnWorker) {}

    /** Starts the worker, and its warm-up, ahead of the first evaluation */
    start(): void {
        if (this.channel === null) this.open();
    }

    solve(request: SolveRequest, output: (text: string) => void = () => {}): Promise<Run> {
        const id = ++this.sequence;
        this.outputs.clear();
        this.outputs.set(id, output);
        return this.request({ type: 'solve', id, ...request }, `start:${id}`).then(started => {
            // every query has a first answer: yes, no or an error
            let hasNext = true;
            return {
                query: (started as Extract<Answer, { type: 'started' }>).query,
                hasNext: () => hasNext,
                next: (): Promise<SolutionData> =>
                    this.request({ type: 'next', id }, `next:${id}`).then(answer => {
                        const solution = answer as Extract<Answer, { type: 'solution' }>;
                        hasNext = solution.hasNext;
                        return solution.solution;
                    }),
                graphAt: (branch: number): Promise<GraphData> => {
                    const reqId = ++this.sequence;
                    return this.request({ type: 'graphAt', id, branch, reqId }, `graph:${reqId}`).then(
                        answer => (answer as Extract<Answer, { type: 'graph' }>).graph,
                    );
                },
            };
        });
    }

    check(text: string, kind: 'theory' | 'query'): Promise<SyntaxProblem | null> {
        const reqId = ++this.sequence;
        return this.request({ type: 'check', reqId, text, kind }, `check:${reqId}`).then(
            answer => (answer as Extract<Answer, { type: 'checked' }>).problem,
        );
    }

    stop(): void {
        this.failAll({ name: 'Stopped', message: 'The query was stopped.', syntax: null, stopped: true });
        this.restart();
    }

    private open(): void {
        const channel = this.spawn();
        channel.onmessage = event => this.receive(event.data);
        if ('onerror' in channel) {
            (channel as unknown as Worker).onerror = event => {
                event.preventDefault();
                this.failAll({ name: 'Solver error', message: event.message || 'The solver stopped working.', syntax: null });
                this.restart();
            };
        }
        this.channel = channel;
        channel.postMessage({ type: 'warmUp' });
    }

    private restart(): void {
        this.channel?.terminate();
        this.channel = null;
        this.open();
    }

    private receive(answer: Answer): void {
        if (answer.type === 'output') {
            this.outputs.get(answer.id)?.(answer.text);
            return;
        }
        const key =
            answer.type === 'graph' ? `graph:${answer.reqId}`
            : answer.type === 'checked' ? `check:${answer.reqId}`
            : answer.type === 'solution' ? `next:${answer.id}`
            : answer.type === 'started' ? `start:${answer.id}`
            : answer.type === 'failed' ? [`start:${answer.id}`, `next:${answer.id}`].find(it => this.pending.has(it))
            : undefined;
        const waiting = key === undefined ? undefined : this.pending.get(key);
        if (key === undefined || waiting === undefined) return;
        this.pending.delete(key);
        if (answer.type === 'failed') waiting.reject(answer.error);
        else waiting.resolve(answer);
    }

    private request(request: Request, key: string): Promise<Answer> {
        if (this.channel === null) this.open();
        return new Promise((resolve, reject) => {
            this.pending.set(key, { resolve, reject });
            this.channel!.postMessage(request);
        });
    }

    private failAll(error: EngineError): void {
        const waiting = [...this.pending.values()];
        this.pending.clear();
        waiting.forEach(it => it.reject(error));
    }
}
