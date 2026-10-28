import { equal, deepEqual } from 'assert';

import { parseDescriptor, prettyTerm, supportsOf, levelsOf } from '../app/modules/argumentDescriptor.mjs';

describe('Argument descriptors', function () {

  it('should parse a fact', function () {
    deepEqual(parseDescriptor("A0 : f1 : penguin(tweety)"), {
      id: "A0", subArguments: [], rule: "f1", conclusion: "penguin(tweety)"
    });
  });

  it('should parse an argument built on a sub-argument', function () {
    deepEqual(parseDescriptor("A7 : A5,d1(tweety) : flies(tweety)"), {
      id: "A7", subArguments: ["A5"], rule: "d1(tweety)", conclusion: "flies(tweety)"
    });
  });

  it('should parse several sub-arguments and a rule with arguments', function () {
    deepEqual(parseDescriptor("A9 : A3,A4,r(a, b) : g(x)"), {
      id: "A9", subArguments: ["A3", "A4"], rule: "r(a, b)", conclusion: "g(x)"
    });
  });

  it('should write strong negation as in the theory', function () {
    equal(parseDescriptor("A2 : A0,p2(tweety) : '-'(d1(tweety))").conclusion, "-d1(tweety)");
    equal(prettyTerm("'-'('-'(a))"), "--a");
    equal(prettyTerm("f('-', x)"), "f('-', x)");
  });

  it('should not split inside quotes or brackets', function () {
    deepEqual(parseDescriptor("A1 : A0,r(' : ', [a,b]) : c(' : ')"), {
      id: "A1", subArguments: ["A0"], rule: "r(' : ', [a,b])", conclusion: "c(' : ')"
    });
  });

  it('should derive the supports of a graph', function () {
    deepEqual(supportsOf([
      { id: "A0", descriptor: "A0 : f1 : penguin(tweety)" },
      { id: "A5", descriptor: "A5 : A0,d2(tweety) : bird(tweety)" },
      { id: "A7", descriptor: "A7 : A5,d1(tweety) : flies(tweety)" },
      { id: "A8", descriptor: "A8 : A99,d9 : missing" }
    ]), [
      { from: "A0", to: "A5" },
      { from: "A5", to: "A7" }
    ]);
  });

  it('should put every argument one row above its highest sub-argument', function () {
    const levels = levelsOf([
      { id: "A0", descriptor: "A0 : f1 : a" },
      { id: "A1", descriptor: "A1 : f2 : b" },
      { id: "A2", descriptor: "A2 : A0,r1 : c" },
      { id: "A3", descriptor: "A3 : A2,A1,r2 : d" },
      { id: "A4", descriptor: "A4 : A99,r3 : e" }
    ]);
    deepEqual([...levels.entries()], [["A0", 0], ["A1", 0], ["A2", 1], ["A3", 2], ["A4", 0]]);
  });
});
