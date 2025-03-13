import { equal } from 'assert';

import * as queryService from '../app/service/queryService.mjs';
const solve = queryService.default.solve

import * as pkg from './common/common.mjs';
const bind = pkg.suite

const baseTheoryText = `
    mother_child(trude, sally).
    mother_child(emily, jim).
            
    father_child(tom, sally).
    father_child(tom, erica).
    father_child(mike, tom).
    father_child(mike, jim).
    father_child(mike, marc).
    
    sibling(X, Y)      :- parent_child(Z, X), parent_child(Z, Y), X \\= Y.
        
    parent_child(X, Y) :- father_child(X, Y).
    parent_child(X, Y) :- mother_child(X, Y).`;


describe('Solve', function () {

  describe('Solution$Yes', function () {
    const inputQuery = `sibling(sally, Y)`

    it('result should have next', function () {
      const { i, query } = solve(baseTheoryText, inputQuery, '', it => { console.log(it) })
      equal(i.hasNext(), true);
    });


    it('result should have 1 Yes result', function () {
      const { i, query } = solve(baseTheoryText, inputQuery, '', it => { console.log(it) })
      let index = 0;
      while (i.hasNext()) {
        const result = i.next();
        if (result.res == "yes") index++
      }
      equal(index, 1);
    });

    it('result should have 2 Yes result', function () {
      const currentQuery = `sibling(tom, Y)`
      const { i, query } = solve(baseTheoryText, currentQuery, '', it => { console.log(it) })
      let index = 0;
      while (i.hasNext()) {
        const result = i.next();
        if (result.res == "yes") index++
      }
      equal(index, 2);
    });
  });

  describe('Solution$No', function () {
    const inputQuery = `sibling(jennifer, Y)`

    it('result should have next', function () {
      const { i, query } = solve(baseTheoryText, inputQuery, '', it => { console.log(it) })
      equal(i.hasNext(), true);
    });

    it('result should have 1 No result and no Others', function () {
      const { i, query } = solve(baseTheoryText, inputQuery, '', it => { console.log(it) })
      let noCounter = 0;
      let othersCounter = 0;
      while (i.hasNext()) {
        const result = i.next();
        result.res == "no" ? noCounter++ : othersCounter++
      }
      equal(noCounter, 1);
      equal(othersCounter, 0);
    });
  });

  describe('Solution$Halt', function () {
    const inputQuery = `halt`

    it('result should have next', function () {
      const { i } = solve("", inputQuery, '')
      equal(i.hasNext(), true);
    });

    it('result should have 1 Halt result and no Others', function () {
      const { i, query } = solve('', inputQuery, '', it => { console.log(it) })
      let haltCounter = 0;
      let othersCounter = 0;
      while (i.hasNext()) {
        const result = i.next();
        result.res == "halt" ? haltCounter++ : othersCounter++
      }
      equal(haltCounter, 1);
      equal(othersCounter, 0);
    });

  })

  describe('Solution$Graph', function () {
    const baseGraph = `
      r :=> a.`;

    const baseFlags = `
      graphBuildMode(standard_af).
      statementLabellingMode(statement).
      argumentLabellingMode(grounded_hash).
      orderingPrinciple(last).
      orderingComparator(elitist).
      graphExtension(standardPref).
      queryMode.`;

    it('Result should have 1 in argument', function () {
      const { i, query } = solve(baseGraph, 'buildLabelSets', baseFlags, it => { console.log(it) })
      let index = 0;
      while (i.hasNext()) {
        const result = i.next();
        if (result.graph.arguments[0].label == "in") index++
      }
      equal(index, 1);
    });
  })
});
