import * as common from "../common.js";

const { JsArg2p, JsSolverBuilder, JsTheories, JsTerms } = common.tuprolog.arg2p;
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

        // The theory and the flags are both parsed when the solver is built:
        // the text the error is about tells which one.
        const solver = tryBlock(() => new JsSolverBuilder()
            .theory(theoryText)
            .flags(flagsText)
            // Theories may use causality::ness/3 and the like.
            .module(JsCausality.module())
            .output(outputConsumer)
            .build(), "Theory Error", err => err.input === flagsText && err.input !== theoryText ? "flags" : "theory");
        const query = queryText.trim().replace(/\.$/, "");
        const solutions = tryBlock(() => JsArg2p.solve(solver, query), "Query Error", () => "query");

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

    // A syntax error also says where it is (`where`: theory, query or flags).
    function tryBlock(fun, name, where) {
        try {
            return fun();
        } catch (err) {
            const syntax = syntaxError(err);
            throw {
                name,
                message: formatErrorMessage(err),
                syntax: syntax && where ? { ...syntax, where: where(err) } : null
            }
        }
    }

    // The syntax errors of a theory (or flags), or of a query, as you type:
    // null when the text parses, otherwise where and why it does not.
    function checkTheory(text) {
        return check(() => JsTheories.parse(text));
    }

    function checkQuery(text) {
        if (/^\s*$/.test(text)) return null;
        return check(() => JsTerms.parse(text.trim().replace(/\.$/, "")));
    }

    function check(parse) {
        try {
            parse();
            return null;
        } catch (err) {
            return syntaxError(err) || { line: 1, column: 1, length: 1, message: formatErrorMessage(err).trim() };
        }
    }

    // A parse error of tuProlog: its line and column (1-based), the length of
    // the token it is about, and its message without the position.
    function syntaxError(err) {
        if (!err || typeof err.line !== "number" || typeof err.column !== "number") return null;
        return {
            line: Math.max(1, err.line),
            column: Math.max(1, err.column),
            length: Math.max(1, (err.offendingSymbol || "").length),
            message: `${err.message || "Syntax error"}`.replace(/ at \d+:\d+/, "")
        };
    }

    function formatErrorMessage(err) {
        let message = '';
        message += err.name ? `${err.name}\n` : '';
        message += err.message ? `${err.message}\n` : '';
        message += err.line ? `at line ${err.line}` : '';
        return message
    }


    return { solve, checkTheory, checkQuery }
}

export default queryService()
