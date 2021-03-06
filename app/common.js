
const core = require("@tuprolog/2p-core").it.unibo.tuprolog.core;
const solve = require("@tuprolog/2p-solve").it.unibo.tuprolog.solve;
const classic = require("@tuprolog/2p-solve-classic").it.unibo.tuprolog.solve.classic;
const theory = require("@tuprolog/2p-theory").it.unibo.tuprolog.theory;
core.parsing = require("@tuprolog/2p-parser-core").it.unibo.tuprolog.core.parsing;
theory.parsing = require("@tuprolog/2p-parser-theory").it.unibo.tuprolog.theory.parsing;
const arg2p = require('@tuprolog/arg2p-core').it.unibo.tuprolog.argumentation.core

const tuprolog = {
    "core": core,
    "theory": theory,
    "solve": solve,
    "classic": classic,
    "arg2p": arg2p.Arg2pSolver.Companion,
    "mining": arg2p.mining.mineGraph
};

module.exports = { tuprolog }