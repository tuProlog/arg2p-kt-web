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


    function printSolution(iterator, query, beforeNext, afterNext) {
        const solutionContainer = document.createElement("div");
        solutionContainer.className = "solutionResultWrapper";
        const list = document.createElement("ul");
        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.addEventListener('click', () => printNext(iterator, list, nextButton, beforeNext, afterNext));
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
        printNext(iterator, list, nextButton, beforeNext, afterNext)
        return list;
    }


    function addDomSolution(sol, solutionList) {
        let element = document.createElement("li");
        if (sol.res == "yes") {
            element = printPrettySolutions(sol);

        } else if (sol.res == "no") {
            element.innerText = "No";
        } else {
            element.innerText = "Halt : " + sol.exception;
        }
        solutionList.appendChild(element);
    }

    function printPrettySolutions(sol) {
        let element = document.createElement("li");
        element.innerText = query; //formatter().format(sol.solvedQuery);
        if (!sol.substitutions.isEmpty()) {
            let list = document.createElement('ul');
            let solutions = sol.substitutions.reduce((p, c) => {
                let li = document.createElement('li');
                // li.innerText = `${formatter().format(c.key)} : ${formatter().format(c.value)}`;
                li.innerText = `${formatter().format(c.key)} : ${c.value}`;
                p.appendChild(li);
                return p;
            }, list);
            element.appendChild(solutions);
        }
        return element
    }

    function printNext(iterator, list, nextButton, beforeNext, afterNext) {
        if (iterator.hasNext()) {
            beforeNext()
            new Promise((resolve, reject) => {
                setTimeout(function() {
                    solution = iterator.next()
                    addDomSolution(solution, list);
                    resolve(solution)
                }, 0)
            }).finally(sol => afterNext(sol.graph))
        }

        nextButton.disabled = !iterator.hasNext();
    }

    return { init }
}

export default SolutionResultModule()