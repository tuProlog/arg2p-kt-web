import * as common from "../common.js"
import * as vis from "vis-network/standalone/index.js"

function GraphModule() {

    function init(container) {
        prepareContainer(container)
        return { printGraph, clear }
    }

    function printGraph(query, solver) {
        print(solver)
    }

    function clear() {
        document.querySelector("#graph-theory").innerHTML = ""
        document.querySelector("#graph-visual").innerHTML = ""
    }

    function prepareContainer(container) {
        container.innerHTML = `
            <div class="graph-container">
                <div id="graph-theory" class="graph-text"></div>
                <div id="graph-visual" class="graph-drawing"></div>
            </div>
        `
    }

    function print(solver) {

        function _printTheory(argumentList) {

            function _format(descriptor) {
                return '<div style="font-weight:bold; overflow:hidden;">' + 
                    descriptor + '</div>'
            }

            document.querySelector("#graph-theory").innerHTML = argumentList
                .reduce((a, b) => a + _format(b.argument.descriptor), "")
        }

        function _printGraph(argumentList, attacks) {
            
            function _toInt(identifier) {
                return parseInt(identifier.substring(1))
            }

            function _toColor(labelling) {
                switch(labelling) {
                    case "in" : return "#00ff00"
                    case "out" : return "#ff0000"
                    case "und" : return "#808080"
                }
            }

            const network = new vis.Network(document.querySelector("#graph-visual"), {
                nodes: new vis.DataSet(argumentList.map(x => {
                    return {
                        id: _toInt(x.argument.identifier),
                        label: x.argument.identifier,
                        color: _toColor(x.label)
                    }
                })),
                edges: new vis.DataSet(attacks.map(x => {
                    return {
                        from: _toInt(x.attacker.identifier),
                        to: _toInt(x.target.identifier),
                        arrows: "to"
                    }
                }))
            }, {})

            network.fit()
        }

        const query = common.tuprolog.core.parsing.parseStringAsStructWithOperators("context_active(X)", solver.operators)
        const formatter = common.tuprolog.core.TermFormatter.Companion.prettyExpressionsPrettyVariablesDefaultOperators();
        const solution = parseInt(formatter.format(solver.solve(query).iterator().next().substitution.entries.toJSON()[0].value))
        const graph = common.tuprolog.mining(solver, solution)
        const labellings = getSolutions(graph.labellings.iterator())

        _printTheory(labellings)
        _printGraph(labellings, getSolutions(graph.attacks.iterator()))
    }

    return { init }
}

export default GraphModule()

function getSolutions(iterator) {
    const sol = []
    while(iterator.hasNext()) {
        sol.push(iterator.next())
    }
    return sol
}