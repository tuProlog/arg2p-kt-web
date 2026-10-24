import * as vis from "vis-network/standalone/esm/vis-network.js"
import { labelColor } from './palette.mjs';
import { parseDescriptor, supportsOf, levelsOf } from './argumentDescriptor.mjs';
import { layeredLayout } from './layeredLayout.mjs';
import files from './files.mjs';

const SUPPORTS_SETTING = "arg2p.showSupports";
const CONCLUSIONS_SETTING = "arg2p.showConclusions";
const SUPPORT_COLOR = "#9a9a9a";
// Conclusions on the nodes are wrapped at their commas into lines of about
// this length, and cut after a few lines: the popup has the full text.
const CONCLUSION_LINE = 18;
const CONCLUSION_LINES = 3;
// The layout keeps nodes this far apart, edge to edge, and rows at least
// LEVEL_SEPARATION apart.
const NODE_GAP = 40;
const LEVEL_SEPARATION = 100;
// Size of a drawn node: vis draws a label in 14px arial, 28px per line, inside
// an ellipse about 1.32 times as wide as its widest line (measured).
const LABEL_FONT = "14px arial";
const LINE_HEIGHT = 28;
const ELLIPSE_RATIO = 1.32;
const ELLIPSE_PADDING = 6;
// Attacks are curved, so that mutual attacks do not overlap; long ones are
// curved less, or they would arc across the whole drawing.
const CURVE = 0.25;
const CURVE_LENGTH = 160;
const MIN_CURVE = 0.06;

function GraphModule() {

    // One network per run: moving between the stages of a computation updates
    // it in place, so arguments keep their position from one stage to the next.
    let panel;
    let nodes;
    let edges;
    let network;

    // The arguments drawn, by id, with their parsed descriptor and attacks,
    // and what the layout needs to place them again.
    let details = new Map();
    let levels = new Map();
    let supports = [];
    let attackList = [];

    // The stages of the solution shown: the solver context is kept for every
    // step of the computation, numbered from 0 to the context of the solution.
    let result = null;
    let lastStage = 0;
    let stage = 0;

    // The argument popup: shown while hovering a node, kept open by a click
    // (or a tap, the only way to reach it on touch screens).
    let popup;
    let shown = null;
    let pinned = null;

    // `options.fileName()`: the name of the picture the graph is saved as.
    function init(container, options = {}) {
        panel = container
        prepareContainer(container)
        popup = container.querySelector(".argument-popup")
        nodes = new vis.DataSet([])
        edges = new vis.DataSet([])
        // Nodes are placed by layeredLayout (facts on the bottom row, every
        // argument above the ones it is built on), so vis only draws them.
        network = new vis.Network(container.querySelector("#graph-visual"), { nodes, edges }, {
            autoResize: true,
            height: "100%",
            width: "100%",
            physics: false,
            nodes: {
                font: { color: "#ffffff" }
            },
            edges: {
                arrows: "to",
                // Curved, so that mutual attacks and attacks along a row do not
                // overlap (or run behind the nodes in between).
                smooth: { type: "curvedCW", roundness: 0.25 }
            },
            interaction: {
                hover: true
            }
        })
        network.on("hoverNode", params => showPopup(params.node))
        network.on("blurNode", () => pinned !== null ? showPopup(pinned) : hidePopup())
        network.on("click", params => {
            pinned = params.nodes.length === 1 ? params.nodes[0] : null
            if (pinned !== null) showPopup(pinned)
            else hidePopup()
        })
        // Follows the node while the graph settles, is dragged or zoomed.
        network.on("afterDrawing", placePopup)

        const toggle = container.querySelector(".show-supports")
        toggle.checked = readSetting(SUPPORTS_SETTING, "true") === "true"
        toggle.addEventListener("change", () => {
            writeSetting(SUPPORTS_SETTING, String(toggle.checked))
            edges.update(edges.get({ filter: it => it.support }).map(it => ({ id: it.id, hidden: !toggle.checked })))
        })
        const conclusions = container.querySelector(".show-conclusions")
        conclusions.checked = readSetting(CONCLUSIONS_SETTING, "false") === "true"
        conclusions.addEventListener("change", () => {
            writeSetting(CONCLUSIONS_SETTING, String(conclusions.checked))
            nodes.update(nodes.getIds().map(id => ({ id, label: nodeLabel(nodeName(id)) })))
            placeNodes()
            network.fit()
        })
        container.querySelector(".stage-previous").addEventListener("click", () => showStage(stage - 1))
        container.querySelector(".stage-next").addEventListener("click", () => showStage(stage + 1))
        container.querySelector(".graph-png").addEventListener("click", () =>
            files.downloadUrl(files.fileName(options.fileName ? options.fileName() : "graph", "png"),
                files.graphPng(network, container.querySelector("#graph-visual"))))
        return { printGraph, showSolution, clear }
    }

    // Computed again for every graph shown: the same arguments get the same
    // place, so stepping through the stages does not move them around.
    function placeNodes() {
        const area = panel.querySelector(".graph-container")
        const sizes = new Map([...levels.keys()].map(name => [name, nodeSize(nodeLabel(name))]))
        const positions = layeredLayout(levels, supports, {
            sizes,
            gap: NODE_GAP,
            levelSeparation: LEVEL_SEPARATION,
            attacks: attackList,
            // Fill the panel rather than drawing a thin strip in its middle.
            aspect: area.clientWidth > 0 ? area.clientHeight / area.clientWidth : null
        })
        nodes.update([...positions].map(([name, point]) => ({ id: toInt(name), x: point.x, y: point.y })))
        edges.update(attackList
            .filter(it => positions.has(it.from) && positions.has(it.to))
            .map(it => {
                const from = positions.get(it.from)
                const to = positions.get(it.to)
                const length = Math.hypot(to.x - from.x, to.y - from.y)
                const roundness = Math.max(MIN_CURVE, Math.min(CURVE, CURVE * CURVE_LENGTH / length))
                return { id: `${it.from}->${it.to}`, smooth: { type: "curvedCW", roundness } }
            }))
    }

    function prepareContainer(container) {
        // Sizing lives in style.css, so the panels can be stacked on small screens.
        container.innerHTML = `
            <div class="graph-bar">
                <div class="graph-legend">
                    <span class="legend-item"><span class="legend-line attack"></span>attack</span>
                    <label class="legend-item graph-toggle" title="Show which sub-arguments every argument is built on">
                        <input type="checkbox" class="show-supports">
                        <span class="legend-line support"></span>supports
                    </label>
                    <label class="legend-item graph-toggle" title="Write the conclusion of every argument under its name">
                        <input type="checkbox" class="show-conclusions">
                        conclusions
                    </label>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary graph-png" title="Download the graph as a picture"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> PNG</button>
                <div class="graph-stages" hidden>
                    <button class="btn btn-sm btn-outline-secondary stage-previous" title="Previous stage of the computation" aria-label="Previous stage">&#9664;</button>
                    <span class="stage-label" title="Every step of the computation keeps its own context: browse them to see how the graph is built"></span>
                    <button class="btn btn-sm btn-outline-secondary stage-next" title="Next stage of the computation" aria-label="Next stage">&#9654;</button>
                </div>
            </div>
            <div class="graph-container">
                <div id="graph-visual"></div>
                <div class="graph-empty" hidden>No arguments at this stage.</div>
                <div class="argument-popup" hidden></div>
            </div>
        `;
    }

    // Shows the graph of a solution, and lets the user step back through the
    // stages that produced it when the solver exposes them.
    function showSolution(solution, solveResult) {
        const navigable = solveResult !== undefined && solveResult !== null
            && typeof solveResult.graphAt === "function" && solution.context > 0
        result = navigable ? solveResult : null
        lastStage = navigable ? solution.context : 0
        stage = lastStage
        printGraph(solution.graph)
        updateStages()
    }

    // The graph of a stage comes from the solver worker: a later click wins.
    function showStage(target) {
        if (result === null || target < 0 || target > lastStage) return
        stage = target
        updateStages()
        Promise.resolve(result.graphAt(target)).then(graph => {
            if (stage === target) printGraph(graph)
        })
    }

    function updateStages() {
        const bar = panel.querySelector(".graph-stages")
        bar.hidden = result === null
        bar.querySelector(".stage-label").innerText = `Stage ${stage} / ${lastStage}`
        bar.querySelector(".stage-previous").disabled = stage <= 0
        bar.querySelector(".stage-next").disabled = stage >= lastStage
    }

    function clear() {
        result = null
        details = new Map()
        pinned = null
        hidePopup()
        nodes.clear()
        edges.clear()
        panel.classList.remove("empty")
        panel.querySelector(".graph-empty").hidden = true
        updateStages()
    }

    function printGraph(graph) {
        // Nothing to draw and no stages to browse (e.g. a plain Prolog query):
        // the panel steps aside.
        panel.classList.toggle("empty", graph.arguments.length === 0 && result === null)
        panel.querySelector(".graph-empty").hidden = graph.arguments.length > 0 || result === null
        details = new Map(graph.arguments.map(it => [it.id, {
            label: it.label,
            ...parseDescriptor(it.descriptor),
            attackedBy: graph.attacks.filter(a => a.to === it.id).map(a => a.from),
            attacks: graph.attacks.filter(a => a.from === it.id).map(a => a.to)
        }]))
        drawGraph(graph.arguments, graph.attacks, supportsOf(graph.arguments))
        if (shown !== null) {
            if (details.has(nodeName(shown))) showPopup(shown)
            else {
                pinned = null
                hidePopup()
            }
        }
    }

    function toInt(identifier) {
        return parseInt(identifier.substring(1))
    }

    function nodeName(id) {
        return `A${id}`
    }

    function drawGraph(argumentList, attacks, supportsList) {
        const wasEmpty = nodes.length === 0
        const ids = argumentList.map(it => toInt(it.id))
        levels = levelsOf(argumentList)
        supports = supportsList
        attackList = attacks
        nodes.remove(nodes.getIds().filter(it => !ids.includes(it)))
        nodes.update(argumentList.map(it => ({
            id: toInt(it.id),
            label: nodeLabel(it.id),
            color: labelColor(it.label)
        })))

        const showSupports = panel.querySelector(".show-supports").checked
        const wanted = [
            ...attacks.map(it => ({
                id: `${it.from}->${it.to}`,
                from: toInt(it.from),
                to: toInt(it.to),
                support: false
            })),
            ...supportsList.map(it => ({
                id: `${it.from}=>${it.to}`,
                from: toInt(it.from),
                to: toInt(it.to),
                support: true,
                hidden: !showSupports,
                dashes: [3, 4],
                // Supports run between rows, so they can stay straight.
                smooth: false,
                color: { color: SUPPORT_COLOR, highlight: SUPPORT_COLOR, hover: SUPPORT_COLOR },
                arrows: { to: { enabled: true, scaleFactor: 0.6 } }
            }))
        ]
        const edgeIds = wanted.map(it => it.id)
        edges.remove(edges.getIds().filter(it => !edgeIds.includes(it)))
        edges.update(wanted)
        placeNodes()

        if (wasEmpty && nodes.length > 0) network.fit()
    }

    function nodeLabel(name) {
        const argument = details.get(name)
        if (argument === undefined || !panel.querySelector(".show-conclusions").checked) return name
        return [name, ...wrapTerm(argument.conclusion)].join("\n")
    }

    // `caFa(closedReg, damages)` -> ["caFa(closedReg,", "damages)"]: lines
    // broken after commas, the last one cut short when there are too many.
    function wrapTerm(term) {
        const lines = []
        term.split(/(?<=,) /).forEach(part => {
            const last = lines.length - 1
            if (last >= 0 && (lines[last] + " " + part).length <= CONCLUSION_LINE) lines[last] += " " + part
            else lines.push(part)
        })
        if (lines.length <= CONCLUSION_LINES) return lines
        return [...lines.slice(0, CONCLUSION_LINES - 1), lines[CONCLUSION_LINES - 1] + " …"]
    }

    let measure = null

    // The size vis will draw a node with this label at (see LINE_HEIGHT).
    function nodeSize(label) {
        if (measure === null) {
            measure = document.createElement("canvas").getContext("2d")
            measure.font = LABEL_FONT
        }
        const lines = label.split("\n")
        const height = lines.length * LINE_HEIGHT
        const text = Math.max(...lines.map(it => measure.measureText(it).width))
        return { width: Math.max(height, text * ELLIPSE_RATIO + ELLIPSE_PADDING), height }
    }

    function showPopup(id) {
        const argument = details.get(nodeName(id))
        if (argument === undefined) return hidePopup()
        shown = id
        popup.replaceChildren(
            popupHeader(argument),
            popupRow("Conclusion", text(argument.conclusion, "argument-term")),
            popupRow("Top rule", text(argument.rule, "argument-term")),
            popupRow("Built on", chips(argument.subArguments)),
            popupRow("Attacked by", chips(argument.attackedBy)),
            popupRow("Attacks", chips(argument.attacks))
        )
        popup.hidden = false
        placePopup()
    }

    function hidePopup() {
        shown = null
        popup.hidden = true
    }

    // Next to the node, flipped to the other side or clamped when it would
    // leave the graph area.
    function placePopup() {
        if (shown === null) return
        const position = network.getPositions([shown])[shown]
        if (position === undefined) return hidePopup()
        const point = network.canvasToDOM(position)
        const area = panel.querySelector(".graph-container")
        const margin = 8
        const gap = 22
        const width = popup.offsetWidth
        const height = popup.offsetHeight
        let left = point.x + gap
        if (left + width > area.clientWidth - margin) left = point.x - gap - width
        left = Math.max(margin, Math.min(left, area.clientWidth - width - margin))
        const top = Math.max(margin, Math.min(point.y - height / 2, area.clientHeight - height - margin))
        popup.style.left = `${left}px`
        popup.style.top = `${top}px`
    }

    function popupHeader(argument) {
        const header = document.createElement("div")
        header.className = "argument-popup-header"
        header.appendChild(chip(argument.id))
        const label = document.createElement("span")
        label.className = "argument-label"
        label.innerText = argument.label === "na" ? "not labelled yet" : argument.label
        header.appendChild(label)
        return header
    }

    function popupRow(title, content) {
        const row = document.createElement("div")
        row.className = "argument-popup-row"
        const name = document.createElement("div")
        name.className = "argument-popup-title"
        name.innerText = title
        row.appendChild(name)
        row.appendChild(content)
        return row
    }

    function text(value, className) {
        const element = document.createElement("div")
        element.className = className
        element.innerText = value
        return element
    }

    function chips(ids) {
        const list = document.createElement("div")
        list.className = "argument-chips"
        if (ids.length === 0) list.appendChild(text("none", "argument-none"))
        ids.forEach(it => list.appendChild(chip(it)))
        return list
    }

    // An argument id in the colour of its label.
    function chip(id) {
        const element = document.createElement("span")
        element.className = "argument-chip"
        element.innerText = id
        const argument = details.get(id)
        element.style.backgroundColor = labelColor(argument !== undefined ? argument.label : null)
        return element
    }

    function readSetting(name, fallback) {
        try {
            const value = window.localStorage.getItem(name)
            return value !== null ? value : fallback
        } catch (error) {
            return fallback
        }
    }

    function writeSetting(name, value) {
        try {
            window.localStorage.setItem(name, value)
        } catch (error) {
            // Not persisted (private mode, storage disabled): the toggle still works.
        }
    }

    return { init }
}

export default GraphModule()
