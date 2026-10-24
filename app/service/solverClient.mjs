// The page's side of the solver worker (see solverHost for the messages): the
// solver runs in a worker, so the page stays responsive while it works, and
// stopping a query ends the worker (the only way to interrupt it) and starts
// a fresh one. A new worker warms itself up in the background.
//
// `solve` resolves to { query, i, result } as queryService.solve gives, except
// that `i.next()` and `result.graphAt()` give promises. A stopped query
// rejects them with { stopped: true }.

let worker = null;
let sequence = 0;
// The answers waited for, by kind and id: { resolve, reject }.
const pending = new Map();
// Where the output of each query goes.
const outputs = new Map();

function spawn() {
    worker = new Worker(new URL("../solverWorker.mjs", import.meta.url));
    worker.onmessage = event => receive(event.data);
    worker.onerror = event => {
        event.preventDefault();
        failAll({ name: "Solver error", message: event.message || "The solver stopped working." });
        restart();
    };
    worker.postMessage({ type: "warmUp" });
}

function receive(message) {
    if (message.type === "output") {
        const output = outputs.get(message.id);
        if (output) output(message.text);
        return;
    }
    const key = message.type === "graph" ? `graph:${message.reqId}`
        : message.type === "solution" ? `next:${message.id}`
        : message.type === "started" ? `start:${message.id}`
        : message.type === "failed" ? [`start:${message.id}`, `next:${message.id}`].find(it => pending.has(it))
        : null;
    const waiting = key ? pending.get(key) : null;
    if (!waiting) return;
    pending.delete(key);
    if (message.type === "failed") waiting.reject(message.error);
    else waiting.resolve(message);
}

function request(message, key) {
    if (worker === null) spawn();
    return new Promise((resolve, reject) => {
        pending.set(key, { resolve, reject });
        worker.postMessage(message);
    });
}

function failAll(error) {
    const waiting = [...pending.values()];
    pending.clear();
    waiting.forEach(it => it.reject(error));
}

function restart() {
    if (worker !== null) worker.terminate();
    worker = null;
    spawn();
}

function solve(theory, query, flags, onOutput) {
    const id = ++sequence;
    outputs.clear();
    outputs.set(id, onOutput);
    return request({ type: "solve", id, theory, query, flags }, `start:${id}`).then(started => {
        // Every query has a first answer (yes, no or an error).
        let hasNext = true;
        return {
            query: started.query,
            i: {
                hasNext: () => hasNext,
                next: () => request({ type: "next", id }, `next:${id}`).then(answer => {
                    hasNext = answer.hasNext;
                    return answer.solution;
                })
            },
            result: {
                graphAt: branch => {
                    const reqId = ++sequence;
                    return request({ type: "graphAt", id, branch, reqId }, `graph:${reqId}`).then(answer => answer.graph);
                }
            }
        };
    });
}

// Stops whatever the solver is doing: what was waited for fails as stopped.
function stop() {
    failAll({ stopped: true, name: "Stopped", message: "The query was stopped." });
    restart();
}

// Starts the worker (and its warm-up) ahead of the first query.
function start() {
    if (worker === null) spawn();
}

export default { solve, stop, start }
