import * as queryService from './queryService.mjs';
import examples from '../examples.mjs';

// The solver's side of the solver worker (see solverWorker and solverClient):
// it answers messages, posting its answers with `post`. Kept apart from the
// worker so that it can run, and be tested, anywhere.
//
//   { type: "warmUp" }                        -> { type: "warm" }
//   { type: "solve", id, theory, query, flags } -> { type: "started", id, query }
//                                                or { type: "failed", id, error }
//                                                and { type: "output", id, text } as it prints
//   { type: "next", id }                      -> { type: "solution", id, solution, hasNext }
//   { type: "graphAt", id, branch, reqId }    -> { type: "graph", reqId, graph }
//
// Only the latest query is kept: a new one replaces it.

const WARM_UP_FLAGS = [
    'graphBuildMode(standard_af).', 'statementLabellingMode(statement).', 'argumentLabellingMode(grounded).',
    'orderingPrinciple(last).', 'orderingComparator(elitist).', 'graphExtension(standardPref).', 'queryMode.'
].join('\n');

const NO_GRAPH = { arguments: [], attacks: [] };

function createSolverHost(post) {
    let current = null;

    function handle(message) {
        switch (message.type) {
            case "warmUp": return warmUp();
            case "solve": return solve(message);
            case "next": return next(message);
            case "graphAt": return graphAt(message);
        }
    }

    // The first solve is much slower than the next ones: code is compiled and
    // initialised on first use. Done unseen, in the background.
    function warmUp() {
        try {
            const { i } = queryService.default.solve(examples.tweety.theory, 'arg2p::solve', WARM_UP_FLAGS, () => { });
            if (i.hasNext()) i.next();
        } catch (error) {
            // Only a warm-up.
        }
        post({ type: "warm" });
    }

    function solve({ id, theory, query, flags }) {
        try {
            const { i, query: written, result } = queryService.default
                .solve(theory, query, flags, text => post({ type: "output", id, text }));
            current = { id, i, result };
            post({ type: "started", id, query: written });
        } catch (error) {
            current = null;
            post({ type: "failed", id, error: plainError(error) });
        }
    }

    // A solution, and whether there is another one (computed now, as the
    // solver only knows it by looking for it).
    function next({ id }) {
        if (current === null || current.id !== id) {
            return post({ type: "failed", id, error: { name: "Error", message: "This query is no longer running." } });
        }
        let solution;
        let hasNext = false;
        try {
            solution = current.i.next();
            hasNext = current.i.hasNext();
        } catch (error) {
            solution = solution || { res: "halt", query: "", substitutions: [], exception: plainError(error).message, graph: NO_GRAPH, context: 0 };
        }
        post({ type: "solution", id, solution, hasNext });
    }

    function graphAt({ id, branch, reqId }) {
        let graph = NO_GRAPH;
        try {
            if (current !== null && current.id === id) graph = current.result.graphAt(branch);
        } catch (error) {
            // A stage that cannot be read shows as empty.
        }
        post({ type: "graph", reqId, graph });
    }

    return { handle };
}

// What crosses the worker's boundary must be plain data.
function plainError(error) {
    return {
        name: error && error.name ? `${error.name}` : "Error",
        message: error && error.message ? `${error.message}` : `${error}`,
        syntax: error && error.syntax ? { ...error.syntax } : null
    };
}

export { createSolverHost }
