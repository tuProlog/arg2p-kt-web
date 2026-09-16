import { monaco } from '../editor.mjs';

const DEFAULT_FLAGS = [
    'graphBuildMode(standard_af).',
    'statementLabellingMode(statement).',
    'argumentLabellingMode(grounded).',
    'orderingPrinciple(last).',
    'orderingComparator(elitist).',
    'graphExtension(standardPref).',
    'queryMode.',
].join('\n')

function FlagsModule() {

    var editor;

    function init(container, initialFlags) {
        prepareContainer(container, initialFlags)
        return { flags, setFlag, flagValue }
    }

    function prepareContainer(container, initialFlags) {
        editor = monaco.editor.create(container, {
            value: initialFlags !== undefined && initialFlags !== null ? initialFlags : DEFAULT_FLAGS,
            language: 'tuprolog',
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
            },
            minimap: {
                enabled: false
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            automaticLayout: true
        });

    }

    function flags() {
        return editor.getValue()
    }

    function flagPattern(name) {
        return new RegExp(`^[ \\t]*${name}[ \\t]*\\(([^)]*)\\)[ \\t]*\\.[ \\t]*$`, 'm')
    }

    function flagValue(name) {
        const match = flags().match(flagPattern(name))
        return match !== null ? match[1].trim() : null
    }

    // Rewrites `name(...)` in place, appending the flag when it is not there yet,
    // so that the flags editor stays the single source of truth.
    function setFlag(name, value) {
        const declaration = `${name}(${value}).`
        const current = flags()
        editor.setValue(flagPattern(name).test(current)
            ? current.replace(flagPattern(name), declaration)
            : `${current.replace(/\s*$/, '')}\n${declaration}\n`)
    }

    return { init }
}

export default FlagsModule()
