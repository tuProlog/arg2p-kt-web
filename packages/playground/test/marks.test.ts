import { assert, describe, it } from 'vitest';
import { linkMarks, tonesOf } from '../src/formalize/marks.js';

const { deepEqual, equal } = assert;

const TEXT = 'Birds normally fly. Penguins are birds. Tweety is a penguin. Penguins are birds, says the zoo.';
const THEORY = 'graphBuildMode(aspic_plus).\nr1 : bird(X) => flies(X).\nr2 : penguin(X) -> bird(X).\nf1 :=> penguin(tweety).\n';
const LINKS = [
    { statement: 'r1', quote: 'Birds normally fly' },
    { statement: 'r2', quote: 'Penguins are birds' },
    { statement: 'f1', quote: 'Tweety is a penguin' },
    { statement: 'r2', quote: 'Penguins are birds' },
    { statement: 'r9', quote: 'Owls hoot' },
];

describe('The marks of a formalization', function () {
    it('should give each statement a tone, the same wherever it is linked', function () {
        deepEqual([...tonesOf(LINKS)], [['r1', 0], ['r2', 1], ['f1', 2], ['r9', 3]]);
    });

    it('should mark the passages in the text, a passage quoted twice at both places, and the statements in the theory', function () {
        const marks = linkMarks(TEXT, THEORY, LINKS, 'r2');
        deepEqual(
            marks.text.map(it => [it.key, TEXT.slice(it.from, it.to), it.tone, it.active]),
            [
                ['r1', 'Birds normally fly', 0, false],
                ['r2', 'Penguins are birds', 1, true],
                ['f1', 'Tweety is a penguin', 2, false],
                ['r2', 'Penguins are birds', 1, true],
            ],
        );
        equal(marks.text[1]!.from, 20);
        equal(marks.text[3]!.from, 61);
        deepEqual(
            marks.theory.map(it => [it.key, THEORY.slice(it.from, it.to), it.active]),
            [
                ['r1', 'r1 : bird(X) => flies(X).', false],
                ['r2', 'r2 : penguin(X) -> bird(X).', true],
                ['f1', 'f1 :=> penguin(tweety).', false],
            ],
        );
        equal(marks.theory[1]!.title, '“Penguins are birds”\n“Penguins are birds”');
        deepEqual(marks.unquoted, ['r9']);
        deepEqual(marks.gone, ['r9']);
    });

    it('should link statements the model gave whole, by their names', function () {
        const marks = linkMarks(TEXT, THEORY, [{ statement: 'r1:bird(X)=>flies(X)', quote: 'Birds normally fly' }, { statement: 'f1 :=> penguin(tweety).', quote: 'Tweety is a penguin' }], null);
        deepEqual(marks.theory.map(it => it.key), ['r1', 'f1']);
        deepEqual(marks.gone, []);
        deepEqual(marks.unlinked, ['r2'], 'no link gives r2');
    });
});
