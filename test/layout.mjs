import { equal, ok } from 'assert';

import { layeredLayout } from '../app/modules/layeredLayout.mjs';

// Tweety: A0 supports A2, A3 and A5, A5 supports A7, and A1 -> A4 -> A6.
const levels = new Map([["A0", 0], ["A1", 0], ["A2", 1], ["A3", 1], ["A4", 1], ["A5", 1], ["A6", 2], ["A7", 2]]);
const supports = [
  { from: "A0", to: "A2" }, { from: "A0", to: "A3" }, { from: "A0", to: "A5" },
  { from: "A5", to: "A7" }, { from: "A1", to: "A4" }, { from: "A4", to: "A6" }
];

describe('Layered layout', function () {

  const positions = layeredLayout(levels, supports, { spacing: 100, levelSeparation: 80 });

  it('should put every level on its own row, facts at the bottom', function () {
    equal(positions.get("A0").y, 0);
    equal(positions.get("A2").y, -80);
    equal(positions.get("A7").y, -160);
  });

  it('should keep nodes on a row at least the spacing apart', function () {
    const row = ["A2", "A3", "A4", "A5"].map(it => positions.get(it).x).sort((a, b) => a - b);
    for (let i = 1; i < row.length; i++) ok(row[i] - row[i - 1] >= 100 - 1e-9);
  });

  it('should centre an argument under what it supports', function () {
    const middle = (positions.get("A2").x + positions.get("A3").x + positions.get("A5").x) / 3;
    ok(Math.abs(positions.get("A0").x - middle) < 1e-9);
  });

  it('should keep a chain straight', function () {
    equal(positions.get("A1").x, positions.get("A4").x);
    equal(positions.get("A4").x, positions.get("A6").x);
  });

  it('should be compact', function () {
    const xs = [...positions.values()].map(it => it.x);
    ok(Math.max(...xs) - Math.min(...xs) <= 3 * 100 + 1e-9);
  });

  it('should place a graph without supports on one row', function () {
    const flat = layeredLayout(new Map([["A0", 0], ["A1", 0]]), [], { spacing: 50 });
    equal(flat.get("A1").x - flat.get("A0").x, 50);
  });
});
