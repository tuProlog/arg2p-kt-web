// Abstract mode has no theory: the whole framework is passed to the
// `abstract::solve/5` predicate, which labels the arguments according to the
// semantics selected through the `argumentLabellingMode` flag.
function abstractQueryService() {

    function buildQuery(graph) {
        if (graph.arguments.length === 0) {
            throw {
                name: "Graph error",
                message: "Draw at least one argument before running the solver."
            }
        }
        const argumentList = `[${graph.arguments.join(", ")}]`;
        const attackList = `[${graph.attacks.map(it => `(${it.from}, ${it.to})`).join(", ")}]`;
        return `abstract::solve(${argumentList}, ${attackList}, In, Out, Und)`;
    }

    // The bridged graph identifies arguments as A0, A1, ... and carries the
    // drawn name as the conclusion, i.e. the last field of the descriptor.
    function argumentName(bridgedArgument) {
        const fields = bridgedArgument.descriptor.split(" : ");
        return fields[fields.length - 1].trim();
    }

    return { buildQuery, argumentName }
}

export default abstractQueryService()
