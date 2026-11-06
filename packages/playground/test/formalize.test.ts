import { profileOf } from '@tuprolog/arg2p-ui/data';
import { assert, describe, it } from 'vitest';
import { formalize, type FormalizeOptions } from '../src/formalize/formalizer.js';
import { complete, ModelError, type Post } from '../src/formalize/openrouter.js';
import { readAnswer, request, SCHEMA, type Answer } from '../src/formalize/prompt.js';
import { loadSkill, type Fetch } from '../src/formalize/skill.js';

const { deepEqual, equal, match } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

// That [promise] fails with a message matching [pattern]
async function rejects(promise: Promise<unknown>, pattern: RegExp): Promise<void> {
    try {
        await promise;
    } catch (error) {
        match((error as Error).message, pattern);
        return;
    }
    throw new Error(`no failure, expected one matching ${pattern}`);
}

const SKILL_MD = '---\nname: arg2p-formalize\ndescription: x\n---\n\n# Formalizing problems in Arg2P\n\nStep 1: choose the framework.';

// GitHub as raw.githubusercontent.com answers: the files of the skill at the refs given, 404 elsewhere
function github(files: Record<string, string>) {
    const asked: string[] = [];
    const fetch: Fetch = async url => {
        asked.push(url);
        const path = url.replace('https://raw.githubusercontent.com/tuProlog/arg2p-kt/', '');
        const text = files[path];
        return { ok: text !== undefined, status: text === undefined ? 404 : 200, text: async () => text ?? '404: Not Found' };
    };
    return { fetch, asked };
}

const at = (ref: string) => ({
    [`${ref}/plugins/arg2p/skills/arg2p-formalize/SKILL.md`]: SKILL_MD,
    [`${ref}/plugins/arg2p/skills/arg2p-formalize/references/syntax.md`]: '# The language of Arg2P',
    [`${ref}/plugins/arg2p/skills/arg2p-formalize/references/flags.md`]: '# The flags of Arg2P',
});

function memory() {
    const items = new Map<string, string>();
    return { get: (key: string) => items.get(key) ?? null, set: (key: string, value: string) => void items.set(key, value), items };
}

describe('The method', function () {
    it('should be downloaded at the version solved with, without its front matter, and kept', async function () {
        const { fetch, asked } = github(at('0.25.0'));
        const cache = memory();
        const skill = await loadSkill('0.25.0', fetch, cache);
        equal(skill.version, '0.25.0');
        ok(skill.instructions.startsWith('# Formalizing problems in Arg2P'));
        deepEqual(Object.keys(skill.references), ['syntax', 'flags']);
        equal(asked.length, 3);
        await loadSkill('0.25.0', fetch, cache);
        equal(asked.length, 3, 'kept, not downloaded again');
    });

    it('should be the latest one when the version has none, and then not kept', async function () {
        const { fetch } = github(at('master'));
        const cache = memory();
        equal((await loadSkill('0.19.1', fetch, cache)).version, 'master');
        equal(cache.items.size, 0);
    });

    it('should say so when it cannot be downloaded', async function () {
        await rejects(loadSkill('0.25.0', github({}).fetch, memory()), /could not be downloaded/);
    });
});

// OpenRouter as it answers: [status] with [body]; what it was asked, kept
function openrouter(answers: { status: number; body: unknown }[]) {
    const asked: { url: string; headers: Record<string, string>; body: Record<string, unknown> }[] = [];
    const post: Post = async (url, init) => {
        asked.push({ url, headers: init.headers, body: JSON.parse(init.body) });
        const answer = answers[Math.min(asked.length - 1, answers.length - 1)]!;
        return { ok: answer.status < 300, status: answer.status, text: async () => (typeof answer.body === 'string' ? answer.body : JSON.stringify(answer.body)) };
    };
    return { post, asked };
}

const SETTINGS = { key: 'sk-or-test', model: 'openai/gpt-oss-120b', effort: 'medium' as const };
const reply = (content: string, cost = 0.0002) => ({
    status: 200,
    body: {
        model: 'openai/gpt-oss-120b',
        provider: 'Cerebras',
        choices: [{ message: { content } }],
        usage: { cost, prompt_tokens: 1000, completion_tokens: 300, completion_tokens_details: { reasoning_tokens: 200 } },
    },
});

describe('OpenRouter', function () {
    it('should ask the model with the key, for an answer in the schema, of the fastest providers holding to it', async function () {
        const { post, asked } = openrouter([reply('{"theory": "a."}')]);
        const completion = await complete(SETTINGS, [{ role: 'user', content: 'hi' }], SCHEMA, post);
        deepEqual(completion, {
            content: '{"theory": "a."}',
            model: 'openai/gpt-oss-120b',
            cost: 0.0002,
            provider: 'Cerebras',
            tokens: { prompt: 1000, completion: 300, reasoning: 200 },
        });
        equal(asked[0]!.url, 'https://openrouter.ai/api/v1/chat/completions');
        equal(asked[0]!.headers.Authorization, 'Bearer sk-or-test');
        const body = asked[0]!.body as { model: string; response_format: { type: string; json_schema: { strict: boolean } }; provider: unknown; reasoning: unknown };
        equal(body.model, 'openai/gpt-oss-120b');
        equal(body.response_format.type, 'json_schema');
        ok(body.response_format.json_schema.strict);
        deepEqual(body.provider, { require_parameters: true, sort: 'throughput' });
        deepEqual(body.reasoning, { effort: 'medium' });
    });

    it('should say what to do when OpenRouter refuses', async function () {
        const fails = async (status: number, body: unknown = { error: { message: 'nope' } }) => {
            try {
                await complete(SETTINGS, [], SCHEMA, openrouter([{ status, body }]).post);
            } catch (error) {
                ok(error instanceof ModelError);
                return (error as Error).message;
            }
            throw new Error('no failure');
        };
        ok((await fails(401)).includes('refused the key'));
        ok((await fails(402)).includes('no credit'));
        ok((await fails(429)).includes('try again'));
        ok((await fails(500)).includes('500: nope'));
        ok((await fails(200, { choices: [{ message: { content: '' } }] })).includes('no answer'));
    });
});

describe('The request', function () {
    const skill = { version: '0.25.0', instructions: '# Formalizing problems in Arg2P', references: { syntax: '# The language' } };

    it('should give the method, the framework picked and how to answer, then the text', function () {
        const [system, user] = request('Birds fly.', 'abstract', skill);
        ok(system!.content.includes('# Formalizing problems in Arg2P'));
        ok(system!.content.includes('<reference name="syntax">'));
        ok(system!.content.includes('graphBuildMode(abstract)'));
        ok(system!.content.includes('character for character'));
        ok(user!.content.includes('<text>\nBirds fly.\n</text>'));
        ok(request('x', 'structured', skill)[0]!.content.includes('Never the profile abstract'));
    });

    it('should read an answer, in a fence or not, and say what is wrong with one', function () {
        const answer = readAnswer('```json\n{"theory": "a.", "links": [{"statement": "a", "quote": "A"}, {"bad": 1}]}\n```') as Answer;
        equal(answer.theory, 'a.');
        deepEqual(answer.links, [{ statement: 'a', quote: 'A' }]);
        deepEqual(answer.glossary, []);
        equal(readAnswer('not json'), 'the answer is not JSON.');
        equal(readAnswer('{"theory": " "}'), 'the answer has no theory.');
    });
});

describe('A formalization', function () {
    const TEXT = 'Birds normally fly. Tweety is a penguin, and penguins do not fly.';
    const answer = (theory: string, links: { statement: string; quote: string }[] = [], extra: Partial<Answer> = {}) =>
        JSON.stringify({ profile: '', theory, query: '', flags: '', links, glossary: [], ledger: [], notes: '', ...extra });
    const STRUCTURED = 'graphBuildMode(aspic_plus).\nr1 : bird(X) => flies(X).\nf1 :=> penguin(tweety).\n';

    function options(answers: { status: number; body: unknown }[], check: FormalizeOptions['check'] = async () => null) {
        const { post, asked } = openrouter(answers);
        const steps: string[] = [];
        const opts: FormalizeOptions = {
            text: TEXT,
            framework: 'structured',
            settings: SETTINGS,
            skill: async () => ({ version: '0.25.0', instructions: 'method', references: {} }),
            check,
            profileOf,
            post,
            progress: step => steps.push(step),
            now: (() => {
                let time = 0;
                return () => (time += 1500);
            })(),
        };
        return { opts, asked, steps };
    }

    it('should give the theory and the links of a good answer, the statements written once', async function () {
        const { opts, steps } = options([reply(answer(STRUCTURED, [{ statement: 'r1', quote: 'Birds normally fly' }, { statement: 'sup( r1, r2 )', quote: 'x' }, { statement: 'f1', quote: '' }], { glossary: [{ term: 'r1', meaning: 'birds fly' }], title: ' Tweety ' }))]);
        const formalized = await formalize(opts);
        equal(formalized.theory, STRUCTURED);
        ok(!('query' in formalized), 'the query is never the model\'s: arg2p::solve(In, Out, Und)');
        deepEqual(formalized.formalization.links, [
            { statement: 'r1', quote: 'Birds normally fly' },
            { statement: 'sup(r1,r2)', quote: 'x' },
        ]);
        deepEqual(formalized.formalization.glossary, [{ term: 'r1', meaning: 'birds fly' }]);
        equal(formalized.formalization.cost, 0.0002);
        equal(formalized.title, 'Tweety');
        equal(formalized.formalization.provider, 'Cerebras');
        equal(formalized.formalization.seconds, 1.5);
        deepEqual(formalized.formalization.tokens, { prompt: 1000, completion: 300, reasoning: 200 });
        deepEqual(steps, ['Downloading the method', 'Asking openai/gpt-oss-120b']);
    });

    it('should have a theory that does not parse fixed, telling the model where, and add up the cost', async function () {
        let checks = 0;
        const { opts, asked } = options([reply(answer('r1 : a => b')), reply(answer(STRUCTURED))], async (_, kind) =>
            kind === 'theory' && checks++ === 0 ? { line: 1, column: 12, length: 1, message: 'Expected a full stop' } : null,
        );
        const formalized = await formalize(opts);
        equal(formalized.theory, STRUCTURED);
        equal(asked.length, 2);
        const messages = (asked[1]!.body as { messages: { role: string; content: string }[] }).messages;
        equal(messages.at(-2)!.role, 'assistant');
        ok(messages.at(-1)!.content.includes('line 1, column 12: Expected a full stop'));
        ok(Math.abs(formalized.formalization.cost! - 0.0004) < 1e-12);
        deepEqual(formalized.formalization.tokens, { prompt: 2000, completion: 600, reasoning: 400 });
    });

    it('should have the framework picked: an abstract one asked for, a structured one is sent back', async function () {
        const { opts, asked } = options([reply(answer(STRUCTURED)), reply(answer('graphBuildMode(abstract).\na.\nb.\na -> b.\n'))]);
        const formalized = await formalize({ ...opts, framework: 'abstract' });
        ok(formalized.theory.startsWith('graphBuildMode(abstract).'));
        ok(JSON.stringify(asked[1]!.body).includes('an abstract framework was asked for'));
    });

    it('should give up after its attempts, saying why', async function () {
        const { opts, asked } = options([reply('nonsense')]);
        await rejects(formalize(opts), /after 3 attempts: the answer is not JSON/);
        equal(asked.length, 3);
    });

    it('should have a text to formalize', async function () {
        await rejects(formalize({ ...options([]).opts, text: '  ' }), /no text/);
    });
});
