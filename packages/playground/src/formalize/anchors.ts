// What ties a formalization to its text: where a passage quoted by the formalization is in the text, and where each
// statement of the theory is. Both are found again whenever the texts change, so links survive editing.

/** A stretch of a text, from [from] to [to] (offsets, [to] excluded) */
export interface Range {
    readonly from: number;
    readonly to: number;
}

/** A statement of a theory: what it is known by, and where it is */
export interface Statement extends Range {
    readonly name: string;
}

// Characters a model writing a quote back tends to change: curly quotes, dashes, ellipses, spaces
const SAME: Readonly<Record<string, string>> = {
    '‘': "'",
    '’': "'",
    '‛': "'",
    '“': '"',
    '”': '"',
    '–': '-',
    '—': '-',
    '−': '-',
    ' ': ' ',
};

// [text] lower case, its characters made the same as above and its runs of spaces made one, with where each character
// of the result was in [text]
function normalized(text: string): { text: string; at: number[] } {
    let out = '';
    const at: number[] = [];
    let space = false;
    for (let i = 0; i < text.length; i++) {
        const char = SAME[text[i]!] ?? text[i]!;
        if (/\s/.test(char)) {
            if (space || out.length === 0) continue;
            space = true;
            out += ' ';
            at.push(i);
            continue;
        }
        space = false;
        if (char === '…') {
            out += '...';
            at.push(i, i, i);
            continue;
        }
        out += char.toLowerCase();
        at.push(i);
    }
    return { text: out, at };
}

/**
 * Where [quote] is in [text]: as it is, or else with the differences a model writing it back makes (case, spaces,
 * quotes, dashes); null when it is not there. [from] is where to look from first: a passage quoted twice is taken at
 * its first place after it, when there is one.
 */
export function locate(text: string, quote: string, from = 0): Range | null {
    const wanted = quote.trim().replace(/^["'“‘]+|["'”’]+$/g, '').trim();
    if (wanted === '') return null;
    const exact = text.indexOf(wanted, from);
    if (exact !== -1) return { from: exact, to: exact + wanted.length };
    const anywhere = text.indexOf(wanted);
    if (anywhere !== -1) return { from: anywhere, to: anywhere + wanted.length };
    const haystack = normalized(text);
    const needle = normalized(wanted).text.trim();
    if (needle === '') return null;
    const start = haystack.at.findIndex(it => it >= from);
    let found = haystack.text.indexOf(needle, start === -1 ? 0 : start);
    if (found === -1) found = haystack.text.indexOf(needle);
    if (found === -1) return null;
    return { from: haystack.at[found]!, to: haystack.at[found + needle.length - 1]! + 1 };
}

// The clauses of [theory]: each ends with a full stop followed by a space or the end, outside quotes, brackets and
// comments
function clauses(theory: string): Range[] {
    const found: Range[] = [];
    let start = 0;
    let depth = 0;
    let quote: string | null = null;
    for (let i = 0; i < theory.length; i++) {
        const char = theory[i]!;
        if (quote !== null) {
            if (char === quote) quote = null;
            continue;
        }
        if (char === '%') {
            const end = theory.indexOf('\n', i);
            if (theory.slice(start, i).trim() === '') start = end === -1 ? theory.length : end + 1;
            i = end === -1 ? theory.length : end;
            continue;
        }
        if (char === "'" || char === '"') quote = char;
        else if ('([{'.includes(char)) depth++;
        else if (')]}'.includes(char)) depth = Math.max(0, depth - 1);
        else if (char === '.' && depth === 0 && (i + 1 === theory.length || /\s|%/.test(theory[i + 1]!))) {
            found.push({ from: start, to: i + 1 });
            start = i + 1;
        }
    }
    return found
        .map(it => {
            const text = theory.slice(it.from, it.to);
            const lead = text.length - text.trimStart().length;
            return { from: it.from + lead, to: it.to };
        })
        .filter(it => it.to > it.from + 1);
}

// The name a statement goes by, written once: no spaces, no full stop
export function statementKey(name: string): string {
    return name.replace(/\s+/g, '').replace(/\.$/, '');
}

/**
 * The name of the statement a link gives, as statementRanges names it: a model may give a statement whole
 * (`r1 : bird(X) => flies(X).`) rather than by its name (`r1`)
 */
export function linkKey(statement: string): string {
    const text = statement.trim().replace(/\.?$/, '.');
    const named = statementRanges(text);
    return named.length === 1 ? named[0]!.name : statementKey(statement.trim());
}

const NAMED = /^([a-z][A-Za-z0-9_]*)\s*:(?:=>|->|(?![-=]))/;
const ARGUMENT = /^([a-z][A-Za-z0-9_]*)\s*\.$/;
const ATTACK = /^([a-z][A-Za-z0-9_]*)\s*(<->|->)\s*([a-z][A-Za-z0-9_]*)\s*\.$/;
// Not statements: the flags, Prolog clauses (with a body), directives
const NOT_STATEMENT = /^(graphBuildMode|argumentLabellingMode|statementLabellingMode|graphExtension|orderingPrinciple|orderingComparator|queryMode|autoTransposition|prologStrictCompatibility|metaRules|metaConflicts|conflictModel|answerMode|graphBuilder|graphLanguage|naturalTerms|modulesPath)\b|^:-|:-/;

/**
 * The statements of [theory], each known by its name: a rule, a premise or an axiom by its own (`r1 : ...`,
 * `f1 :=> ...`, `a1 :-> ...`), an argument of an abstract framework by itself (`a.`), an attack by its arguments
 * (`a->b`, `a<->b`), and any other fact (`sup(r1, r2)`, `bp(guilty)`) by its text, spaces taken out.
 */
export function statementRanges(theory: string): Statement[] {
    return clauses(theory).flatMap(range => {
        const text = theory.slice(range.from, range.to).trim();
        const named = NAMED.exec(text);
        if (named) return [{ ...range, name: named[1]! }];
        if (NOT_STATEMENT.test(text)) return [];
        const argument = ARGUMENT.exec(text);
        if (argument) return [{ ...range, name: argument[1]! }];
        const attack = ATTACK.exec(text);
        if (attack) return [{ ...range, name: `${attack[1]}${attack[2]}${attack[3]}` }];
        return [{ ...range, name: statementKey(text) }];
    });
}
