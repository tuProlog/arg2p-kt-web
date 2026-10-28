import { monaco } from '../editor.mjs';

// Syntax errors where they are: underlined in the editor (the message shows
// when hovering it), and written in a strip under it, which takes to the
// spot when tapped, as touch screens have no hover. Each editor is checked
// shortly after the typing stops; RUN reports its errors the same way.

const CHECK_DELAY = 500;
const OWNER = "arg2p-syntax";

// `check(text)` gives null, or { line, column, length, message }. `enabled()`
// tells whether the editor is checked at all (the generated query of
// abstract mode is not). `reveal()` makes the editor visible first, when it
// is in a hidden place (the flags).
function attach(editor, strip, { check, enabled = () => true, label, reveal = () => { } }) {
    let timer = null;
    let shown = null;

    const run = () => show(enabled() ? check(editor.getValue()) : null);

    function show(error) {
        shown = error;
        const model = editor.getModel();
        if (error === null) {
            monaco.editor.setModelMarkers(model, OWNER, []);
            strip.hidden = true;
            strip.replaceChildren();
            return;
        }
        const line = Math.min(error.line, model.getLineCount());
        const column = Math.min(error.column, model.getLineMaxColumn(line));
        monaco.editor.setModelMarkers(model, OWNER, [{
            severity: monaco.MarkerSeverity.Error,
            message: error.message,
            startLineNumber: line,
            startColumn: column,
            endLineNumber: line,
            endColumn: Math.min(column + error.length, model.getLineMaxColumn(line) + 1)
        }]);
        const place = document.createElement("span");
        place.className = "syntax-place";
        place.innerText = `${label ? label + ", " : ""}line ${line}, col ${column}`;
        const message = document.createElement("span");
        message.innerText = error.message;
        strip.replaceChildren(place, message);
        strip.hidden = false;
    }

    function go() {
        if (shown === null) return;
        reveal();
        const line = Math.min(shown.line, editor.getModel().getLineCount());
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column: shown.column });
        editor.focus();
    }

    strip.setAttribute("role", "button");
    strip.tabIndex = 0;
    strip.title = "Go to the error";
    strip.addEventListener("click", go);
    strip.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            go();
        }
    });
    editor.onDidChangeModelContent(() => {
        clearTimeout(timer);
        timer = setTimeout(run, CHECK_DELAY);
    });
    run();

    // An error found by RUN: shown at once, and the editor taken to it.
    return {
        check: run,
        report(error) {
            clearTimeout(timer);
            show(error);
            go();
        }
    };
}

export default { attach }
