import { assert, describe, it } from 'vitest';
import { linkKey, locate, statementKey, statementRanges } from '../src/formalize/anchors.js';

const { deepEqual, equal } = assert;

const TEXT = `Birds normally fly. Penguins are birds, but they don't fly.
Tweety is a penguin — so says the zoo's “official” register.`;

const at = (text: string, range: { from: number; to: number } | null) => (range === null ? null : text.slice(range.from, range.to));

describe('Passages quoted', function () {
    it('should find a quote as it is', function () {
        equal(at(TEXT, locate(TEXT, 'Penguins are birds')), 'Penguins are birds');
    });

    it('should find a quote whose spaces, case, quotes or dashes the model changed', function () {
        equal(at(TEXT, locate(TEXT, "they don't fly. tweety is")), "they don't fly.\nTweety is");
        equal(at(TEXT, locate(TEXT, 'a penguin - so says')), 'a penguin — so says');
        equal(at(TEXT, locate(TEXT, 'zoo\'s "official" register')), 'zoo\'s “official” register');
        equal(at(TEXT, locate(TEXT, "the zoo's")), "the zoo's");
    });

    it('should drop the quotes a model puts around a quote', function () {
        equal(at(TEXT, locate(TEXT, '"Birds normally fly."')), 'Birds normally fly.');
    });

    it('should take a passage quoted twice at its first place after a point', function () {
        const text = 'A fly. B fly.';
        deepEqual(locate(text, 'fly'), { from: 2, to: 5 });
        deepEqual(locate(text, 'fly', 5), { from: 9, to: 12 });
        deepEqual(locate(text, 'fly', 12), { from: 2, to: 5 });
    });

    it('should find nothing that is not there, or empty', function () {
        equal(locate(TEXT, 'Penguins swim'), null);
        equal(locate(TEXT, '   '), null);
    });
});

describe('Statements of a theory', function () {
    const names = (theory: string) => statementRanges(theory).map(it => it.name);
    const texts = (theory: string) => statementRanges(theory).map(it => theory.slice(it.from, it.to));

    it('should name rules, premises and axioms by their names, and leave out the flags', function () {
        const theory = [
            'graphBuildMode(aspicPlus).',
            'r1 : bird(X), ~(penguin(X)) => flies(X).',
            'r2 : penguin(X) -> bird(X).',
            'f1 :=> penguin(tweety).',
            'a1 :-> sparrow(jack).',
            'sup(r1, r4).',
            'argumentLabellingMode(preferred).',
        ].join('\n');
        deepEqual(names(theory), ['r1', 'r2', 'f1', 'a1', 'sup(r1,r4)']);
        equal(texts(theory)[0], 'r1 : bird(X), ~(penguin(X)) => flies(X).');
    });

    it('should name the arguments and attacks of an abstract framework', function () {
        const theory = 'graphBuildMode(abstract).\n\na.   % an argument\nb.\na -> b.\nb <-> c.\n';
        deepEqual(names(theory), ['a', 'b', 'a->b', 'b<->c']);
        deepEqual(texts(theory), ['a.', 'b.', 'a -> b.', 'b <-> c.']);
    });

    it('should keep a statement over several lines whole, and skip comments and Prolog clauses', function () {
        const theory = '% the rules\nr1 : a,\n     b => c.\nhelper(X) :- member(X, [1.5, 2]).\nr2 : \'a. b\' => d.';
        deepEqual(names(theory), ['r1', 'r2']);
        equal(texts(theory)[0], 'r1 : a,\n     b => c.');
    });

    it('should write a name once, without spaces or a full stop', function () {
        equal(statementKey('sup(r1, r2).'), 'sup(r1,r2)');
        equal(statementKey('a -> b'), 'a->b');
    });
});

describe('Statements a link gives', function () {
    it('should be known by their names, whole or not', function () {
        const keys = ['r1 : friday => wfh(marco)', 'p1 : [] => sup(r2,r1)', 'f1 : => friday', 'f2 :=> probation(marco).', 'r1', 'a -> b', 'sup(r1, r2)', 'nofly'];
        deepEqual(keys.map(linkKey), ['r1', 'p1', 'f1', 'f2', 'r1', 'a->b', 'sup(r1,r2)', 'nofly']);
    });
});
