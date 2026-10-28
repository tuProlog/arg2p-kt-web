import { DEFAULT_FLAGS } from '@tuprolog/arg2p-ui/data';
import { DEFAULT_QUERY, type Content } from './documents.js';

// The examples of the menu, by the profile they are written in: each opens in a tab of its own

export interface Example extends Content {
    readonly id: string;
    readonly name: string;
    readonly group: string;
}

const example = (group: string, id: string, name: string, theory: string, query = DEFAULT_QUERY): Example => ({
    group,
    id,
    name,
    theory,
    query,
    flags: DEFAULT_FLAGS,
});

export const EXAMPLES: readonly Example[] = [
    example(
        'ASPIC+',
        'tweety',
        'Tweety',
        `d1(X) : bird(X) => flies(X).
d2(X) : penguin(X) => bird(X).
d3(X) : sparrow(X) => bird(X).

p1(X) : penguin(X) => -flies(X).
p2(X) : penguin(X) => -d1(X).

f1 :=> penguin(tweety).
f2 :=> sparrow(jack).
`,
    ),
    example(
        'ASPIC+',
        'bush',
        'Bush & Dlugash',
        `% R

% r0: If Bush shoots, Bush kills.
r_0 : bu_sh => bu_ki.
% r1: If Dlugash shoots, Dlugash kills.
r_1 : dl_sh => du_ki.
% r2: If Bush kills, Geller dies.
r_2 : bu_ki => ge_di.
% r3: If Dlugash kills, Geller dies.
r_3 : du_ki => ge_di.
% r4: If Bush kills, Dlugash does not kill
r_4 : bu_ki => -r_1.

% K

% Both Bush and Dlugash shoot.
f_1 :=> bu_sh.
f_1 :=> dl_sh.
`,
    ),
    example(
        'ASPIC+',
        'car',
        'Car accident',
        `% R

% r0: If driver does not use the brake, accident happens.
r_0 : -dr_pu => ac_ha.
% r1: If brake malfunctions, brake fails.
r_1 : br_ma => br_fa.
% r2: If brake fail, accident happens.
r_2 : br_fa => ac_ha.
% r3: If driver does not use the brake, the brake cannot fail
r_3 : -dr_pu => -r_1.

% K

% brake malfunction, driver does not use the brake.
f_1 :=> br_ma.
f_2 :=> -dr_pu.
`,
    ),
    example(
        'ABA',
        'aba',
        'Assumptions',
        `graphBuildMode(aba).

assumption(a).
assumption(b).
% an argument for x attacks every argument resting on a
contrary(a, x).

r1 : b -> x.
r2 : a -> y.
`,
    ),
    example(
        'ABA',
        'abaPlus',
        'Preferred assumptions (ABA+)',
        `graphBuildMode(aba_plus).

assumption(a0).
assumption(a1).
contrary(a0, x).
contrary(a1, y).
% a0 is stronger than a1: an attack from a1 on a0 is reversed
sup(a0, a1).

r0 : a0, a1 -> x.
r1 : a0 -> y.
`,
    ),
    example(
        'Abstract',
        'evenCycle',
        'Even cycle',
        `graphBuildMode(abstract).

a.
b.
c.
a <-> b.
b -> c.
`,
    ),
    example(
        'Abstract',
        'oddCycle',
        'Odd cycle',
        `graphBuildMode(abstract).

a.
b.
c.
a -> b.
b -> c.
c -> a.
`,
    ),
    example(
        'Abstract',
        'derived',
        'Attacks derived by rules',
        `graphBuildMode(abstract).

% the arguments, and the attacks drawn
a.
b.
c.
a -> b.

% the attacks Prolog derives: they show dashed in the drawing
X -> Y :- beats(X, Y).
beats(c, a).
beats(b, c).
`,
    ),
];
