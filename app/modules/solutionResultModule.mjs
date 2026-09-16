function SolutionResultModule() {

    // let TermFormatter = tuprolog.core.TermFormatter.Companion;
    // const formatter = () => TermFormatter.prettyExpressionsPrettyVariablesDefaultOperators();
    let parentHtml;
    let queryCounter = 1;

    function init(parentNode) {
        //const clearALL = document.createElement("button")
        //clearALL.classList.add("clearSolutions")
        //clearALL.innerText= "Clear All"
        //clearALL.addEventListener("click", () => solutionBox.innerHTML="")
        const solutionBox = document.createElement("div");
        solutionBox.classList.add("output");
        //parentNode.prepend(clearALL)
        parentNode.appendChild(solutionBox);
        parentHtml = solutionBox;
        return { printSolution };
    }


    function printSolution(iterator, query, beforeNext, afterNext, options) {
        const settings = options || {};
        const run = { accepted: 0 };
        const solutionContainer = document.createElement("div");
        solutionContainer.className = "solutionResultWrapper";
        const list = document.createElement("ul");
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.addEventListener('click', () => printNext(iterator, list, nextButton, beforeNext, afterNext, settings, run));
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "X";
        deleteButton.addEventListener('click', () => solutionContainer.remove());
        const solutionQuery = document.createElement("span");
        // solutionQuery.innerText = `${queryCounter} - ${formatter().format(query)}`;
        solutionQuery.innerText = `${queryCounter} - ${query}`;
        solutionContainer.appendChild(solutionQuery);
        solutionContainer.appendChild(nextButton);
        solutionContainer.appendChild(deleteButton);
        solutionContainer.appendChild(list);
        parentHtml.appendChild(solutionContainer);
        queryCounter++;
        printNext(iterator, list, nextButton, beforeNext, afterNext, settings, run)
        return list;
    }


    function addDomSolution(sol, solutionList, settings, run) {
        // Once a solution has been accepted, a trailing `no` only marks the end
        // of the enumeration. A leading one still carries meaning -- there is no
        // extension under the selected semantics -- so it is never hidden.
        if (settings.hideExhaustedNo && sol.res == "no" && run.accepted > 0) return;
        let element = document.createElement("li");
        if (sol.res == "yes") {
            element = printPrettySolutions(sol);
            run.accepted++;
        } else if (sol.res == "no") {
            element.innerText = "No";
        } else {
            element.innerText = "Halt : " + sol.exception;
        }
        solutionList.appendChild(element);
    }

    function printPrettySolutions(sol) {
        let element = document.createElement("li");
        element.innerText = sol.query; //formatter().format(sol.solvedQuery);
        if (sol.substitutions.length > 0) {
            let list = document.createElement('ul');
            let solutions = sol.substitutions.reduce((p, c) => {
                let li = document.createElement('li');
                //li.innerText = `${formatter().format(c.key)} : ${formatter().format(c.value)}`;
                li.innerText = `${c.first} : ${c.second}`;
                p.appendChild(li);
                return p;
            }, list);
            element.appendChild(solutions);
        }
        return element
    }

    function printNext(iterator, list, nextButton, beforeNext, afterNext, settings, run) {
        if (iterator.hasNext()) {
            beforeNext()
            new Promise((resolve, reject) => {
                setTimeout(function() {
                    let solution = iterator.next()
                    addDomSolution(solution, list, settings, run);
                    resolve(solution)
                }, 0)
            }).then(sol => afterNext(sol))
        }

        nextButton.disabled = !iterator.hasNext();
    }

    return { init }
}

export default SolutionResultModule()