import { monaco } from './editor.mjs';

import * as consoleModule from './modules/consoleModule.mjs';
import * as flagsModule from './modules/flagsModule.mjs';
import { DEFAULT_FLAGS } from './modules/flagsModule.mjs';
import * as graphModule from './modules/graphModule.mjs';
import * as abstractGraphModule from './modules/abstractGraphModule.mjs';
import * as solutionResultModule from './modules/solutionResultModule.mjs';
import * as queryService from './service/queryService.mjs';
import urlParamsService from './service/urlParamsService.mjs';
import examples from './examples.mjs';
import themeModule from './modules/themeModule.mjs';
import workspaceModule from './modules/workspaceModule.mjs';
import syntaxModule from './modules/syntaxModule.mjs';
import files from './modules/files.mjs';
import afFormats from './service/afFormats.mjs';
import solverClient from './service/solverClient.mjs';

const STRUCTURED = urlParamsService.STRUCTURED;
const ABSTRACT = urlParamsService.ABSTRACT;

const DEFAULT_QUERY = 'arg2p::solve';
const EMPTY_GRAPH = { arguments: [], attacks: [] };
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
    themeModule.init(document.querySelector(".theme-toggle"));
    const flagsManager = flagsModule.default.init(flagsContainer, urlState.flags,
        document.querySelector(".flags-form"), document.querySelector(".flags-warnings"),
        // The form offers the same semantics as the picker of abstract mode.
        semanticsSelector.innerHTML);
    flagsManager.onChange(() => syncSemanticsSelector(flagsManager, { mirrorOnly: true }));
    // Every edit of the theory, query, flags, graph or mode is saved in the
    // working memory (shortly after, see workspaceModule).
    let workspace = null;
    let syntax = null;
    const edited = () => { if (workspace !== null) workspace.changed(); };
    // In abstract mode the query is derived from the drawn graph, so every
    // edit to the graph refreshes the (read only) query editor.
    const abstractManager = abstractGraphModule.default.init(abstractContainer, () => {
        refreshAbstractQuery();
        edited();
    });
    theoryEditor.onDidChangeModelContent(edited);
    queryEditor.onDidChangeModelContent(edited);
    flagsManager.onChange(edited);

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
        if (newMode !== mode) clearResults();
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
        if (syntax) syntax.query.check();
        edited();
    }

    // The results belong to the mode they were computed in, so switching mode
    // drops them: solutions, console, graph and the canvas labelling.
    function clearResults() {
        solutionResultModule.default.init(solutionsList, nextButton);
        consoleModule.default.init(outputConsole).clear();
        graphContainer.innerHTML = "";
        graphContainer.classList.remove("empty");
        abstractManager.resetLabelling();
    }

    // Syntax errors shown where they are, as the user types (see syntaxModule).
    // The query of abstract mode is generated, so it is not checked.
    syntax = {
        theory: syntaxModule.attach(theoryEditor, document.querySelector(".theory-errors"), {
            check: queryService.default.checkTheory
        }),
        query: syntaxModule.attach(queryEditor, document.querySelector(".query-errors"), {
            check: queryService.default.checkQuery,
            enabled: () => mode !== ABSTRACT
        }),
        flags: syntaxModule.attach(flagsManager.editor(), document.querySelector(".flags-errors"), {
            check: queryService.default.checkTheory,
            label: "Flags",
            reveal: () => {
                window.jQuery && window.jQuery('a[href="#flags-tab"]').tab("show");
                document.querySelector(".flags-text").open = true;
            }
        })
    };

    // Examples open in a tab of their own, with the current flags.
    function applyExample(example, name) {
        workspace.open(example.mode === ABSTRACT
            ? { mode: ABSTRACT, theory: "", query: DEFAULT_QUERY, flags: flagsManager.flags(), abstractGraph: example.abstractGraph }
            : { mode: STRUCTURED, theory: example.theory, query: example.query, flags: flagsManager.flags(), abstractGraph: EMPTY_GRAPH },
        name);
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

    // A document of the working memory, as the editors show it. In abstract
    // mode the query editor holds the generated query: the document keeps
    // the structured one.
    function currentDocument() {
        return { ...currentState(), query: mode === ABSTRACT ? structuredQuery : queryEditor.getValue() };
    }

    // Puts a document in the editors, without the results of the last one.
    function showDocument(doc) {
        theoryEditor.setValue(doc.theory || "");
        flagsManager.setFlags(doc.flags || DEFAULT_FLAGS);
        abstractManager.setGraph(doc.abstractGraph || EMPTY_GRAPH);
        structuredQuery = doc.query || DEFAULT_QUERY;
        queryEditor.setValue(structuredQuery);
        clearResults();
        applyMode(doc.mode === ABSTRACT ? ABSTRACT : STRUCTURED);
        syncSemanticsSelector(flagsManager, { mirrorOnly: true });
    }

    workspace = workspaceModule.init({
        bar: document.querySelector(".doc-bar"),
        read: currentDocument,
        show: showDocument,
        blank: () => ({ mode: STRUCTURED, theory: "", query: DEFAULT_QUERY, flags: DEFAULT_FLAGS, abstractGraph: EMPTY_GRAPH })
    });
    // The last session's tabs (or Tweety, the first time). A shared link opens
    // in a tab of its own, so that it never overwrites the user's work, and
    // leaves the address bar: a reload does not open it again.
    workspace.restore(() => ({ mode: STRUCTURED, theory: examples.tweety.theory, query: DEFAULT_QUERY, flags: DEFAULT_FLAGS, abstractGraph: EMPTY_GRAPH }), "Tweety");
    if (sharesState(urlState)) {
        const sharedMode = urlState.mode !== null ? urlState.mode : STRUCTURED;
        workspace.open({
            mode: sharedMode,
            theory: urlState.theory !== null ? urlState.theory : (sharedMode === ABSTRACT ? "" : examples.tweety.theory),
            query: urlState.query !== null ? urlState.query : DEFAULT_QUERY,
            flags: urlState.flags !== null ? urlState.flags : DEFAULT_FLAGS,
            abstractGraph: urlState.abstractGraph !== null ? urlState.abstractGraph : EMPTY_GRAPH
        }, "Shared link");
        window.history.replaceState(null, "", window.location.pathname);
    }
    syncSemanticsSelector(flagsManager);
    reportUrlErrors(urlState.errors);

    setListeners(applyMode, applyExample, currentState, flagsManager, _ => {
        // The mode is captured here: switching it while solutions are still being
        // enumerated must not change where the pending ones are rendered.
        const abstract = mode === ABSTRACT;
        // Only the latest query is kept: a new run replaces the previous result.
        const resultManager = solutionResultModule.default.init(solutionsList, nextButton);
        const consoleManager = consoleModule.default.init(outputConsole);
        // Abstract mode draws the labelling onto the editable canvas instead.
        const graphManager = abstract ? null : graphModule.default.init(graphContainer, {
            fileName: () => workspace.active().name
        });

        consoleManager.clear()
        if (graphManager !== null) graphManager.clear()
        abstractManager.resetLabelling()

        // Abstract mode has no theory: arguments and attacks travel inside the query.
        const theoryText = abstract ? "" : theoryEditor.getValue();
        const queryText = abstract ? abstractManager.buildQuery() : queryEditor.getValue();
        if (abstract) queryEditor.setValue(queryText);

        // The solver works in a worker (see solverClient): the overlay offers
        // to stop it meanwhile. A run replaced by a newer one is ignored.
        const run = ++runs;
        overlay(true);
        const stopped = error => {
            overlay(false);
            resultManager.printError(error.stopped ? "Stopped" : error.name || "Error",
                error.stopped ? "The query was stopped before it gave an answer." : error.message);
        };
        solverClient.solve(theoryText, queryText, flagsManager.flags(), consoleManager.outputConsumer()).then(solved => {
            if (run !== runs) return;
            const { i, query, result } = solved;

            // Shows a solution's graph, or its labelling on the canvas. A failed
            // solution carries the graph left over from the last attempt, so the
            // canvas is only recoloured on an actual labelling.
            const show = solution => {
                if (graphManager !== null) graphManager.showSolution(solution, result)
                else if (solution.res === "yes") abstractManager.applyLabelling(solution.graph)
            };

            // The final "no more solutions" keeps the graph of the last solution on
            // screen, the one its card shows as selected. A first answer always
            // shows its graph, even a failure.
            let answered = false;
            resultManager.printSolution(i, query, () => overlay(true), solution => {
                overlay(false)
                if (solution.res === "yes" || !answered) show(solution)
                answered = true
            }, { hideExhaustedNo: abstract, onShow: show, onFail: stopped });
        }, error => {
            if (run !== runs) return;
            if (error.stopped || !error.syntax) return stopped(error);
            // A syntax error is shown where it is, and as a card that leads there.
            overlay(false);
            const place = syntax[error.syntax.where];
            place.report(error.syntax);
            resultManager.printError("Syntax error", `${error.syntax.where}, line ${error.syntax.line}: ${error.syntax.message}`,
                () => place.report(error.syntax));
        });
    }, workspace, currentDocument, abstractManager);

    // A shared link opens on its result: it is run as if RUN had been pressed,
    // once the page has been drawn. A plain visit runs nothing visible, but
    // warms the solver up.
    // The solver worker warms itself up as it starts (the first solve is much
    // slower than the next ones), in the background: the page is not held.
    if (sharesState(urlState)) setTimeout(() => document.querySelector("button.solve").click(), 0);
    else whenIdle(() => solverClient.start());
    document.querySelector(".solving-stop").addEventListener("click", () => solverClient.stop());
}

// Runs started: a newer one replaces the older ones' results.
let runs = 0;

function overlay(visible) {
    document.querySelector(".overlay").style.display = visible ? "flex" : "none";
}

function whenIdle(task) {
    window.addEventListener("load", () => {
        if ("requestIdleCallback" in window) requestIdleCallback(task, { timeout: 3000 });
        else setTimeout(task, 1000);
    });
}

function sharesState(state) {
    return [state.mode, state.theory, state.query, state.flags, state.abstractGraph]
        .some(it => it !== null);
}

// The flags editor owns the semantics: the selector only mirrors it, and adopts
// any labelling mode it does not know about rather than overwriting it. A
// missing one is filled in, except while the flags are being edited.
function syncSemanticsSelector(flagsManager, { mirrorOnly = false } = {}) {
    const current = flagsManager.flagValue(LABELLING_FLAG);
    if (current === null) {
        if (!mirrorOnly) flagsManager.setFlag(LABELLING_FLAG, semanticsSelector.value);
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

function setListeners(applyMode, applyExample, currentState, flagsManager, solveAction, workspace, currentDocument, abstractManager) {
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
            // In a tab of its own, named after the file.
            readFile(file, text => workspace.open({ ...currentDocument(), mode: STRUCTURED, theory: text }, file.name));
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
            applyExample(examples[link.dataset.example], link.innerText.trim());
            closeMenu();
        });
    });

    // Abstract frameworks: import (in a new tab) and export, in the ICCMA formats.
    const note = document.querySelector(".abstract-note");
    const say = (text, error = false) => {
        note.innerText = text;
        note.classList.toggle("error", error);
        note.hidden = text === "";
    };
    document.querySelector("#afFile").addEventListener("change", e => {
        const file = e.target.files[0];
        if (file === undefined) return;
        readFile(file, text => {
            try {
                const framework = afFormats.parse(text);
                workspace.open({ ...currentDocument(), mode: ABSTRACT, theory: "",
                    abstractGraph: { arguments: framework.arguments, attacks: framework.attacks } }, file.name);
                say(framework.renamed.length === 0 ? "" : `Renamed to Prolog atoms: ${framework.renamed.slice(0, 4)
                    .map(it => `${it.from} → ${it.to}`).join(", ")}${framework.renamed.length > 4 ? ` and ${framework.renamed.length - 4} more` : ""}`);
            } catch (error) {
                say(`Could not read ${file.name}: ${error.message}`, true);
            }
        });
        e.target.value = "";
    });
    document.querySelectorAll(".export-af").forEach(item => item.addEventListener("click", () => {
        const name = workspace.active().name;
        const format = item.dataset.format;
        if (format === "png") files.downloadUrl(files.fileName(name, "png"), abstractManager.png());
        else files.downloadText(files.fileName(name, format),
            format === "apx" ? afFormats.toApx(abstractManager.graph()) : afFormats.toTgf(abstractManager.graph()));
    }));

    document.querySelector(".save-theory").addEventListener("click", () =>
        files.downloadText(files.fileName(workspace.active().name, "pl", ["pro", "prolog", "txt"]), theoryEditor.getValue()));

    semanticsSelector.addEventListener("change", () =>
        flagsManager.setFlag(LABELLING_FLAG, semanticsSelector.value));

    document.querySelector("button.share").addEventListener("click", () =>
        openShareDialog(urlParamsService.shareUrl(currentState())));
    setShareDialogListeners();
}

// On small screens the navbar links live in a collapsible menu that would
// otherwise stay open over the page after picking an entry.
function closeMenu() {
    if (window.jQuery !== undefined) window.jQuery("#navbar-menu").collapse("hide");
}

const shareDialog = document.querySelector(".share-dialog");
const shareField = shareDialog.querySelector(".share-url");
const shareCopy = shareDialog.querySelector(".share-copy");

function openShareDialog(url) {
    shareField.value = url;
    shareCopy.innerText = "Copy";
    shareDialog.showModal();
    shareField.select();
}

function setShareDialogListeners() {
    shareCopy.addEventListener("click", () => {
        shareField.select();
        copyText(shareField.value).then(copied => {
            shareCopy.innerText = copied ? "Copied ✓" : "Press Ctrl+C";
        });
    });
    // The system share sheet (WhatsApp, mail...) where the browser has one.
    const native = shareDialog.querySelector(".share-native");
    native.hidden = navigator.share === undefined;
    native.addEventListener("click", () =>
        navigator.share({ title: document.title, url: shareField.value }).catch(() => { }));
    // A click on the backdrop (outside the dialog box) closes it.
    shareDialog.addEventListener("click", e => {
        if (e.target === shareDialog) shareDialog.close();
    });
}

// Resolves to whether the text made it to the clipboard: the async clipboard
// needs a secure context, the older command works on plain http too.
function copyText(text) {
    if (navigator.clipboard !== undefined) {
        return navigator.clipboard.writeText(text).then(() => true, () => legacyCopy());
    }
    return Promise.resolve(legacyCopy());
}

function legacyCopy() {
    try {
        return document.execCommand("copy");
    } catch (error) {
        return false;
    }
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
