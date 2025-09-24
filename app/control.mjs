import '../assets/style.css';
import { monaco } from './editor.mjs';

import * as consoleModule from './modules/consoleModule.mjs';
import * as flagsModule from './modules/flagsModule.mjs';
import * as graphModule from './modules/graphModule.mjs';
import * as solutionResultModule from './modules/solutionResultModule.mjs';
import * as queryService from './service/queryService.mjs';

const theoryField = document.querySelector("#theory");
const queryField = document.querySelector("#query");
const solutionsList = document.querySelector("#solutions");

const outputConsole = document.querySelector("#console");
const graphContainer = document.querySelector("#graph");
const flagsContainer = document.querySelector("#flags");


let theoryEditor = monaco.editor.create(theoryField, {
    value: [
        'd1(X) : bird(X) => flies(X).',
        'd2(X) : penguin(X) => bird(X).',
        'd3(X) : sparrow(X) => bird(X).',
        '',
        'p1(X) : penguin(X) => -flies(X).',
        'p2(X) : penguin(X) => -d1(X).',
        '',
        'f1 :=> penguin(tweety).',
        'f2 :=> sparrow(jack).'
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
});


let queryEditor = monaco.editor.create(queryField, {
    value: 'arg2p::solve(-flies(X))',
    language: 'tuprolog',
    mscrollbar: {
		vertical: 'hidden',
		horizontal: 'hidden'
	},
    minimap: {
        enabled: false
    },
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    lineNumbers: false,
    automaticLayout: true
});


function startup() {
    const flagsManager = flagsModule.default.init(flagsContainer);

    setListeners(_ => {
        const resultManager = solutionResultModule.default.init(solutionsList);
        const consoleManager = consoleModule.default.init(outputConsole);
        const graphManager = graphModule.default.init(graphContainer);

        consoleManager.clear()
        graphManager.clear()

        const { i, query } = queryService.default
            .solve(theoryEditor.getValue(), queryEditor.getValue(), flagsManager.flags(), consoleManager.outputConsumer());

        resultManager.printSolution(i, query, () => {
            document.querySelector(".overlay").style.display = "block"
        }, graph => {
            document.querySelector(".overlay").style.display = "none"
            graphManager.printGraph(graph)
        });
    });
}

function setListeners(solveAction) {
    document.querySelector("button.solve")
        .addEventListener("click", () => {
            try {
                solveAction()
            }
            catch (error) {
                alert(`${error.name.toUpperCase()} \n${error.message}`)
            }
        });

    document
        .querySelector("#inputFile")
        .addEventListener("change", e =>
            readFile(e.target.files[0], text => theoryEditor.setValue(text))
        );
}

function readFile(file, cb) {
    var reader = new FileReader();
    reader.onload = (function (reader) {
        return () => cb(reader.result);
    })(reader);
    reader.readAsText(file);
};

startup();

