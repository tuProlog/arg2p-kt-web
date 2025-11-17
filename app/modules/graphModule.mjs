import * as vis from "vis-network/standalone/esm/vis-network.js"

function GraphModule() {

    function init(container) {
        prepareContainer(container)
        return { printGraph, clear }
    }

    function printGraph(graph) {
        print(graph)
    }

    function clear() {
        document.querySelector("#graph-theory").innerHTML = ""
        document.querySelector("#graph-visual").innerHTML = ""
    }

    function prepareContainer(container) {
    container.innerHTML = `
        <div class="graph-container" 
             style="display:flex; height:100%; width:100%; overflow:hidden;">
            
            <!-- Resizable theory panel -->
            <div id="graph-theory" 
                style="width:250px;             /* initial width */
                       min-width:150px; 
                       max-width:100%; 
                       overflow-y:auto; 
                       padding:10px; 
                       border-right:2px solid #ddd; 
                       resize:horizontal; 
                       height:100%;">
            </div>
            
            <!-- Graph panel -->
            <div id="graph-visual" 
                style="flex:1; 
                       min-height:0; 
                       position:relative; 
                       overflow:hidden; 
                       width:100%; 
                       height:100%;">
            </div>
        </div>
    `;
}

    function print(graph) {

        function _toColor(labelling) {
            switch(labelling) {
                case "in" : return "#008080"
                case "out" : return "#800000"
                case "und" : return "#808080"
            }
        }

        function _toInt(identifier) {
            return parseInt(identifier.substring(1))
        }

        function _printTheory(argumentList) {

            function _format(descriptor, color) {
                return '<div style="padding-left:20px;text-indent:-20px;color:' + color + '">' + 
                    descriptor + '</div>'
            }

            const sortedArguments = argumentList.slice().sort((a, b) => {
                if (_toInt(a.id) < _toInt(b.id)) return -1;
                return 1;
            });

            document.querySelector("#graph-theory").innerHTML = sortedArguments
                .reduce((a, b) => a + _format(b.descriptor, _toColor(b.label)), "")
                //.replace(/'/g, "").replace(/:/g, "  :  ").replace(/,/g, ", ");
        }

        function _printGraph(argumentList, attacks) {
            const network = new vis.Network(document.querySelector("#graph-visual"), {
                nodes: new vis.DataSet(argumentList.map(x => {
                    return {
                        id: _toInt(x.id),
                        label: x.id,
                        color: _toColor(x.label),
                        font: {
                            color: "#ffffff",
                        }
                    }
                })),
                edges: new vis.DataSet(attacks.map(x => {
                    return {
                        from: _toInt(x.from),
                        to: _toInt(x.to),
                        arrows: "to"
                    }
                })),
            }, {
                autoResize: true,
                height: "100%",
                width: "100%"
            })

            network.fit()
        }

        // const query = common.tuprolog.core.parsing.parseStringAsStructWithOperators("context_active(X)", solver.operators)
        // const formatter = common.tuprolog.core.TermFormatter.Companion.prettyExpressionsPrettyVariablesDefaultOperators();
        // const solution = parseInt(formatter.format(solver.solve(query).iterator().next().substitution.entries.toJSON()[0].value))
        // const graph = common.tuprolog.mining(solver, solution)
        // const labellings = getSolutions(graph.labellings.iterator())

        _printTheory(graph.arguments)
        _printGraph(graph.arguments, graph.attacks)
    }

    return { init }
}

export default GraphModule()
