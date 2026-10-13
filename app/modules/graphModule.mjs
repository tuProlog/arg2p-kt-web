import * as vis from "vis-network/standalone/esm/vis-network.js"
import { labelColor } from './palette.mjs';
import { parseDescriptor, supportsOf, levelsOf } from './argumentDescriptor.mjs';
import { layeredLayout } from './layeredLayout.mjs';

const SUPPORTS_SETTING = "arg2p.showSupports";
const CONCLUSIONS_SETTING = "arg2p.showConclusions";
const SUPPORT_COLOR = "#9a9a9a";
// Longer conclusions are shortened on the node: the popup has the full text.
const CONCLUSION_LENGTH = 24;
// Horizontal room per node, wider when the nodes also carry their conclusion.
const NODE_SPACING = 90;
const NODE_SPACING_WITH_CONCLUSIONS = 150;
const LEVEL_SEPARATION = 100;

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

    function init(container) {
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
        return { printGraph, showSolution, clear }
    }

    // Computed again for every graph shown: the same arguments get the same
    // place, so stepping through the stages does not move them around.
    function placeNodes() {
        const wide = panel.querySelector(".show-conclusions").checked
        const positions = layeredLayout(levels, supports, {
            spacing: wide ? NODE_SPACING_WITH_CONCLUSIONS : NODE_SPACING,
            levelSeparation: LEVEL_SEPARATION
        })
        nodes.update([...positions].map(([name, point]) => ({ id: toInt(name), x: point.x, y: point.y })))
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

    function showStage(target) {
        if (result === null || target < 0 || target > lastStage) return
        stage = target
        printGraph(result.graphAt(stage))
        updateStages()
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
        nodes.remove(nodes.getIds().filter(it => !ids.includes(it)))
        nodes.update(argumentList.map(it => ({
            id: toInt(it.id),
            label: nodeLabel(it.id),
            color: labelColor(it.label)
        })))
        placeNodes()

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

        if (wasEmpty && nodes.length > 0) network.fit()
    }

    function nodeLabel(name) {
        const argument = details.get(name)
        if (argument === undefined || !panel.querySelector(".show-conclusions").checked) return name
        const conclusion = argument.conclusion.length > CONCLUSION_LENGTH
            ? argument.conclusion.slice(0, CONCLUSION_LENGTH - 1) + "…"
            : argument.conclusion
        return `${name}\n${conclusion}`
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
