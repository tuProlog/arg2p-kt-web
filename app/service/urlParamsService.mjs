import { deflateSync, inflateSync, strToU8, strFromU8 } from 'fflate';

const STRUCTURED = "structured";
const ABSTRACT = "abstract";

// Argument names end up inside a Prolog query, so they have to be plain atoms.
const ATOM = /^[a-z][a-zA-Z_0-9]*$/;

// `arguments` and `attacks` accept both `,` and `;` as separators, `attacks`
// accepts both `a-b` and `a>b` as the attacker/attacked separator.
const ITEM_SEPARATOR = /[,;]/;
const ATTACK_SEPARATOR = /[->]/;

// Shared links pack the whole state into the single `s` parameter: a JSON
// array, deflated and base64url encoded. The leading number is the format
// version, so the layout can change without breaking links already shared.
// Links made with the plain parameters above are still read as they are.
const SHARED_STATE = "s";
const FORMAT_VERSION = 1;

// Text that most states share, handed to deflate as a preset dictionary so
// the default flags and common syntax cost a few bytes each. It is written as
// it appears inside the JSON, hence the escaped newlines. Links made with a
// version can only be read back with the same dictionary: NEVER edit this
// one, add a new version with its own dictionary instead.
const DICTIONARY_V1 = strToU8([
    '[1,"structured","', '[1,"abstract","',
    'abstract::solve(', 'arg2p::solve', ' :=> ', ' => ', ' :- ', ' -> ', '(X)', '(X, Y)',
    'graphBuildMode(standard_af).\\n',
    'statementLabellingMode(statement).\\n',
    'argumentLabellingMode(grounded).\\n',
    'orderingPrinciple(last).\\n',
    'orderingComparator(elitist).\\n',
    'graphExtension(standardPref).\\n',
    'queryMode.',
].join(''));

function urlParamsService() {

    function read(search) {
        const errors = [];
        const params = expandSharedState(
            new URLSearchParams(search !== undefined ? search : window.location.search), errors);
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

    // Turns a compact `s` parameter back into the plain ones, so both kinds of
    // link go through the same validation.
    function expandSharedState(params, errors) {
        const packed = params.get(SHARED_STATE);
        if (packed === null) return params;
        let state;
        try {
            state = JSON.parse(strFromU8(inflateSync(fromBase64Url(packed), { dictionary: DICTIONARY_V1 })));
        } catch (error) {
            errors.push("The shared state in the link is damaged and was ignored.");
            return new URLSearchParams();
        }
        if (!Array.isArray(state) || state[0] !== FORMAT_VERSION) {
            errors.push("The shared state in the link comes from an unsupported version and was ignored.");
            return new URLSearchParams();
        }
        const [, mode, flags, first, second] = state;
        const expanded = new URLSearchParams();
        const set = (name, value) => { if (typeof value === "string") expanded.set(name, value); };
        set("mode", mode);
        set("flags", flags);
        if (mode === ABSTRACT) {
            set("arguments", first);
            set("attacks", second);
        } else {
            set("theory", first);
            set("query", second);
        }
        return expanded;
    }

    function toBase64Url(bytes) {
        let binary = "";
        bytes.forEach(it => binary += String.fromCharCode(it));
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function fromBase64Url(text) {
        const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
        return Uint8Array.from(binary, it => it.charCodeAt(0));
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
        const packed = state.mode === ABSTRACT
            ? [FORMAT_VERSION, state.mode, state.flags,
                state.abstractGraph.arguments.join(","),
                state.abstractGraph.attacks.map(a => `${a.from}-${a.to}`).join(",")]
            : [FORMAT_VERSION, state.mode, state.flags, state.theory, state.query];
        url.searchParams.set(SHARED_STATE,
            toBase64Url(deflateSync(strToU8(JSON.stringify(packed)), { level: 9, dictionary: DICTIONARY_V1 })));
        return url.toString();
    }

    return { read, shareUrl, STRUCTURED, ABSTRACT }
}

export default urlParamsService()
