import { monaco } from '../editor.mjs';

function FlagsModule() {

    var editor;

    function init(container) {
        prepareContainer(container)
        return { flags }
    }

    function prepareContainer(container) {
        editor = monaco.editor.create(container, {
            value: [
                'graphBuildMode(standard_af).',
                'statementLabellingMode(statement).',
                'argumentLabellingMode(grounded).',
                'orderingPrinciple(last).',
                'orderingComparator(elitist).',
                'graphExtension(standardPref).',
                'queryMode.',
            ].join('\n'),
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

    return { init }
}

export default FlagsModule()
