import { labelColor } from './palette.mjs';

// Bindings named after a label (In, Out, Und) hold sets of arguments or
// statements: they are shown as chips coloured like the graph.
const LABELS = ["in", "out", "und"];

function SolutionResultModule() {

    let parentHtml;
    let nextButton;
    let activeRun = null;

    // Only one query is shown at a time, so the pane and the Next button (next to
    // RUN) are reset on every run.
    function init(parentNode, next) {
        parentNode.innerHTML = "";
        // Hidden until a solution has something to show besides the query itself.
        parentNode.classList.add("trivial");
        const solutionBox = document.createElement("div");
        solutionBox.classList.add("output");
        parentNode.appendChild(solutionBox);
        parentHtml = solutionBox;
        nextButton = next;
        nextButton.disabled = true;
        return { printSolution };
    }


    function printSolution(iterator, query, beforeNext, afterNext, options) {
        const settings = options || {};
        const run = { accepted: 0, shown: 0 };
        activeRun = run;
        const solutionContainer = document.createElement("div");
        solutionContainer.className = "solutionResultWrapper";
        const solutionQuery = document.createElement("div");
        solutionQuery.className = "solution-query";
        solutionQuery.innerText = `?- ${query}`;
        const list = document.createElement("ol");
        list.className = "solution-list";
        solutionContainer.appendChild(solutionQuery);
        solutionContainer.appendChild(list);
        parentHtml.appendChild(solutionContainer);
        // Assigned rather than added, so the button only ever drives the latest run.
        nextButton.onclick = () => printNext(iterator, list, beforeNext, afterNext, settings, run);
        printNext(iterator, list, beforeNext, afterNext, settings, run)
        return list;
    }


    function addDomSolution(sol, solutionList, settings, run) {
        // Once a solution has been accepted, a trailing `no` only marks the end
        // of the enumeration. A leading one still carries meaning -- there is no
        // extension under the selected semantics -- so it is never hidden.
        if (settings.hideExhaustedNo && sol.res == "no" && run.accepted > 0) return;
        run.shown++;
        let element;
        if (sol.res == "yes") {
            run.accepted++;
            element = solutionCard("yes", `Solution ${run.accepted}`);
            element.appendChild(sol.substitutions.length > 0
                ? bindingsOf(sol.substitutions)
                : textBlock("solution-term", sol.query));
        } else if (sol.res == "no") {
            element = solutionCard("no", run.accepted > 0 ? "No more solutions" : "No solutions");
        } else {
            element = solutionCard("halt", "Halted");
            element.appendChild(textBlock("solution-error", sol.exception));
        }
        solutionList.appendChild(element);
        element.scrollIntoView({ block: "nearest" });
        // A plain `yes` with no bindings (e.g. arg2p::solve) only repeats the
        // query: the pane is shown for bindings, failures and errors.
        if (sol.res != "yes" || sol.substitutions.length > 0) {
            parentHtml.parentNode.classList.remove("trivial");
        }
    }

    function solutionCard(kind, title) {
        const element = document.createElement("li");
        element.className = `solution ${kind}`;
        const header = document.createElement("div");
        header.className = "solution-header";
        const badge = document.createElement("span");
        badge.className = "solution-badge";
        badge.innerText = kind;
        const caption = document.createElement("span");
        caption.innerText = title;
        header.appendChild(badge);
        header.appendChild(caption);
        element.appendChild(header);
        return element;
    }

    function textBlock(className, text) {
        const block = document.createElement("div");
        block.className = className;
        block.innerText = text;
        return block;
    }

    // `Variable = value` rows. Any other value keeps its Prolog form, where a
    // list and its single element would otherwise look the same.
    function bindingsOf(substitutions) {
        const table = document.createElement("dl");
        table.className = "bindings";
        substitutions.forEach(it => {
            const name = document.createElement("dt");
            name.innerText = it.first;
            const value = document.createElement("dd");
            const label = it.first.toLowerCase();
            const items = LABELS.includes(label) ? listItems(it.second) : null;
            if (items === null) {
                value.innerText = it.second;
            } else if (items.length === 0) {
                value.appendChild(textBlock("binding-empty", "[ ]"));
            } else {
                items.forEach(item => {
                    const chip = document.createElement("span");
                    chip.className = "binding-chip";
                    chip.innerText = item;
                    chip.style.backgroundColor = labelColor(label);
                    value.appendChild(chip);
                });
            }
            table.appendChild(name);
            table.appendChild(value);
        });
        return table;
    }

    // The top level elements of a Prolog list term, or null for any other term.
    function listItems(term) {
        const text = term.trim();
        if (!text.startsWith("[") || !text.endsWith("]")) return null;
        const body = text.slice(1, -1).trim();
        if (body === "") return [];
        const items = [];
        let depth = 0;
        let quoted = false;
        let current = "";
        for (const char of body) {
            if (char === "'") quoted = !quoted;
            if (!quoted && "([{".includes(char)) depth++;
            if (!quoted && ")]}".includes(char)) depth--;
            // A tail (`[a | T]`) is not a plain list: show the term as it is.
            if (!quoted && depth === 0 && char === "|") return null;
            if (!quoted && depth === 0 && char === ",") {
                items.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        items.push(current.trim());
        return items;
    }

    function printNext(iterator, list, beforeNext, afterNext, settings, run) {
        if (!iterator.hasNext()) return;
        nextButton.disabled = true;
        beforeNext()
        new Promise((resolve, reject) => {
            setTimeout(function() {
                let solution = iterator.next()
                addDomSolution(solution, list, settings, run);
                resolve(solution)
            }, 0)
        }).then(sol => {
            // Checked once the solution is consumed, so Next is only offered
            // when there really is another one. A run replaced in the meantime
            // no longer owns the button.
            if (run === activeRun) nextButton.disabled = !iterator.hasNext();
            afterNext(sol)
        })
    }

    return { init }
}

export default SolutionResultModule()
