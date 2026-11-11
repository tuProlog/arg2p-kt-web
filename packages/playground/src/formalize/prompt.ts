import type { Message } from './openrouter.js';
import type { Skill } from './skill.js';

// What the model is asked: to formalize a text as the skill arg2p-formalize says, in the framework the user picked,
// and to answer at once in one JSON object (it runs no tool here), every statement with the passage of the text it
// formalizes.

/** The framework the user picked: a structured theory (rules, premises, ...), or an abstract framework */
export type Framework = 'structured' | 'abstract';

/** What the model answers (see SCHEMA) */
export interface Answer {
    readonly title: string;
    readonly profile: string;
    readonly theory: string;
    readonly flags: string;
    readonly links: readonly { readonly statement: string; readonly quote: string }[];
    readonly glossary: readonly { readonly term: string; readonly meaning: string }[];
    readonly ledger: readonly { readonly point: string; readonly readings: string; readonly chosen: string }[];
    readonly notes: string;
}

const pairs = (fields: Record<string, string>) => ({
    type: 'array',
    items: {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(fields),
        properties: Object.fromEntries(Object.entries(fields).map(([name, description]) => [name, { type: 'string', description }])),
    },
});

/** The JSON schema of the answer, strict: every field there, none other */
export const SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'profile', 'theory', 'flags', 'links', 'glossary', 'ledger', 'notes'],
    properties: {
        title: { type: 'string', description: 'A short title of the text, two to five words, in its language' },
        profile: { type: 'string', description: 'The profile of the theory, as its graphBuildMode line states it' },
        theory: { type: 'string', description: 'The whole theory, its graphBuildMode line first' },
        flags: { type: 'string', description: 'Flags beyond the defaults, as Prolog facts, or empty' },
        links: pairs({
            statement: 'The name of a statement of the theory, never the statement itself: r1 for the rule r1 : a => b., f1 for the premise f1 :=> a.; an abstract argument; an attack a->b; another fact as written, sup(r1,r2) say',
            quote: 'The passage of the text it formalizes, or that implies it, copied character for character; empty only for an assumption with no ground in the text',
        }),
        glossary: pairs({ term: 'A term or rule name of the theory', meaning: 'What it stands for, in the words of the text' }),
        ledger: pairs({ point: 'A point the text leaves open', readings: 'Its possible readings', chosen: 'The reading chosen, and why' }),
        notes: { type: 'string', description: 'Anything else the user should know, briefly' },
    },
} as const;

const FRAMEWORKS: Record<Framework, string> = {
    structured:
        'Write a structured theory: choose its profile as the method says (aspicPlus unless the text calls for another: aspic, aspicDefeasible, aba, abaPlus, meta). Never the profile abstract.',
    abstract:
        'Write an abstract framework, with graphBuildMode(abstract).: every self-contained position or claim of the text is an argument, named by a short lowercase atom saying what it is (raise_taxes, say); every objection, rebuttal or incompatibility is an attack (a -> b, or a <-> b when both ways). No rules, premises or preferences.',
};

/** The messages asking for a formalization of [text] in [framework], with the method of [skill] */
export function request(text: string, framework: Framework, skill: Skill): Message[] {
    const references = Object.entries(skill.references)
        .map(([name, body]) => `<reference name="${name}">\n${body.trim()}\n</reference>`)
        .join('\n\n');
    const system = `You formalize a text in natural language as an Arg2P argumentation theory, inside the Arg2P web playground. Follow the method below (the skill arg2p-formalize of Arg2P ${skill.version}) for the formalization itself. You run no tool here, and no solver: answer at once, with one JSON object.

<method>
${skill.instructions.trim()}
</method>

${references}

How to answer here:
- Framework: ${FRAMEWORKS[framework]}
- theory: the whole theory, its graphBuildMode line first, one statement per line, with a short % comment where it helps. Every rule, premise and axiom is named.
- title: a short title of the text, two to five words, in its language (Marco's Friday at home, say).
- links: one entry per statement of the theory: every rule, premise and axiom by its name alone (r1, never r1 : a => b); for an abstract framework, every argument by its name and every attack as a->b (a<->b when mutual); any other fact (sup(r1, r2), say) written as in the theory. Its quote is the passage of the text the statement formalizes, copied character for character from the text: one contiguous stretch, as short as identifies it (a clause, a sentence). A statement the text implies rather than says (employee(marco), from "Marco is on probation", say) has the passage it is drawn from. Only a statement with no ground in the text at all, an assumption of yours, has the quote "": say so in the notes. Never quote what is not in the text.
- flags: the flags the theory needs beyond the defaults (argumentLabellingMode(preferred). for several labellings, say), as Prolog facts, or "".
- glossary, ledger (the interpretation ledger of the method: the points the text leaves open, their readings, the one chosen) and notes: as the method says, briefly, in the language of the text.`;
    return [
        { role: 'system', content: system },
        { role: 'user', content: `The text to formalize:\n\n<text>\n${text}\n</text>` },
    ];
}

/** What tells the model its answer does not work, to have it again, fixed */
export function repair(answer: string, problem: string): Message[] {
    return [
        { role: 'assistant', content: answer },
        { role: 'user', content: `That does not work in Arg2P: ${problem}\nGive the whole answer again, fixed, as one JSON object of the same form.` },
    ];
}

/** [content], the text of an answer, read as one: null when it is not (with a reason) */
export function readAnswer(content: string): Answer | string {
    let data: unknown;
    try {
        // a model may still wrap its JSON in a fence
        data = JSON.parse(content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
        return 'the answer is not JSON.';
    }
    const it = data as Partial<Record<keyof Answer, unknown>>;
    const text = (value: unknown) => (typeof value === 'string' ? value : '');
    const list = <T>(value: unknown, keys: readonly string[]): T[] =>
        Array.isArray(value) ? (value.filter(item => item !== null && typeof item === 'object' && keys.every(key => typeof (item as Record<string, unknown>)[key] === 'string')) as T[]) : [];
    if (typeof it.theory !== 'string' || it.theory.trim() === '') return 'the answer has no theory.';
    return {
        title: text(it.title).trim(),
        profile: text(it.profile),
        theory: it.theory,
        flags: text(it.flags),
        links: list(it.links, ['statement', 'quote']),
        glossary: list(it.glossary, ['term', 'meaning']),
        ledger: list(it.ledger, ['point', 'readings', 'chosen']),
        notes: text(it.notes),
    };
}
