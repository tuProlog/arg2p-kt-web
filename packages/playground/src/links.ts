import { toTheory, type Framework } from '@tuprolog/arg2p-ui/data';
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import { fromBase64url, toBase64url } from './base64url.js';
import { migratedContent, type Content } from './documents.js';

// Links to the playground as it is: the theory, query and flags of a document, packed into a single `s` parameter, a
// JSON array deflated and base64url encoded. Its first item is the version of the format, so the layout can change
// without breaking the links already shared.
//
//   version 2   [2, flags, theory, query]
//   version 1   [1, "structured", flags, theory, query] or [1, "abstract", flags, "a,b", "a-b,b-a"]
//
// The plain parameters (theory, query, flags, and mode, arguments and attacks for a framework) are read as well.

const SHARED = 's';
const VERSION = 2;

// Text most states share, handed to deflate as a preset dictionary, so that common flags and syntax cost a few bytes
// each. Written as it appears inside the JSON, hence the escaped newlines. A link can only be read back with the
// dictionary of its version: NEVER edit one, add a new version with its own dictionary instead.
const DICTIONARY_V1 = strToU8(
    [
        '[1,"structured","',
        '[1,"abstract","',
        'abstract::solve(',
        'arg2p::solve',
        ' :=> ',
        ' => ',
        ' :- ',
        ' -> ',
        '(X)',
        '(X, Y)',
        'graphBuildMode(standard_af).\\n',
        'statementLabellingMode(statement).\\n',
        'argumentLabellingMode(grounded).\\n',
        'orderingPrinciple(last).\\n',
        'orderingComparator(elitist).\\n',
        'graphExtension(standardPref).\\n',
        'queryMode.',
    ].join(''),
);

const DICTIONARY_V2 = strToU8(
    [
        '[2,"',
        'buildLabelSets(In, Out, Und)',
        'graphBuildMode(abstract).\\n',
        'graphBuildMode(aba).\\n',
        'graphBuildMode(aspic).\\n',
        'argumentLabellingMode(grounded).\\n',
        'argumentLabellingMode(preferred).\\n',
        'statementLabellingMode(statement).\\n',
        'queryMode.\\n',
        'assumption(',
        'contrary(',
        ' :=> ',
        ' => ',
        ' :- ',
        ' -> ',
        ' <-> ',
        '(X)',
        '(X, Y)',
        '\\n\\n',
    ].join(''),
);

const ATOM = /^[a-z][a-zA-Z0-9_]*$/;

/** What a link carries: the content of a document (what it states of it), and what was wrong with it */
export interface Shared {
    readonly content: Partial<Content> | null;
    readonly errors: readonly string[];
}

/** What the query string [search] shares */
export function read(search: string): Shared {
    const errors: string[] = [];
    const params = new URLSearchParams(search);
    const packed = params.get(SHARED);
    if (packed !== null) return { content: unpacked(packed, errors), errors };

    const content: { theory?: string; query?: string; flags?: string } = {};
    const flags = params.get('flags');
    const query = params.get('query');
    if (flags !== null) content.flags = migratedContent({ flags }).flags;
    if (query !== null) content.query = query;
    const mode = params.get('mode')?.trim().toLowerCase() ?? null;
    if (mode !== null && mode !== 'structured' && mode !== 'abstract') errors.push(`Unknown mode "${mode}", expected "structured" or "abstract".`);
    const framework = readFramework(params, errors);
    if (framework !== null && (mode === 'abstract' || params.get('theory') === null)) content.theory = toTheory(framework);
    else if (params.get('theory') !== null) content.theory = params.get('theory')!;
    return { content: Object.keys(content).length > 0 ? content : null, errors };
}

/** A link to the page at [base] opening [content] */
export function shareUrl(content: Content, base: string): string {
    const url = new URL(base);
    url.search = '';
    url.hash = '';
    const state = [VERSION, content.flags, content.theory, content.query];
    url.searchParams.set(SHARED, toBase64url(deflateSync(strToU8(JSON.stringify(state)), { level: 9, dictionary: DICTIONARY_V2 })));
    return url.toString();
}

function unpacked(packed: string, errors: string[]): Partial<Content> | null {
    let bytes: Uint8Array;
    try {
        bytes = fromBase64url(packed);
    } catch {
        errors.push('The shared state in the link is damaged and was ignored.');
        return null;
    }
    for (const [version, dictionary] of [[VERSION, DICTIONARY_V2], [1, DICTIONARY_V1]] as const) {
        let state: unknown;
        try {
            state = JSON.parse(strFromU8(inflateSync(bytes, { dictionary })));
        } catch {
            continue;
        }
        if (!Array.isArray(state) || state[0] !== version) continue;
        return version === VERSION ? fromVersion2(state) : fromVersion1(state, errors);
    }
    // read with no dictionary, to tell a version this page does not know from a damaged link
    try {
        const state: unknown = JSON.parse(strFromU8(inflateSync(bytes)));
        if (Array.isArray(state) && typeof state[0] === 'number') {
            errors.push('The shared state in the link comes from an unsupported version and was ignored.');
            return null;
        }
    } catch {
        // damaged
    }
    errors.push('The shared state in the link is damaged and was ignored.');
    return null;
}

function fromVersion2(state: unknown[]): Partial<Content> {
    const [, flags, theory, query] = state;
    const content: { theory?: string; query?: string; flags?: string } = {};
    if (typeof flags === 'string') content.flags = flags;
    if (typeof theory === 'string') content.theory = theory;
    if (typeof query === 'string') content.query = query;
    return content;
}

function fromVersion1(state: unknown[], errors: string[]): Partial<Content> {
    const [, mode, flags, first, second] = state;
    const text = (it: unknown) => (typeof it === 'string' ? it : undefined);
    if (mode === 'abstract') {
        const params = new URLSearchParams();
        if (text(first) !== undefined) params.set('arguments', text(first)!);
        if (text(second) !== undefined) params.set('attacks', text(second)!);
        const framework = readFramework(params, errors) ?? { arguments: [], attacks: [] };
        return migratedContent({ mode: 'abstract', flags: text(flags), abstractGraph: framework });
    }
    return migratedContent({ mode: 'structured', flags: text(flags), theory: text(first), query: text(second) });
}

// A framework of the parameters arguments (`a,b` or `a;b`) and attacks (`a-b` or `a>b`): the arguments attacks name
// are arguments as well
function readFramework(params: URLSearchParams, errors: string[]): Framework | null {
    const rawArguments = params.get('arguments');
    const rawAttacks = params.get('attacks');
    if (rawArguments === null && rawAttacks === null) return null;
    const atom = (name: string) => {
        if (ATOM.test(name)) return true;
        errors.push(`Ignored invalid argument name "${name}", expected a Prolog atom (e.g. "a1").`);
        return false;
    };
    const args = items(rawArguments).filter(atom);
    const attacks = items(rawAttacks)
        .map(it => it.split(/[->]/).map(side => side.trim()))
        .filter(it => {
            if (it.length === 2) return it.every(atom);
            errors.push(`Ignored malformed attack "${it.join('-')}", expected "attacker-attacked".`);
            return false;
        })
        .map(([from, to]) => ({ from, to }));
    attacks.forEach(({ from, to }) => [from, to].filter(it => !args.includes(it)).forEach(it => args.push(it)));
    return { arguments: args, attacks };
}

function items(raw: string | null): string[] {
    return (raw ?? '')
        .split(/[,;]/)
        .map(it => it.trim())
        .filter(it => it.length > 0);
}
