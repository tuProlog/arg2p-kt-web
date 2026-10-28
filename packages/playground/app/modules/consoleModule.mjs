function ConsoleModule() {

    var outputConsole;

    function init(console) {
        outputConsole = console
        return { outputConsumer, clear }
    }

    function outputConsumer() {
        return it => {
            const newLine = "<br/>";
            const htmlString = it.replace(/\n/g, newLine);
            outputConsole.innerHTML = outputConsole.innerHTML + htmlString;
        };
    }

    function clear() {
        outputConsole.innerHTML = "";
    }

    return { init }
}

export default ConsoleModule()
