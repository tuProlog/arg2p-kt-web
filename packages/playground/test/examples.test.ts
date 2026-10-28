import { Arg2p, Flags } from '@tuprolog/arg2p';
import { assert, describe, it } from 'vitest';
import { EXAMPLES } from '../src/examples.js';

const { equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

describe('Examples', function () {
    for (const example of EXAMPLES) {
        it(`should solve ${example.name}`, function () {
            const solver = Arg2p.builder().theory(example.theory).flags(Flags.parse(example.flags)).build();
            const solution = solver.solve(example.query).next();
            ok(solution.isYes, `${example.name}: ${solution.error ?? 'no'}`);
            ok(solver.graph().labellings.length > 0, `${example.name} builds no argument`);
        });
    }

    it('should have ids of their own', function () {
        equal(new Set(EXAMPLES.map(it => it.id)).size, EXAMPLES.length);
    });
});
