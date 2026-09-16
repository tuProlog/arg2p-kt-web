import * as vis from "vis-network/standalone/esm/vis-network.js"
import { labelColor, UNLABELLED_COLOR } from './palette.mjs';
import abstractQueryService from '../service/abstractQueryService.mjs';

const ATOM = /^[a-z][a-zA-Z_0-9]*$/;

function AbstractGraphModule() {

    let editor;
    let nodes;
    let edges;
    let network;
    let onChange = () => { };

    // The rename box is a plain input floated over the node being edited.
    let renameBox = null;
    let stopTracking = null;

    function init(container, changeListener) {
        editor = container;
        onChange = changeListener || (() => { });
        nodes = new vis.DataSet([]);
        edges = new vis.DataSet([]);
        network = new vis.Network(container, { nodes, edges }, networkOptions());
        network.on("doubleClick", params => {
            if (params.nodes.length === 1) startRename(params.nodes[0]);
        });
        return { setGraph, graph, buildQuery, applyLabelling, resetLabelling, clear, resize }
    }

    function networkOptions() {
        return {
            autoResize: true,
            height: "100%",
            width: "100%",
            nodes: {
                shape: "ellipse",
                color: UNLABELLED_COLOR,
                font: { color: "#ffffff" }
            },
            edges: {
                arrows: "to"
            },
            physics: {
                stabilization: true
            },
            // `editNode` is deliberately absent: leaving it out drops the Edit
            // button from the toolbar, so renaming happens by double click only.
            manipulation: {
                enabled: true,
                initiallyActive: true,
                addNode: (data, callback) => {
                    callback(nodeOf(suggestedName(), data.x, data.y));
                    changed();
                    stayIn(() => network.addNodeMode());
                },
                addEdge: (data, callback) => {
                    const duplicate = edges.get(edgeId(data.from, data.to)) !== null;
                    callback(duplicate ? null : edgeOf(data.from, data.to));
                    if (!duplicate) changed();
                    stayIn(() => network.addEdgeMode());
                },
                deleteNode: (data, callback) => {
                    closeRename();
                    callback(data);
                    changed();
                },
                deleteEdge: (data, callback) => {
                    callback(data);
                    changed();
                }
            }
        }
    }

    // vis drops back to the main toolbar after a single insert. Re-entering the
    // mode keeps it armed until `Back` is pressed, so a whole graph can be drawn
    // in one go. The re-entry is deferred because entering a mode unbinds the
    // temporary click handler we are currently running inside.
    function stayIn(enterMode) {
        setTimeout(enterMode, 0);
    }

    function suggestedName() {
        for (let i = 1; ; i++) {
            const candidate = `a${i}`;
            if (nodes.get(candidate) === null) return candidate;
        }
    }

    function isAvailable(name, currentName) {
        if (!ATOM.test(name)) return false;
        return name === currentName || nodes.get(name) === null;
    }

    function startRename(name) {
        closeRename();
        const box = document.createElement("input");
        box.type = "text";
        box.className = "abstract-rename";
        box.title = "Argument name: a lowercase letter followed by letters, digits or underscores";
        box.value = name;
        editor.appendChild(box);
        renameBox = box;

        // Keep the box on top of the node while the graph settles or is panned.
        const track = () => {
            const position = network.getPositions([name])[name];
            if (position === undefined) return closeRename();
            const point = network.canvasToDOM(position);
            box.style.left = `${point.x}px`;
            box.style.top = `${point.y}px`;
        };
        track();
        network.on("afterDrawing", track);
        stopTracking = () => network.off("afterDrawing", track);

        box.addEventListener("input", () =>
            box.classList.toggle("invalid", !isAvailable(box.value.trim(), name)));
        box.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") {
                event.preventDefault();
                commitRename(name);
            } else if (event.key === "Escape") {
                event.preventDefault();
                closeRename();
            }
        });
        box.addEventListener("blur", () => commitRename(name));
        box.focus();
        box.select();
    }

    // Returns what was typed, or null when there was nothing open. Clearing the
    // field first keeps the blur handler from running the close twice.
    function closeRename() {
        if (renameBox === null) return null;
        const box = renameBox;
        renameBox = null;
        if (stopTracking !== null) {
            stopTracking();
            stopTracking = null;
        }
        box.remove();
        return box.value.trim();
    }

    function commitRename(name) {
        const position = network.getPositions([name])[name];
        const wanted = closeRename();
        // An invalid or taken name is simply dropped: the node keeps the old one.
        if (wanted === null || wanted === name || position === undefined) return;
        if (!isAvailable(wanted, name)) return;
        renameNode(name, wanted, position.x, position.y);
        changed();
    }

    function renameNode(oldName, newName, x, y) {
        const attacks = edges.get().map(it => ({
            from: it.from === oldName ? newName : it.from,
            to: it.to === oldName ? newName : it.to
        }));
        nodes.remove(oldName);
        nodes.add(nodeOf(newName, x, y));
        edges.clear();
        edges.add(attacks.map(it => edgeOf(it.from, it.to)));
    }

    function nodeOf(name, x, y) {
        return { id: name, label: name, x, y, color: UNLABELLED_COLOR };
    }

    function edgeId(from, to) {
        return `${from}->${to}`;
    }

    function edgeOf(from, to) {
        return { id: edgeId(from, to), from, to };
    }

    function setGraph(newGraph) {
        closeRename();
        nodes.clear();
        edges.clear();
        nodes.add(newGraph.arguments.map(it => nodeOf(it)));
        edges.add(newGraph.attacks
            .filter(it => nodes.get(it.from) !== null && nodes.get(it.to) !== null)
            .map(it => edgeOf(it.from, it.to)));
        network.fit();
        changed();
    }

    function clear() {
        setGraph({ arguments: [], attacks: [] });
    }

    // The canvas is sized to 0 while the abstract panel is hidden, so the
    // network has to be told to redraw once the panel becomes visible.
    function resize() {
        network.setSize("100%", "100%");
        network.redraw();
        network.fit();
    }

    function graph() {
        return {
            arguments: nodes.getIds(),
            attacks: edges.get().map(it => ({ from: it.from, to: it.to }))
        };
    }

    function buildQuery() {
        return abstractQueryService.buildQuery(graph());
    }

    function applyLabelling(bridgedGraph) {
        nodes.update(bridgedGraph.arguments
            .map(it => ({ name: abstractQueryService.argumentName(it), label: it.label }))
            .filter(it => nodes.get(it.name) !== null)
            .map(it => ({ id: it.name, color: labelColor(it.label) })));
    }

    function resetLabelling() {
        nodes.update(nodes.getIds().map(it => ({ id: it, color: UNLABELLED_COLOR })));
    }

    function changed() {
        resetLabelling();
        onChange(graph());
    }

    return { init }
}

export default AbstractGraphModule()
