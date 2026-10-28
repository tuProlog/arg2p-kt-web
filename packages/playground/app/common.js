// arg2p for JavaScript: its solvers, their solutions and the graphs they
// compute (core.js), and the causality module (causality.js).
const argumentation = require('@tuprolog/arg2p').it.unibo.tuprolog.argumentation

const tuprolog = {
    "arg2p": argumentation.core.js,
    "causality": argumentation.causality.js,
    "version": () => argumentation.Arg2pLibrary.version()
};

module.exports = { tuprolog }
