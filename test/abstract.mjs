import { equal, deepEqual, throws } from 'assert';

import * as queryService from '../app/service/queryService.mjs';
import abstractQueryService from '../app/service/abstractQueryService.mjs';

const solve = queryService.default.solve

const flagsOf = semantics => `
    graphBuildMode(standard_af).
    statementLabellingMode(statement).
    argumentLabellingMode(${semantics}).
    orderingPrinciple(last).
    orderingComparator(elitist).
    graphExtension(standardPref).
    queryMode.`;

function labellings(graph, semantics) {
  const { i } = solve("", abstractQueryService.buildQuery(graph), flagsOf(semantics), _ => { })
  const result = [];
  while (i.hasNext()) {
    const solution = i.next();
    if (solution.res !== "yes") continue;
    result.push(solution.graph.arguments.reduce((acc, it) => {
      acc[abstractQueryService.argumentName(it)] = it.label;
      return acc;
    }, {}));
  }
  return result;
}

describe('AbstractQuery', function () {

  describe('buildQuery', function () {

    it('should build an argument and an attack list', function () {
      equal(
        abstractQueryService.buildQuery({
          arguments: ['a', 'b', 'c'],
          attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]
        }),
        'abstract::solve([a, b, c], [(a, b), (b, c)], In, Out, Und)');
    });

    it('should build an empty attack list', function () {
      equal(
        abstractQueryService.buildQuery({ arguments: ['a'], attacks: [] }),
        'abstract::solve([a], [], In, Out, Und)');
    });

    it('should reject an empty graph', function () {
      throws(() => abstractQueryService.buildQuery({ arguments: [], attacks: [] }));
    });
  });

  describe('argumentName', function () {

    it('should read the conclusion out of the descriptor', function () {
      equal(abstractQueryService.argumentName({ descriptor: 'A0 : a : a' }), 'a');
      equal(abstractQueryService.argumentName({ descriptor: 'A12 : not_pacifist : not_pacifist' }), 'not_pacifist');
    });
  });

  describe('Semantics', function () {

    const evenCycle = {
      arguments: ['a', 'b', 'c'],
      attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }, { from: 'b', to: 'c' }]
    };

    it('grounded should leave the even cycle undecided', function () {
      deepEqual(labellings(evenCycle, 'grounded'), [{ a: 'und', b: 'und', c: 'und' }]);
    });

    it('preferred should return both extensions', function () {
      deepEqual(labellings(evenCycle, 'preferred'), [
        { a: 'out', b: 'in', c: 'out' },
        { a: 'in', b: 'out', c: 'in' }
      ]);
    });

    it('complete should return the grounded labelling plus both extensions', function () {
      equal(labellings(evenCycle, 'complete').length, 3);
    });

    it('stable should find no extension of an odd cycle', function () {
      const oddCycle = {
        arguments: ['a', 'b', 'c'],
        attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }]
      };
      deepEqual(labellings(oddCycle, 'stable'), []);
    });

    it('grounded should accept an unattacked argument', function () {
      deepEqual(
        labellings({ arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] }, 'grounded'),
        [{ a: 'in', b: 'out' }]);
    });
  });
});
