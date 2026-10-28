// What the components are built on, with no component: the contract of the engines, the flags and the profiles, the
// formats of abstract frameworks, the layout of graphs. It needs no DOM (@tuprolog/arg2p-ui/data).
export * from './engine.js';
export { layeredLayout, type Link, type Point, type Size, type LayoutOptions } from './graph/layout.js';
export { levelsOf, supportsOf } from './graph/levels.js';
export { isAbstract, nameOf } from './graph/drawing.js';
export { parseFramework, toApx, toTgf, toTheory, frameworkOf, type Framework, type ReadFramework } from './formats/frameworks.js';
export { declaredFramework, redrawn } from './formats/declarations.js';
export {
    FLAG_GROUPS,
    FLAGS,
    PROFILES,
    DEFAULTS,
    DEFAULT_FLAGS,
    DEFAULT_PROFILE,
    SEMANTICS,
    profileInfo,
    type Flag,
    type FlagGroup,
    type FlagOption,
    type ProfileInfo,
    type Settings,
} from './flags/schema.js';
export { statedFlags, statedProfile, withValues, withNone, withSwitch, without } from './flags/text.js';
