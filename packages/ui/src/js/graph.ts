import type { Graph } from '@tuprolog/arg2p';
import type { GraphData } from '../engine.js';

// The graphs of @tuprolog/arg2p as the components read them: of a solver of the page (see host), or of a cluster of
// the parallel solver. The solver itself is not loaded with it.

/** A graph of the API as plain data, read in [profile] */
export function graphData(graph: Graph, profile = ''): GraphData {
    return {
        profile,
        arguments: graph.labellings.map(({ argument, label }) => ({
            id: argument.identifier,
            descriptor: argument.descriptor,
            conclusion: argument.conclusion,
            topRule: argument.topRule,
            label,
            supports: argument.supports.map(it => it.identifier),
        })),
        attacks: graph.attacks.map(it => ({
            from: it.attacker.identifier,
            to: it.target.identifier,
            type: it.type ?? null,
            on: it.on?.identifier ?? null,
        })),
    };
}
