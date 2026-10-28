// An argument descriptor, as produced by the solver, reads
//
//     A7 : A5,d1(tweety) : flies(tweety)
//
// that is the argument id, its direct sub-arguments followed by its top rule,
// and its conclusion. Facts have no sub-arguments: `A0 : f1 : penguin(tweety)`.

const ARGUMENT_ID = /^A\d+$/;

// Splits on `separator` where it is not nested in brackets or quotes.
function splitTopLevel(text, separator) {
    const parts = [];
    let depth = 0;
    let quoted = false;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "'") quoted = !quoted;
        if (quoted) continue;
        if ("([{".includes(char)) depth++;
        else if (")]}".includes(char)) depth--;
        else if (depth === 0 && text.startsWith(separator, i)) {
            parts.push(text.slice(start, i));
            start = i + separator.length;
            i += separator.length - 1;
        }
    }
    parts.push(text.slice(start));
    return parts.map(it => it.trim());
}

// `'-'(flies(tweety))` is the strong negation the theory writes as `-flies(tweety)`.
function prettyTerm(term) {
    const text = term.trim();
    if (text.startsWith("'-'(") && text.endsWith(")")) {
        return "-" + prettyTerm(text.slice(4, -1));
    }
    return text;
}

function parseDescriptor(descriptor) {
    const [id, body = "", ...conclusion] = splitTopLevel(descriptor, " : ");
    const premises = splitTopLevel(body, ",").filter(it => it.length > 0);
    return {
        id,
        subArguments: premises.filter(it => ARGUMENT_ID.test(it)),
        rule: premises.filter(it => !ARGUMENT_ID.test(it)).join(", "),
        conclusion: prettyTerm(conclusion.join(" : "))
    };
}

// The support relation of a graph: every argument is supported by its direct
// sub-arguments. Only arguments in the graph are kept.
function supportsOf(argumentList) {
    const ids = new Set(argumentList.map(it => it.id));
    return argumentList.flatMap(it => parseDescriptor(it.descriptor).subArguments
        .filter(sub => ids.has(sub))
        .map(sub => ({ from: sub, to: it.id })));
}

// The row of every argument in a layered drawing: facts are on row 0, and an
// argument sits one row above the highest of its sub-arguments.
function levelsOf(argumentList) {
    const subArguments = new Map(argumentList
        .map(it => [it.id, parseDescriptor(it.descriptor).subArguments]));
    const levels = new Map();
    const levelOf = (id, visiting) => {
        if (levels.has(id)) return levels.get(id);
        // Sub-arguments missing from the graph, or (defensively) a cycle,
        // do not raise the level.
        if (!subArguments.has(id) || visiting.has(id)) return -1;
        visiting.add(id);
        const level = 1 + Math.max(-1, ...subArguments.get(id).map(sub => levelOf(sub, visiting)));
        visiting.delete(id);
        levels.set(id, level);
        return level;
    };
    argumentList.forEach(it => levelOf(it.id, new Set()));
    return levels;
}

export { parseDescriptor, prettyTerm, supportsOf, levelsOf }
