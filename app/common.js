// const core = require("@tuprolog/2p-full/2p-core") //.it.unibo.tuprolog.core;
// const solve = require("@tuprolog/2p-full/2p-solve") //.it.unibo.tuprolog.solve;
// const classic = require("@tuprolog/2p-full/2p-solve-classic").it.unibo.tuprolog.solve.classic;
// const theory = require("@tuprolog/2p-full/2p-theory") //.it.unibo.tuprolog.theory;
// core.parsing = require("@tuprolog/2p-full/2p-parser-core") //.it.unibo.tuprolog.core.parsing;
// theory.parsing = require("@tuprolog/2p-full/2p-parser-theory") //.it.unibo.tuprolog.theory.parsing;
const arg2p = require('@tuprolog/arg2p').it.unibo.tuprolog.argumentation

const tuprolog = {
    // "core": core,
    // "theory": theory,
    // "solve": solve,
    // "classic": classic,
    // "arg2p": arg2p.Arg2pSolverFactory,
    // "mining": arg2p.mining.mineGraph,
    "bridge": arg2p.bridge.JsBridge
};

module.exports = { tuprolog }
