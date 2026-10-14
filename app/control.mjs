import { monaco } from './editor.mjs';

import * as consoleModule from './modules/consoleModule.mjs';
import * as flagsModule from './modules/flagsModule.mjs';
import * as graphModule from './modules/graphModule.mjs';
import * as abstractGraphModule from './modules/abstractGraphModule.mjs';
import * as solutionResultModule from './modules/solutionResultModule.mjs';
import * as queryService from './service/queryService.mjs';
import urlParamsService from './service/urlParamsService.mjs';
import examples from './examples.mjs';

const STRUCTURED = urlParamsService.STRUCTURED;
const ABSTRACT = urlParamsService.ABSTRACT;

const DEFAULT_QUERY = 'arg2p::solve';
const LABELLING_FLAG = 'argumentLabellingMode';

const theoryField = document.querySelector("#theory");
const queryField = document.querySelector("#query");
const solutionsList = document.querySelector("#solutions");
const nextButton = document.querySelector("button.next");

const outputConsole = document.querySelector("#console");
const graphContainer = document.querySelector("#graph");
const flagsContainer = document.querySelector("#flags");
const abstractContainer = document.querySelector("#abstract-editor");
const semanticsSelector = document.querySelector("#semantics");

const urlState = urlParamsService.read();

let mode = urlState.mode !== null ? urlState.mode : STRUCTURED;

let theoryEditor = monaco.editor.create(theoryField, {
    value: urlState.theory !== null ? urlState.theory : examples.tweety.theory,
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


// Queries are usually a single line, so the box looks like a text field and
// grows with its content only up to a few lines.
const QUERY_MAX_HEIGHT = 96;

let queryEditor = monaco.editor.create(queryField, {
    value: urlState.query !== null ? urlState.query : DEFAULT_QUERY,
    language: 'tuprolog',
    scrollbar: {
		vertical: 'auto',
		horizontal: 'hidden'
	},
    minimap: {
        enabled: false
    },
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 8,
    renderLineHighlight: 'none',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    // Matches the height of the RUN button next to it.
    padding: { top: 9, bottom: 9 },
    automaticLayout: true
});

function fitQueryHeight() {
    queryField.style.height = `${Math.min(QUERY_MAX_HEIGHT, queryEditor.getContentHeight())}px`;
}

queryEditor.onDidContentSizeChange(fitQueryHeight);
fitQueryHeight();

// Abstract mode fills the query editor with the query generated from the
// graph, so the structured one is kept here meanwhile and given back when
// switching back. Otherwise the generated query would leak into structured
// mode (and into the links shared from it).
let structuredQuery = queryEditor.getValue();


function startup() {
    const flagsManager = flagsModule.default.init(flagsContainer, urlState.flags);
    // In abstract mode the query is derived from the drawn graph, so every
    // edit to the graph refreshes the (read only) query editor.
    const abstractManager = abstractGraphModule.default.init(abstractContainer, () => refreshAbstractQuery());

    function refreshAbstractQuery() {
        if (mode !== ABSTRACT) return;
        try {
            queryEditor.setValue(abstractManager.buildQuery());
        } catch (error) {
            queryEditor.setValue("");
        }
    }

    function applyMode(newMode) {
        const leavingAbstract = mode === ABSTRACT && newMode !== ABSTRACT;
        if (mode !== ABSTRACT && newMode === ABSTRACT) structuredQuery = queryEditor.getValue();
        mode = newMode;
        document.body.classList.toggle("mode-abstract", mode === ABSTRACT);
        document.body.classList.toggle("mode-structured", mode === STRUCTURED);
        document.querySelectorAll(".mode-switch").forEach(it =>
            it.classList.toggle("active", it.dataset.mode === mode));
        queryEditor.updateOptions({ readOnly: mode === ABSTRACT });
        if (mode === ABSTRACT) {
            syncSemanticsSelector(flagsManager);
            refreshAbstractQuery();
            abstractManager.resize();
        } else {
            if (leavingAbstract) queryEditor.setValue(structuredQuery);
            if (queryEditor.getValue().trim() === "") queryEditor.setValue(DEFAULT_QUERY);
        }
    }

    function applyExample(example) {
        if (example.mode === ABSTRACT) abstractManager.setGraph(example.abstractGraph);
        else {
            theoryEditor.setValue(example.theory);
            // Also the one restored when coming from abstract mode.
            structuredQuery = example.query;
            queryEditor.setValue(example.query);
        }
        applyMode(example.mode);
    }

    function currentState() {
        return {
            mode,
            theory: theoryEditor.getValue(),
            query: queryEditor.getValue(),
            flags: flagsManager.flags(),
            abstractGraph: abstractManager.graph()
        };
    }

    syncSemanticsSelector(flagsManager);
    if (urlState.abstractGraph !== null) abstractManager.setGraph(urlState.abstractGraph);
    applyMode(mode);
    reportUrlErrors(urlState.errors);

    setListeners(applyMode, applyExample, currentState, flagsManager, _ => {
        // The mode is captured here: switching it while solutions are still being
        // enumerated must not change where the pending ones are rendered.
        const abstract = mode === ABSTRACT;
        // Only the latest query is kept: a new run replaces the previous result.
        const resultManager = solutionResultModule.default.init(solutionsList, nextButton);
        const consoleManager = consoleModule.default.init(outputConsole);
        // Abstract mode draws the labelling onto the editable canvas instead.
        const graphManager = abstract ? null : graphModule.default.init(graphContainer);

        consoleManager.clear()
        if (graphManager !== null) graphManager.clear()
        abstractManager.resetLabelling()

        // Abstract mode has no theory: arguments and attacks travel inside the query.
        const theoryText = abstract ? "" : theoryEditor.getValue();
        const queryText = abstract ? abstractManager.buildQuery() : queryEditor.getValue();
        if (abstract) queryEditor.setValue(queryText);

        const { i, query, result } = queryService.default
            .solve(theoryText, queryText, flagsManager.flags(), consoleManager.outputConsumer());

        resultManager.printSolution(i, query, () => {
            document.querySelector(".overlay").style.display = "block"
        }, solution => {
            document.querySelector(".overlay").style.display = "none"
            if (graphManager !== null) graphManager.showSolution(solution, result)
            // A failed solution carries the graph left over from the last attempt,
            // so the canvas is only recoloured on an actual labelling.
            else if (solution.res === "yes") abstractManager.applyLabelling(solution.graph)
        }, { hideExhaustedNo: abstract });
    });

    // A shared link opens on its result: it is run as if RUN had been pressed,
    // once the page has been drawn. A plain visit runs nothing.
    if (sharesState(urlState)) setTimeout(() => document.querySelector("button.solve").click(), 0);
}

function sharesState(state) {
    return [state.mode, state.theory, state.query, state.flags, state.abstractGraph]
        .some(it => it !== null);
}

// The flags editor owns the semantics: the selector only mirrors it, and adopts
// any labelling mode it does not know about rather than overwriting it.
function syncSemanticsSelector(flagsManager) {
    const current = flagsManager.flagValue(LABELLING_FLAG);
    if (current === null) {
        flagsManager.setFlag(LABELLING_FLAG, semanticsSelector.value);
        return;
    }
    if (semanticsSelector.querySelector(`option[value="${CSS.escape(current)}"]`) === null) {
        semanticsSelector.add(new Option(current, current));
    }
    semanticsSelector.value = current;
}

function reportUrlErrors(errors) {
    if (errors.length > 0) {
        alert(`LINK WARNING \n${errors.join("\n")}`);
    }
}

function setListeners(applyMode, applyExample, currentState, flagsManager, solveAction) {
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
        .addEventListener("change", e => {
            const file = e.target.files[0];
            if (file === undefined) return;
            readFile(file, text => theoryEditor.setValue(text));
            // Cleared so that picking the same file again reloads it.
            e.target.value = "";
        });

    document.querySelectorAll(".mode-switch").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            applyMode(link.dataset.mode);
        });
    });

    document.querySelectorAll(".example").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            applyExample(examples[link.dataset.example]);
            closeMenu();
        });
    });

    semanticsSelector.addEventListener("change", () =>
        flagsManager.setFlag(LABELLING_FLAG, semanticsSelector.value));

    document.querySelector(".share").addEventListener("click", e => {
        e.preventDefault();
        closeMenu();
        share(urlParamsService.shareUrl(currentState()));
    });
}

// On small screens the navbar links live in a collapsible menu that would
// otherwise stay open over the page after picking an entry.
function closeMenu() {
    if (window.jQuery !== undefined) window.jQuery("#navbar-menu").collapse("hide");
}

function share(url) {
    const copied = navigator.clipboard !== undefined
        ? navigator.clipboard.writeText(url)
        : Promise.reject();
    copied
        .then(() => alert(`SHAREABLE LINK \nCopied to the clipboard.\n\n${url}`))
        .catch(() => prompt("Shareable link :", url));
}

function readFile(file, cb) {
    var reader = new FileReader();
    reader.onload = (function (reader) {
        return () => cb(reader.result);
    })(reader);
    reader.readAsText(file);
};

startup();

// Makes the playground installable and usable offline. Only the production
// build has a service worker: the dev server is always served fresh.
if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
