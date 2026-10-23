import * as common from "../common.js";

const { JsArg2p, JsSolverBuilder } = common.tuprolog.arg2p;
const { JsCausality } = common.tuprolog.causality;

function queryService() {

    // The solutions of a query, one at a time: `i` iterates them, `query` is
    // the query as written, and `result.graphAt(branch)` gives the graph of
    // any stage of the computation (the context keeps a branch per stage).
    //
    // Every solution comes with the graph the solver computed for it and the
    // branch it ended in. The solver moves on at every Next, so they are read
    // as each solution arrives: the earlier ones can be shown again later.
    function solve(theoryText, queryText, flagsText, outputConsumer) {

        if (/^\s*$/.test(queryText)) {
            throw {
                name: "Query error",
                message: "Query is a mandatory field."
            }
        }

        const solver = tryBlock(() => new JsSolverBuilder()
            .theory(theoryText)
            .flags(flagsText)
            // Theories may use causality::ness/3 and the like.
            .module(JsCausality.module())
            .output(outputConsumer)
            .build(), "Theory Error");
        const query = queryText.trim().replace(/\.$/, "");
        const solutions = tryBlock(() => JsArg2p.solve(solver, query), "Query Error");

        const i = {
            hasNext: () => solutions.hasNext(),
            next: () => solutionOf(solver, solutions.next())
        };
        const result = { graphAt: branch => graphOf(JsArg2p.graphAt(solver, branch)) };
        return { i, query, result };
    }

    function solutionOf(solver, solution) {
        const { graph, context } = currentGraph(solver);
        return {
            res: solution.isYes ? "yes" : solution.isNo ? "no" : "halt",
            query: solution.query,
            substitutions: [...solution.variables].map(name => ({ first: name, second: solution.formatted(name) })),
            exception: solution.error || "",
            graph,
            context
        };
    }

    // Without a context (e.g. a plain Prolog goal that never built one) there
    // is no graph to show.
    function currentGraph(solver) {
        try {
            const context = JsArg2p.activeBranch(solver);
            return { graph: graphOf(JsArg2p.graphAt(solver, context)), context };
        } catch (error) {
            return { graph: { arguments: [], attacks: [] }, context: 0 };
        }
    }

    // Plain objects: arguments with id, descriptor and label (in, out, und),
    // attacks with from and to, and their type and the sub-argument hit.
    function graphOf(graph) {
        return {
            arguments: [...graph.arguments].map(it => ({ id: it.id, descriptor: it.descriptor, label: it.label })),
            attacks: [...graph.attacks].map(it => ({ from: it.from, to: it.to, type: it.type, on: it.on }))
        };
    }

    function tryBlock(fun, name) {
        try {
            return fun();
        } catch (err) {
            throw {
                name,
                message: formatErrorMessage(err)
            }
        }
    }

    function formatErrorMessage(err) {
        let message = '';
        message += err.name ? `${err.name}\n` : '';
        message += err.message ? `${err.message}\n` : '';
        message += err.line ? `at line ${err.line}` : '';
        return message
    }


    return { solve }
}

export default queryService()
