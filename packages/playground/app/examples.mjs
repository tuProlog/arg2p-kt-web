import urlParamsService from './service/urlParamsService.mjs';

const STRUCTURED = urlParamsService.STRUCTURED;
const ABSTRACT = urlParamsService.ABSTRACT;

const examples = {

    tweety: {
        mode: STRUCTURED,
        query: 'arg2p::solve',
        theory: `d1(X) : bird(X) => flies(X).
d2(X) : penguin(X) => bird(X).
d3(X) : sparrow(X) => bird(X).

p1(X) : penguin(X) => -flies(X).
p2(X) : penguin(X) => -d1(X).

f1 :=> penguin(tweety).
f2 :=> sparrow(jack).
`
    },

    bush: {
        mode: STRUCTURED,
        query: 'arg2p::solve',
        theory: `% R

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
`
    },

    car: {
        mode: STRUCTURED,
        query: 'arg2p::solve',
        theory: `% R

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
`
    },

    evenCycle: {
        mode: ABSTRACT,
        abstractGraph: {
            arguments: ['a', 'b', 'c'],
            attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }, { from: 'b', to: 'c' }]
        }
    },

    oddCycle: {
        mode: ABSTRACT,
        abstractGraph: {
            arguments: ['a', 'b', 'c'],
            attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'a' }]
        }
    }
}

export default examples
