import { equal, deepEqual, ok } from 'assert';

import { createSolverHost } from '../app/service/solverHost.mjs';
import examples from '../app/examples.mjs';

const FLAGS = 'graphBuildMode(standard_af).\nstatementLabellingMode(statement).\nargumentLabellingMode(complete).\n' +
  'orderingPrinciple(last).\norderingComparator(elitist).\ngraphExtension(standardPref).';

// A host whose answers are collected, as the page would receive them.
function host() {
  const posted = [];
  const { handle } = createSolverHost(message => posted.push(JSON.parse(JSON.stringify(message))));
  return { posted, send: message => { handle(message); return posted[posted.length - 1]; } };
}

describe('Solver host', function () {

  it('should warm up', function () {
    equal(host().send({ type: 'warmUp' }).type, 'warm');
  });

  it('should give the solutions one at a time, with their graphs, as plain data', function () {
    const { send } = host();
    deepEqual(send({ type: 'solve', id: 1, theory: 'r1 :=> a.\nr2 :=> -a.\n', query: 'buildLabelSets(In, Out, Und)', flags: FLAGS }),
      { type: 'started', id: 1, query: 'buildLabelSets(In, Out, Und)' });
    const labellings = [];
    let answer;
    do {
      answer = send({ type: 'next', id: 1 });
      equal(answer.type, 'solution');
      if (answer.solution.res === 'yes') labellings.push(answer.solution.graph.arguments.map(it => it.label).join());
    } while (answer.hasNext);
    equal(labellings.length, 3);
    equal(new Set(labellings).size, 3);
  });

  it('should give the graph of any stage', function () {
    const { send } = host();
    send({ type: 'solve', id: 2, theory: examples.tweety.theory, query: 'arg2p::solve', flags: FLAGS });
    const { solution } = send({ type: 'next', id: 2 });
    const graph = send({ type: 'graphAt', id: 2, branch: solution.context, reqId: 9 });
    equal(graph.reqId, 9);
    deepEqual(graph.graph, solution.graph);
    deepEqual(send({ type: 'graphAt', id: 2, branch: 0, reqId: 10 }).graph.arguments, []);
  });

  it('should pass on what the solver prints', function () {
    const { posted, send } = host();
    send({ type: 'solve', id: 3, theory: '', query: 'write(hello)', flags: FLAGS });
    send({ type: 'next', id: 3 });
    ok(posted.some(it => it.type === 'output' && it.id === 3 && it.text.includes('hello')));
  });

  it('should report a syntax error, and a query that is no longer running', function () {
    const { send } = host();
    const failed = send({ type: 'solve', id: 4, theory: 'a :=> b', query: 'arg2p::solve', flags: FLAGS });
    equal(failed.type, 'failed');
    equal(failed.error.syntax.where, 'theory');
    equal(send({ type: 'next', id: 4 }).type, 'failed');
  });
});
