const STRUCTURED = "structured";
const ABSTRACT = "abstract";

// Argument names end up inside a Prolog query, so they have to be plain atoms.
const ATOM = /^[a-z][a-zA-Z_0-9]*$/;

// `arguments` and `attacks` accept both `,` and `;` as separators, `attacks`
// accepts both `a-b` and `a>b` as the attacker/attacked separator.
const ITEM_SEPARATOR = /[,;]/;
const ATTACK_SEPARATOR = /[->]/;

function urlParamsService() {

    function read(search) {
        const params = new URLSearchParams(search !== undefined ? search : window.location.search);
        const errors = [];
        const abstractGraph = readAbstractGraph(params, errors);
        return {
            mode: readMode(params, errors),
            theory: params.get("theory"),
            query: params.get("query"),
            flags: params.get("flags"),
            abstractGraph,
            errors
        };
    }

    function readMode(params, errors) {
        const mode = params.get("mode");
        if (mode === null) return null;
        const normalized = mode.trim().toLowerCase();
        if (normalized !== STRUCTURED && normalized !== ABSTRACT) {
            errors.push(`Unknown mode "${mode}", expected "${STRUCTURED}" or "${ABSTRACT}".`);
            return null;
        }
        return normalized;
    }

    function readAbstractGraph(params, errors) {
        const rawArguments = params.get("arguments");
        const rawAttacks = params.get("attacks");
        if (rawArguments === null && rawAttacks === null) return null;

        const args = splitItems(rawArguments)
            .filter(it => checkAtom(it, errors));

        const attacks = splitItems(rawAttacks)
            .map(it => it.split(ATTACK_SEPARATOR).map(side => side.trim()))
            .filter(it => {
                if (it.length !== 2) {
                    errors.push(`Ignored malformed attack "${it.join("-")}", expected "attacker-attacked".`);
                    return false;
                }
                return it.every(side => checkAtom(side, errors));
            })
            .map(([from, to]) => ({ from, to }));

        // Arguments only mentioned by an attack are still part of the graph.
        const names = args.slice();
        attacks.forEach(({ from, to }) => [from, to]
            .filter(it => !names.includes(it))
            .forEach(it => names.push(it)));

        return { arguments: names, attacks };
    }

    function splitItems(raw) {
        if (!raw) return [];
        return raw.split(ITEM_SEPARATOR).map(it => it.trim()).filter(it => it.length > 0);
    }

    function checkAtom(name, errors) {
        if (ATOM.test(name)) return true;
        errors.push(`Ignored invalid argument name "${name}", expected a Prolog atom (e.g. "a1").`);
        return false;
    }

    function shareUrl(state, base) {
        const url = new URL(base !== undefined ? base : window.location.href);
        url.search = "";
        const params = url.searchParams;
        params.set("mode", state.mode);
        params.set("flags", state.flags);
        if (state.mode === ABSTRACT) {
            params.set("arguments", state.abstractGraph.arguments.join(","));
            params.set("attacks", state.abstractGraph.attacks.map(a => `${a.from}-${a.to}`).join(","));
        } else {
            params.set("theory", state.theory);
            params.set("query", state.query);
        }
        return url.toString();
    }

    return { read, shareUrl, STRUCTURED, ABSTRACT }
}

export default urlParamsService()
