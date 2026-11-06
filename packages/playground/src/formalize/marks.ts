import { MARK_TONES, type EditorMark } from '@tuprolog/arg2p-ui/editor';
import { linkKey, locate, statementRanges } from './anchors.js';
import type { SourceLink } from './formalizer.js';

// The links of a formalization as the editors mark them: each statement linked has a tone, the same in the text (on
// the passages it comes from) and in the theory (on the statement itself), and the statement picked stands out in both.

/** The marks of the text and of the theory, and the links that could not be marked in either */
export interface LinkMarks {
    readonly text: EditorMark[];
    readonly theory: EditorMark[];
    /** Statements whose passage is no longer in the text (the text was edited, or the model did not quote it as it is) */
    readonly unquoted: string[];
    /** Statements linked that the theory no longer has */
    readonly gone: string[];
    /** Statements of the theory no link gives */
    readonly unlinked: string[];
}

/** The tone of each statement linked: by the order it is first linked in */
export function tonesOf(links: readonly SourceLink[]): Map<string, number> {
    const tones = new Map<string, number>();
    for (const link of links) if (!tones.has(link.statement)) tones.set(link.statement, tones.size % MARK_TONES);
    return tones;
}

/** How [links] mark [text] and [theory], the statement [selected] standing out */
export function linkMarks(text: string, theory: string, given: readonly SourceLink[], selected: string | null): LinkMarks {
    // by name, whatever the model wrote (formalizations kept before the names were read out of whole statements too)
    const links = given.map(it => ({ statement: linkKey(it.statement), quote: it.quote }));
    const tones = tonesOf(links);
    const quotes = new Map<string, string[]>();
    const textMarks: EditorMark[] = [];
    const unquoted: string[] = [];
    // a passage quoted twice is taken at its first place after the passage of the link before: links follow the text
    let after = 0;
    for (const link of links) {
        quotes.set(link.statement, [...(quotes.get(link.statement) ?? []), link.quote]);
        const range = locate(text, link.quote, after);
        if (range === null) {
            if (!unquoted.includes(link.statement)) unquoted.push(link.statement);
            continue;
        }
        after = range.to;
        textMarks.push({ key: link.statement, ...range, tone: tones.get(link.statement)!, active: link.statement === selected, title: link.statement });
    }
    const theoryMarks: EditorMark[] = [];
    const found = new Set<string>();
    for (const statement of statementRanges(theory)) {
        const tone = tones.get(statement.name);
        if (tone === undefined) continue;
        found.add(statement.name);
        theoryMarks.push({
            key: statement.name,
            from: statement.from,
            to: statement.to,
            tone,
            active: statement.name === selected,
            title: quotes.get(statement.name)!.map(it => `“${it}”`).join('\n'),
        });
    }
    const unlinked = statementRanges(theory)
        .map(it => it.name)
        .filter(it => !tones.has(it));
    return { text: textMarks, theory: theoryMarks, unquoted, gone: [...tones.keys()].filter(it => !found.has(it)), unlinked };
}
