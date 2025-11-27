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

const examples = {
0 : `% R

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
1 : `% R

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
2 : `d1(X) : bird(X) => flies(X).
d2(X) : penguin(X) => bird(X).
d3(X) : sparrow(X) => bird(X).

p1(X) : penguin(X) => -flies(X).
p2(X) : penguin(X) => -d1(X).

f1 :=> penguin(tweety).
f2 :=> sparrow(jack).
` 
 }


let theoryEditor = monaco.editor.create(theoryField, {
    value: examples[2],
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


let queryEditor = monaco.editor.create(queryField, {
    value: 'arg2p::solve',
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
    

    document.querySelectorAll(".example").forEach(link => {
        link.addEventListener("click", () => {
            theoryEditor.setValue(examples[link.dataset.value])
            queryEditor.setValue("arg2p::solve")
        });
    });  
}

function readFile(file, cb) {
    var reader = new FileReader();
    reader.onload = (function (reader) {
        return () => cb(reader.result);
    })(reader);
    reader.readAsText(file);
};

startup();

