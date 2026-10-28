import { assert, describe, it } from 'vitest';
import { check, createHost, type Answer, type Request } from '../src/js/host.js';
import { JsEngine, type Channel } from '../src/js/engine.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const FLAGS = 'statementLabellingMode(statement).\nargumentLabellingMode(complete).\n';
const TWEETY = 'f1 :=> bird(tweety).\nr1 : bird(X) => flies(X).\nf2 :=> -flies(tweety).';

// A host whose answers are collected, as the page would receive them
function host() {
    const posted: Answer[] = [];
    const { handle } = createHost(answer => posted.push(JSON.parse(JSON.stringify(answer)) as Answer));
    const send = <T extends Answer['type']>(request: Request): Extract<Answer, { type: T }> => {
        handle(request);
        return posted[posted.length - 1] as Extract<Answer, { type: T }>;
    };
    return { posted, send };
}

// The engine of the browser on a host in the same thread, answering as a worker would (later)
function engine(): JsEngine {
    return new JsEngine(() => {
        const channel: Channel = {
            onmessage: null,
            postMessage: request => setTimeout(() => handle(request), 0),
            terminate: () => {},
        };
        const { handle } = createHost(answer => channel.onmessage?.({ data: answer }));
        return channel;
    });
}

describe('Host of the engine', function () {
    it('should warm up', function () {
        equal(host().send({ type: 'warmUp' }).type, 'warm');
    });

    it('should give the solutions one at a time, with their graphs, as plain data', function () {
        const { send } = host();
        deepEqual(send({ type: 'solve', id: 1, theory: 'r1 :=> a.\nr2 :=> -a.\n', query: 'buildLabelSets(In, Out, Und)', flags: FLAGS }), {
            type: 'started',
            id: 1,
            query: 'buildLabelSets(In, Out, Und)',
        });
        const labellings: string[] = [];
        let answer: Extract<Answer, { type: 'solution' }>;
        do {
            answer = send({ type: 'next', id: 1 });
            equal(answer.type, 'solution');
            if (answer.solution.result === 'yes') labellings.push(answer.solution.graph.arguments.map(it => it.label).join());
        } while (answer.hasNext);
        equal(labellings.length, 3);
        equal(new Set(labellings).size, 3);
    });

    it('should give the structure of the arguments, and the profile they were built in', function () {
        const { send } = host();
        send({ type: 'solve', id: 2, theory: TWEETY, query: 'buildLabelSets', flags: FLAGS });
        const { graph } = send<'solution'>({ type: 'next', id: 2 }).solution;
        equal(graph.profile, 'aspic_plus');
        const flies = graph.arguments.find(it => it.conclusion === 'flies(tweety)')!;
        equal(flies.topRule, 'r1');
        deepEqual(flies.supports.map(id => graph.arguments.find(it => it.id === id)!.conclusion), ['bird(tweety)']);
        ok(graph.attacks.some(it => it.to === flies.id && it.type === 'rebut'));
    });

    it('should read an abstract framework from its theory', function () {
        const { send } = host();
        send({ type: 'solve', id: 3, theory: 'graphBuildMode(abstract).\na.\nb.\nc.\na -> b.\nb <-> c.', query: 'buildLabelSets(In, Out, Und)', flags: '' });
        const { graph } = send<'solution'>({ type: 'next', id: 3 }).solution;
        equal(graph.profile, 'abstract');
        deepEqual(graph.arguments.map(it => `${it.conclusion}:${it.label}`).sort(), ['a:in', 'b:out', 'c:in']);
        equal(graph.attacks.length, 3);
    });

    it('should give the graph of any stage', function () {
        const { send } = host();
        send({ type: 'solve', id: 4, theory: TWEETY, query: 'arg2p::solve', flags: FLAGS });
        const { solution } = send<'solution'>({ type: 'next', id: 4 });
        ok(solution.branch > 0);
        const graph = send<'graph'>({ type: 'graphAt', id: 4, branch: solution.branch, reqId: 9 });
        equal(graph.reqId, 9);
        deepEqual(graph.graph, solution.graph);
        deepEqual(send<'graph'>({ type: 'graphAt', id: 4, branch: 0, reqId: 10 }).graph.arguments, []);
    });

    it('should pass on what the solver prints', function () {
        const { posted, send } = host();
        send({ type: 'solve', id: 5, theory: '', query: 'write(hello)', flags: FLAGS });
        send({ type: 'next', id: 5 });
        ok(posted.some(it => it.type === 'output' && it.id === 5 && it.text.includes('hello')));
    });

    it('should tell where a text does not parse, and a query that is no longer running', function () {
        const { send } = host();
        const failed = send<'failed'>({ type: 'solve', id: 6, theory: 'a :=> b', query: 'arg2p::solve', flags: FLAGS });
        equal(failed.type, 'failed');
        equal(failed.error.syntax?.where, 'theory');
        equal(send({ type: 'next', id: 6 }).type, 'failed');
        equal(send<'failed'>({ type: 'solve', id: 7, theory: '', query: ' ', flags: FLAGS }).error.name, 'Query error');
    });

    it('should check texts', function () {
        equal(check(TWEETY, 'theory'), null);
        equal(check('flies(X)', 'query'), null);
        equal(check('', 'query'), null);
        const problem = check('a :=> b.\nc :=> d(.', 'theory')!;
        equal(problem.line, 2);
        ok(problem.column >= 1);
        ok(check('flies(', 'query') !== null);
    });
});

describe('Engine of the browser', function () {
    it('should run queries through its channel', async function () {
        const run = await engine().solve({ theory: TWEETY, query: 'buildLabelSets(In, Out, Und).', flags: FLAGS });
        equal(run.query, 'buildLabelSets(In, Out, Und)');
        ok(run.hasNext());
        const first = await run.next();
        equal(first.result, 'yes');
        deepEqual(first.bindings.map(it => it.name), ['In', 'Out', 'Und']);
        const stage = await run.graphAt(first.branch);
        deepEqual(stage, first.graph);
    });

    it('should reject what does not parse, with where it is', async function () {
        const error = await engine()
            .solve({ theory: 'a :=> b', query: 'arg2p::solve', flags: FLAGS })
            .then(
                () => null,
                (it: unknown) => it as { name: string; syntax: { where: string } | null },
            );
        equal(error?.name, 'Theory error');
        equal(error?.syntax?.where, 'theory');
    });

    it('should stop what it is waited for', async function () {
        const solving = engine();
        const pending = solving.solve({ theory: TWEETY, query: 'buildLabelSets', flags: FLAGS });
        solving.stop();
        const error = await pending.then(
            () => null,
            (it: unknown) => it as { stopped?: boolean },
        );
        equal(error?.stopped, true);
    });

    it('should check texts', async function () {
        equal(await engine().check(TWEETY, 'theory'), null);
        equal((await engine().check('a :=> b', 'theory'))?.line, 1);
    });
});
