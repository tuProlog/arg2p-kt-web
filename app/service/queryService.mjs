import * as common from "../common.js"

function queryService() {

    const arg2p = common.tuprolog.arg2p()
    const ClassicSolverFactory = common.tuprolog.classic.ClassicSolverFactory;
    const outputChannel = common.tuprolog.solve.channel.OutputChannel;
    
    
    function solverOf(outputConsumer, flagsText) {
        var flags = common.tuprolog.theory.parsing.parseTheory("?", flagsText)
        var libFlags = common.tuprolog.solve.library.Library.Companion.aliased('argumentation.flags', void 0, flags)
        return ClassicSolverFactory.mutableSolverWithDefaultBuiltinsAnd(
            ClassicSolverFactory.defaultLibraries.plus(arg2p.to2pLibraries().plus(libFlags)),
            ClassicSolverFactory.defaultFlags,
            common.tuprolog.theory.Theory.Companion.empty(),
            ClassicSolverFactory.defaultDynamicKb,
            ClassicSolverFactory.defaultInputChannel,
            outputChannel.Companion.of(outputConsumer),
            outputChannel.Companion.of(_ => { }),
            outputChannel.Companion.of(_ => { }))
    }

    function solve(theoryText, queryText, flagsText, outputConsumer) {

        if (/^\s*$/.test(queryText)) {
            throw {
                name: "Query error",
                message: "Query is a mandatory field."
            }
        }

        const solver = solverOf(outputConsumer, flagsText);
        const query = tryBlock(() => common.tuprolog.core.parsing.parseStringAsStructWithOperators(queryText, solver.operators), "Query Error");
        const theory = tryBlock(() => common.tuprolog.theory.parsing.parseTheoryWithOperators("?", theoryText, solver.operators), "Theory Error");
        solver.loadStaticKb(theory)
        const solutions = tryBlock(() => solver.solve(query), "Solve Error");
        const i = solutions.iterator();
        return { i, query, solver };
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
