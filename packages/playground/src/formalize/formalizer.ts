import type { SyntaxProblem } from '@tuprolog/arg2p-ui/data';
import { linkKey } from './anchors.js';
import { complete, type Message, type ModelSettings, type Post, type Tokens } from './openrouter.js';
import { readAnswer, repair, request, SCHEMA, type Answer, type Framework } from './prompt.js';
import type { Skill } from './skill.js';

// A text formalized: a model asked as prompt.ts says, its answer checked by the engine of the page (the theory parses,
// the profile is the framework picked), and asked again, fixed, when it does not hold. The query is not the model's:
// a theory formalized is solved with arg2p::solve(In, Out, Und).

/** How many answers a formalization asks for at most: the first, and the ones fixed */
export const ATTEMPTS = 3;

/** A statement of a formalized theory, and the passage of the text it formalizes */
export interface SourceLink {
    readonly statement: string;
    readonly quote: string;
}

/** What a formalization gives besides the theory: kept with the document, for the links and the notes */
export interface Formalization {
    readonly framework: Framework;
    readonly links: readonly SourceLink[];
    readonly glossary: Answer['glossary'];
    readonly ledger: Answer['ledger'];
    readonly notes: string;
    readonly model: string;
    /** What the requests cost, in US dollars, when OpenRouter told it */
    readonly cost: number | null;
    /** The provider that gave the last answer, when told */
    readonly provider?: string;
    /** How long the formalization took, in seconds */
    readonly seconds?: number;
    /** The tokens of all its requests, when told */
    readonly tokens?: Tokens;
}

/** A text formalized: the theory and flags (it is solved with arg2p::solve(In, Out, Und), always), and the formalization */
export interface Formalized {
    /** A short title of the text, '' when the model gave none */
    readonly title: string;
    readonly theory: string;
    readonly flags: string;
    readonly formalization: Formalization;
}

/** [value] as a formalization (one from a link, say: nothing is taken on trust), or null when it is not one */
export function readFormalization(value: unknown): Formalization | null {
    if (value === null || typeof value !== 'object') return null;
    const it = value as Record<string, unknown>;
    const pairs = <T>(list: unknown, keys: readonly string[]): T[] =>
        Array.isArray(list) ? (list.filter(item => item !== null && typeof item === 'object' && keys.every(key => typeof (item as Record<string, unknown>)[key] === 'string')) as T[]) : [];
    if (!Array.isArray(it.links)) return null;
    return {
        framework: it.framework === 'abstract' ? 'abstract' : 'structured',
        links: pairs<SourceLink>(it.links, ['statement', 'quote']).map(link => ({ statement: link.statement, quote: link.quote })),
        glossary: pairs(it.glossary, ['term', 'meaning']),
        ledger: pairs(it.ledger, ['point', 'readings', 'chosen']),
        notes: typeof it.notes === 'string' ? it.notes : '',
        model: typeof it.model === 'string' ? it.model : '',
        cost: typeof it.cost === 'number' ? it.cost : null,
        ...(typeof it.provider === 'string' ? { provider: it.provider } : {}),
        ...(typeof it.seconds === 'number' ? { seconds: it.seconds } : {}),
        ...(readTokens(it.tokens) === null ? {} : { tokens: readTokens(it.tokens)! }),
    };
}

function readTokens(value: unknown): Tokens | null {
    if (value === null || typeof value !== 'object') return null;
    const it = value as Record<string, unknown>;
    return typeof it.prompt === 'number' && typeof it.completion === 'number' && typeof it.reasoning === 'number'
        ? { prompt: it.prompt, completion: it.completion, reasoning: it.reasoning }
        : null;
}

// [a] and [b] added up, either of them unknown
function added(a: Tokens | undefined, b: Tokens | undefined): Tokens | undefined {
    if (a === undefined || b === undefined) return a ?? b;
    return { prompt: a.prompt + b.prompt, completion: a.completion + b.completion, reasoning: a.reasoning + b.reasoning };
}

export interface FormalizeOptions {
    readonly text: string;
    readonly framework: Framework;
    readonly settings: ModelSettings;
    /** The method, downloaded */
    readonly skill: () => Promise<Skill>;
    /** What checks a theory or a query, as the editors do */
    readonly check: (text: string, kind: 'theory' | 'query') => Promise<SyntaxProblem | null>;
    /** The profile a theory (with flags) is read in */
    readonly profileOf: (theory: string, flags: string) => string;
    readonly post: Post;
    readonly signal?: AbortSignal;
    /** Told what is going on: downloading the method, asking, fixing */
    readonly progress?: (step: string) => void;
    /** The time, in milliseconds */
    readonly now?: () => number;
}

/** A formalization of the text of [options], or an error saying why there is none */
export async function formalize(options: FormalizeOptions): Promise<Formalized> {
    const { text, framework, settings, signal } = options;
    if (text.trim() === '') throw new Error('There is no text to formalize.');
    const now = options.now ?? (() => Date.now());
    const started = now();
    options.progress?.('Downloading the method');
    const skill = await options.skill();
    const messages: Message[] = request(text, framework, skill);
    let cost: number | null = null;
    let tokens: Tokens | undefined;
    let problem = '';
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        options.progress?.(attempt === 1 ? `Asking ${settings.model}` : `Fixing the answer (${attempt}/${ATTEMPTS}): ${problem}`);
        const completion = await complete(settings, messages, SCHEMA, options.post, signal);
        if (completion.cost !== null) cost = (cost ?? 0) + completion.cost;
        tokens = added(tokens, completion.tokens);
        const answer = readAnswer(completion.content);
        problem = typeof answer === 'string' ? answer : await failure(answer, framework, options);
        if (problem === '' && typeof answer !== 'string') {
            return {
                title: answer.title,
                theory: answer.theory.trim() + '\n',
                flags: answer.flags.trim(),
                formalization: {
                    framework,
                    links: answer.links
                        .filter(it => it.statement.trim() !== '' && it.quote.trim() !== '')
                        .map(it => ({ statement: linkKey(it.statement), quote: it.quote })),
                    glossary: answer.glossary,
                    ledger: answer.ledger,
                    notes: answer.notes.trim(),
                    model: completion.model,
                    cost,
                    ...(completion.provider === undefined ? {} : { provider: completion.provider }),
                    seconds: Math.round((now() - started) / 100) / 10,
                    ...(tokens === undefined ? {} : { tokens }),
                },
            };
        }
        messages.push(...repair(completion.content, problem));
    }
    throw new Error(`The model gave no theory that works after ${ATTEMPTS} attempts: ${problem}`);
}

// What is wrong with [answer]: its profile, or where its theory does not parse; '' when nothing is
async function failure(answer: Answer, framework: Framework, options: FormalizeOptions): Promise<string> {
    const profile = options.profileOf(answer.theory, answer.flags);
    if (framework === 'abstract' && profile !== 'abstract') return `the theory is read in the profile ${profile}, but an abstract framework was asked for: state graphBuildMode(abstract). and write only arguments and attacks.`;
    if (framework === 'structured' && profile === 'abstract') return 'the theory is an abstract framework, but a structured theory was asked for.';
    const theory = await options.check(answer.theory, 'theory');
    if (theory !== null) return `the theory does not parse at line ${theory.line}, column ${theory.column}: ${theory.message}`;
    return '';
}
