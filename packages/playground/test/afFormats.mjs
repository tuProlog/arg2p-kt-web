import { equal, deepEqual, throws } from 'assert';

import formats from '../app/service/afFormats.mjs';

const framework = { arguments: ['a', 'b', 'c'], attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }] };
const plain = ({ arguments: args, attacks }) => ({ arguments: args, attacks });

describe('Framework formats', function () {

  it('should write APX and TGF', function () {
    equal(formats.toApx(framework), 'arg(a).\narg(b).\narg(c).\natt(a,b).\natt(b,c).\n');
    equal(formats.toTgf(framework), 'a\nb\nc\n#\na b\nb c\n');
  });

  it('should read back what it writes', function () {
    deepEqual(plain(formats.parse(formats.toApx(framework))), framework);
    deepEqual(plain(formats.parse(formats.toTgf(framework))), framework);
  });

  it('should read APX with spaces, comments and several facts per line', function () {
    const parsed = formats.parse('% a framework\narg( a ). arg(b).\n\natt(a , b).  % a attacks b\n');
    deepEqual(plain(parsed), { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] });
  });

  it('should read ICCMA 23, renaming the numbers to atoms', function () {
    const parsed = formats.parse('p af 3\n# a comment\n1 2\n2 3\n');
    deepEqual(plain(parsed), { arguments: ['a1', 'a2', 'a3'], attacks: [{ from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' }] });
    equal(parsed.renamed.length, 3);
  });

  it('should rename names that are not atoms, consistently and without clashes', function () {
    const parsed = formats.parse('A\nb-c\na\n#\nA b-c\n');
    deepEqual(parsed.arguments, ['a_2', 'b_c', 'a']);
    deepEqual(parsed.attacks, [{ from: 'a_2', to: 'b_c' }]);
  });

  it('should add the arguments only mentioned by attacks, and drop repeated attacks', function () {
    deepEqual(plain(formats.parse('att(a,b).\natt(a,b).\n')), { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] });
  });

  it('should explain what it cannot read', function () {
    throws(() => formats.parse('just some text'), /TGF file has a line #/);
    throws(() => formats.parse('arg(a).\nnonsense'), /Line 2/);
    throws(() => formats.parse('p af 2\n1 5\n'), /between 1 and 2/);
  });
});
