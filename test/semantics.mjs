import { readFileSync } from 'fs';
import { equal, ok, deepEqual } from 'assert';

import * as queryService from '../app/service/queryService.mjs';
import abstractQueryService from '../app/service/abstractQueryService.mjs';

const solve = queryService.default.solve

// The semantics picker is the only place the playground advertises a labelling
// mode, so it has to stay in step with what the bundled arg2p actually ships.
function offeredSemantics() {
  const html = readFileSync(new URL('../assets/index.html', import.meta.url), 'utf8');
  const picker = html.match(/<select id="semantics">([\s\S]*?)<\/select>/)[1];
  return [...picker.matchAll(/<option value="([^"]+)"/g)].map(it => it[1]);
}

// Every labelling module arg2p registers, minus the statement labellings (a
// different flag) and the legacy `grounded.old` duplicate of `grounded`.
function bundledLabellingModules() {
  const source = readFileSync(
    new URL('../node_modules/@tuprolog/arg2p/arg2p-core.js', import.meta.url), 'utf8');
  const modules = [...source.matchAll(/'prolog\.argumentation\.graph\.labelling\.([a-z0-9.]+)'/g)]
    .map(it => it[1]);
  return [...new Set(modules)]
    .filter(it => !it.startsWith('statement'))
    .filter(it => it !== 'grounded.old');
}

const flagsOf = semantics => `
    graphBuildMode(standard_af).
    statementLabellingMode(statement).
    argumentLabellingMode(${semantics}).
    orderingPrinciple(last).
    orderingComparator(elitist).
    graphExtension(standardPref).
    queryMode.`;

describe('Semantics picker', function () {

  const offered = offeredSemantics();

  it('should offer one entry per bundled labelling module', function () {
    equal(offered.length, bundledLabellingModules().length);
  });

  it('should not repeat an entry', function () {
    deepEqual(offered, [...new Set(offered)]);
  });

  // `a` attacks `b`: every semantics has at least one labelling for it.
  const query = abstractQueryService.buildQuery({
    arguments: ['a', 'b'],
    attacks: [{ from: 'a', to: 'b' }]
  });

  offered.forEach(semantics => {
    it(`${semantics} should be accepted by the solver`, function () {
      this.timeout(30000);
      const { i } = solve("", query, flagsOf(semantics), _ => { });
      let accepted = 0;
      while (i.hasNext()) {
        const solution = i.next();
        ok(solution.res !== "halt", `${semantics} raised ${solution.exception}`);
        if (solution.res === "yes") accepted++;
      }
      ok(accepted > 0, `${semantics} produced no labelling`);
    });
  });
});
