import type { Core, EventObject, NodeSingular, StylesheetJson } from 'cytoscape';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { EMPTY_GRAPH, type ArgumentData, type GraphData, type Run, type SolutionData } from '../engine.js';
import { NODE_FONT, drawing, fit, followSize, nodeSize, png } from '../graph/canvas.js';
import { attacksAround, curveOf, isAbstract, kindOf, nameOf, nodeLabel } from '../graph/drawing.js';
import { layeredLayout, type Link } from '../graph/layout.js';
import { MUTUAL_STYLE, markMutual, placeByName, positionsOf, type Positions } from '../graph/positions.js';
import { levelsOf, supportsOf } from '../graph/levels.js';
import { cssColor, labelColor, tokens } from '../theme.js';

/** The stages of a computation the graph can be browsed back through: 0 to [last], the graph shown being the last */
export interface Stages {
    readonly last: number;
    graphAt(branch: number): Promise<GraphData>;
}

// The layout keeps nodes this far apart, edge to edge, and rows at least LEVEL_SEPARATION apart
const NODE_GAP = 40;
const LEVEL_SEPARATION = 100;

// Nodes and edges take their colours, sizes and curves from their data, computed as the graph is drawn
const STYLE: StylesheetJson = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#ffffff',
            'font-family': NODE_FONT.family,
            'font-size': NODE_FONT.size,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            width: 'data(width)',
            height: 'data(height)',
        },
    },
    { selector: 'node:selected', style: { 'border-width': 3, 'border-color': 'data(outline)' } },
    {
        selector: 'edge',
        style: {
            width: 2,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 'data(curve)',
            'control-point-weights': 0.5,
        },
    },
    // an abstract framework is placed by forces: its attacks bend apart when they are mutual
    { selector: 'edge.free', style: { 'curve-style': 'bezier' } },
    MUTUAL_STYLE,
    {
        selector: 'edge.support',
        style: { 'curve-style': 'straight', 'line-style': 'dashed', 'line-dash-pattern': [3, 4], width: 1.5, 'arrow-scale': 0.7 },
    },
    { selector: 'edge.support.hidden', style: { display: 'none' } },
];

/**
 * The argument graph of a solution: every argument a node in the colour of its label, built on the arguments below it
 * (facts at the bottom) and attacking others. Hovering an argument (or tapping it, the only way on touch screens)
 * tells about it; the stages of the computation can be browsed back; the graph can be saved as a picture.
 *
 * An abstract framework (profile abstract) has no structure: its arguments go by the names the theory gives them and
 * are placed by their attacks alone.
 *
 * Events: `arg2p-toggle` when supports or conclusions are shown or hidden (to remember it), and `arg2p-export` with
 * the picture (cancel it to save the picture another way; otherwise it is downloaded).
 */
export class Arg2pGraph extends LitElement {
    static override properties = {
        graph: { attribute: false },
        positions: { attribute: false },
        stages: { attribute: false },
        showSupports: { type: Boolean, attribute: 'show-supports', reflect: true },
        showConclusions: { type: Boolean, attribute: 'show-conclusions', reflect: true },
        fileName: { attribute: 'file-name' },
        empty: { type: Boolean, reflect: true },
        stage: { state: true },
        drawn: { state: true },
        shown: { state: true },
    };

    /** The graph shown */
    graph: GraphData = EMPTY_GRAPH;
    /** The stages of the computation of [graph], if it can be browsed */
    stages: Stages | null = null;
    /** Where the arguments of an abstract framework are, by name: shared with its drawing (see arg2p-positions) */
    positions: Positions | null = null;
    showSupports = true;
    showConclusions = false;
    /** The name of the picture the graph is saved as, with no extension */
    fileName = 'graph';
    /** Set when there is nothing to show: no arguments, and no stages to browse (a page may hide the graph) */
    empty = true;

    private stage = 0;
    // the graph drawn: [graph], or one of its stages
    private drawn: GraphData = EMPTY_GRAPH;
    // the argument the popup is about, and whether a tap keeps it open
    private shown: string | null = null;
    private pinned: string | null = null;

    // One drawing per element: moving between the stages updates it in place, so that arguments keep their place
    private cy: Core | null = null;
    private unfollow = () => {};

    /** Shows the graph of [solution], its stages browsable through [run] */
    showSolution(solution: SolutionData, run: Pick<Run, 'graphAt'> | null = null): void {
        this.graph = solution.graph;
        this.stages = run !== null && solution.branch > 0 ? { last: solution.branch, graphAt: branch => run.graphAt(branch) } : null;
    }

    clear(): void {
        this.graph = EMPTY_GRAPH;
        this.stages = null;
    }

    /** The graph as a PNG picture, as a data URL: the whole of it, on the background of the element */
    png(): string {
        if (this.cy === null) return '';
        return png(this.cy, getComputedStyle(this).getPropertyValue('--_surface').trim() || '#ffffff');
    }

    /** Fits the drawing to the element */
    fit(): void {
        if (this.cy === null) return;
        this.cy.resize();
        fit(this.cy);
    }

    /** Draws the graph again, in the colours the page sets now (after a change of theme) */
    restyle(): void {
        this.draw();
    }

    /** The drawing, for what the element does not do itself (and for tests) */
    get drawing(): Core | null {
        return this.cy;
    }

    protected override willUpdate(changed: PropertyValues): void {
        if (changed.has('graph') || changed.has('stages')) {
            this.stage = this.stages?.last ?? 0;
            this.drawn = this.graph;
        }
        // the popup of an argument the graph no longer has is closed
        if (this.shown !== null && !this.drawn.arguments.some(it => it.id === this.shown)) {
            this.pinned = null;
            this.shown = null;
        }
        this.empty = this.drawn.arguments.length === 0 && this.stages === null;
    }

    protected override firstUpdated(): void {
        const cy = drawing(this.renderRoot.querySelector<HTMLElement>('.canvas')!, STYLE);
        cy.on('mouseover', 'node', (event: EventObject) => this.show(event.target.id()));
        cy.on('mouseout', 'node', () => this.show(this.pinned));
        cy.on('tap', (event: EventObject) => {
            this.pinned = event.target !== cy && event.target.isNode() ? (event.target.id() as string) : null;
            this.show(this.pinned);
        });
        // the popup follows its node while the graph is dragged or zoomed
        cy.on('viewport position', () => this.placePopup());
        cy.on('dragfree', 'node', () => {
            if (isAbstract(this.drawn)) this.tellPositions();
        });
        this.cy = cy;
        this.unfollow = followSize(cy, this.renderRoot.querySelector<HTMLElement>('.canvas')!);
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('drawn') || changed.has('showSupports') || changed.has('showConclusions')) this.draw();
        // placed elsewhere (by the drawing of the framework): moved there
        else if (changed.has('positions') && this.cy !== null && isAbstract(this.drawn)) placeByName(this.cy, nameOfNode, this.positions);
        if (changed.has('shown')) this.placePopup();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.unfollow();
        this.cy?.destroy();
        this.cy = null;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        // put back in a page after being taken out of it
        if (this.hasUpdated && this.cy === null) {
            this.firstUpdated();
            this.draw();
        }
    }

    private draw(): void {
        const cy = this.cy;
        if (cy === null) return;
        const graph = this.drawn;
        const abstract = isAbstract(graph);
        const wasEmpty = cy.nodes().length === 0;
        const labels = new Map(graph.arguments.map(it => [it.id, it.label]));
        const supports = abstract ? [] : supportsOf(graph.arguments);
        const support = cssColor(this, 'support');
        const outline = getComputedStyle(this).getPropertyValue('--_accent').trim() || '#008080';

        const nodes = graph.arguments.map(it => {
            const label = nodeLabel(it, abstract, this.showConclusions);
            return { data: { id: it.id, name: nameOf(it, abstract), label, color: labelColor(this, it.label), outline, ...nodeSize(label) }, classes: '' };
        });
        const edges = [
            ...graph.attacks.map(it => ({
                data: { id: `${it.from}->${it.to}`, source: it.from, target: it.to, color: labelColor(this, labels.get(it.from)), curve: 0 },
                classes: abstract ? 'attack free' : 'attack',
            })),
            ...supports.map(it => ({
                data: { id: `${it.from}=>${it.to}`, source: it.from, target: it.to, color: support, curve: 0 },
                classes: this.showSupports ? 'support' : 'support hidden',
            })),
        ];
        const wanted = new Set([...nodes, ...edges].map(it => it.data.id));

        cy.batch(() => {
            cy.elements().filter(it => !wanted.has(it.id())).remove();
            [...nodes, ...edges].forEach(({ data, classes }) => {
                const element = cy.getElementById(data.id);
                if (element.nonempty()) element.data(data).classes(classes);
                else cy.add({ group: 'source' in data ? 'edges' : 'nodes', data, classes });
            });
        });
        markMutual(cy);
        this.place(graph, abstract, supports, wasEmpty);
    }

    // Where the arguments of an abstract framework are now, for its drawing to place them alike
    private tellPositions(): void {
        if (this.cy === null) return;
        this.positions = positionsOf(this.cy, nameOfNode);
        this.dispatchEvent(new CustomEvent('arg2p-positions', { detail: { positions: this.positions }, bubbles: true, composed: true }));
    }

    // Computed again for every graph drawn: the same arguments get the same place, so stepping through the stages does
    // not move them around. An abstract framework has no rows: its arguments are placed by their attacks, as forces,
    // from where they are (all of them anew when it is drawn first).
    private place(graph: GraphData, abstract: boolean, supports: Link[], first: boolean): void {
        const cy = this.cy!;
        if (graph.arguments.length === 0) return;
        if (abstract) {
            if (placeByName(cy, nameOfNode, this.positions)) this.tellPositions();
            if (first) fit(cy);
            return;
        }
        const area = this.renderRoot.querySelector<HTMLElement>('.area')!;
        const sizes = new Map(cy.nodes().map(it => [it.id(), { width: it.data('width') as number, height: it.data('height') as number }]));
        const positions = layeredLayout(levelsOf(graph.arguments), supports, {
            sizes,
            gap: NODE_GAP,
            levelSeparation: LEVEL_SEPARATION,
            attacks: graph.attacks,
            // filling the area rather than drawing a thin strip in its middle
            aspect: area.clientWidth > 0 ? area.clientHeight / area.clientWidth : null,
        });
        cy.batch(() => {
            positions.forEach((point, id) => cy.getElementById(id).position({ x: point.x, y: point.y }));
            // attacks bend by a share of their length (a smaller one for long attacks, or they would arc across the
            // whole drawing): mutual attacks bend to either side
            graph.attacks.forEach(it => {
                const from = positions.get(it.from);
                const to = positions.get(it.to);
                if (from === undefined || to === undefined) return;
                cy.getElementById(`${it.from}->${it.to}`).data('curve', curveOf(from, to) * Math.hypot(to.x - from.x, to.y - from.y));
            });
        });
        if (first) fit(cy);
    }

    // The graph of a stage comes from the engine: a later click wins
    private goTo(target: number): void {
        const stages = this.stages;
        if (stages === null || target < 0 || target > stages.last) return;
        this.stage = target;
        if (target === stages.last) {
            this.drawn = this.graph;
            return;
        }
        stages.graphAt(target).then(graph => {
            if (this.stage === target && this.stages === stages) this.drawn = graph;
        });
    }

    private show(id: string | null): void {
        this.shown = id !== null && this.drawn.arguments.some(it => it.id === id) ? id : null;
    }

    // Next to its node, flipped to the other side or held in when it would leave the area
    private placePopup(): void {
        const popup = this.renderRoot.querySelector<HTMLElement>('.popup');
        const area = this.renderRoot.querySelector<HTMLElement>('.area');
        if (this.shown === null || popup === null || area === null || this.cy === null) return;
        const node = this.cy.getElementById(this.shown);
        if (node.empty()) return;
        const point = node.renderedPosition();
        const margin = 8;
        const gap = node.renderedWidth() / 2 + 8;
        const width = popup.offsetWidth;
        const height = popup.offsetHeight;
        let left = point.x + gap;
        if (left + width > area.clientWidth - margin) left = point.x - gap - width;
        left = Math.max(margin, Math.min(left, area.clientWidth - width - margin));
        const top = Math.max(margin, Math.min(point.y - height / 2, area.clientHeight - height - margin));
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
    }

    private toggle(which: 'showSupports' | 'showConclusions', on: boolean): void {
        this[which] = on;
        this.dispatchEvent(
            new CustomEvent('arg2p-toggle', {
                detail: { showSupports: this.showSupports, showConclusions: this.showConclusions },
                bubbles: true,
                composed: true,
            }),
        );
    }

    private export(): void {
        const fileName = `${this.fileName}.png`;
        const dataUrl = this.png();
        const event = new CustomEvent('arg2p-export', { detail: { fileName, dataUrl }, bubbles: true, composed: true, cancelable: true });
        if (!this.dispatchEvent(event)) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
    }

    protected override render() {
        const abstract = isAbstract(this.drawn);
        const stages = this.stages;
        return html`
            <div class="bar" part="bar">
                <div class="legend">
                    <span class="item"><span class="line attack"></span>attack</span>
                    ${abstract
                        ? nothing
                        : html`
                              <label class="item toggle" title="Show which sub-arguments every argument is built on">
                                  <input type="checkbox" .checked=${this.showSupports} @change=${(e: Event) => this.toggle('showSupports', (e.target as HTMLInputElement).checked)} />
                                  <span class="line support"></span>supports
                              </label>
                              <label class="item toggle" title="Write the conclusion of every argument under its name">
                                  <input type="checkbox" .checked=${this.showConclusions} @change=${(e: Event) => this.toggle('showConclusions', (e.target as HTMLInputElement).checked)} />
                                  conclusions
                              </label>
                          `}
                </div>
                <button type="button" class="png" title="Download the graph as a picture" ?disabled=${this.drawn.arguments.length === 0} @click=${() => this.export()}>
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    PNG
                </button>
                ${stages === null
                    ? nothing
                    : html`
                          <div class="stages">
                              <button type="button" class="previous" title="Previous stage of the computation" aria-label="Previous stage" ?disabled=${this.stage <= 0} @click=${() => this.goTo(this.stage - 1)}>&#9664;</button>
                              <span class="stage" title="Every step of the computation keeps its own context: browse them to see how the graph is built">Stage ${this.stage} / ${stages.last}</span>
                              <button type="button" class="next" title="Next stage of the computation" aria-label="Next stage" ?disabled=${this.stage >= stages.last} @click=${() => this.goTo(this.stage + 1)}>&#9654;</button>
                          </div>
                      `}
            </div>
            <div class="area">
                <div class="canvas"></div>
                ${this.drawn.arguments.length === 0 && stages !== null ? html`<div class="none">No arguments at this stage.</div>` : nothing}
                ${this.popup(abstract)}
            </div>
        `;
    }

    private popup(abstract: boolean) {
        const argument = this.drawn.arguments.find(it => it.id === this.shown);
        if (argument === undefined) return nothing;
        const { by, on } = attacksAround(this.drawn, argument.id);
        const kind = kindOf(argument, abstract);
        const attack = (id: string, type: string | null, target: string | null) => html`
            <span class="attack">${this.chip(id)}${abstract || type === null ? nothing : html`<span class="type">${type}${target !== null && target !== argument.id ? html` on ${this.chip(target)}` : nothing}</span>`}</span>
        `;
        return html`
            <div class="popup" part="popup" role="tooltip">
                <div class="header">
                    ${this.chip(argument.id)}
                    <span class="label">${argument.label === 'na' ? 'not labelled yet' : argument.label}</span>
                    ${kind === 'assumption' || kind === 'premise' ? html`<span class="kind">${kind}</span>` : nothing}
                </div>
                ${abstract ? nothing : this.row('Conclusion', html`<div class="term">${argument.conclusion}</div>`)}
                ${kind === 'rule' ? this.row('Top rule', html`<div class="term">${argument.topRule}</div>`) : nothing}
                ${abstract ? nothing : this.row('Built on', this.chips(argument.supports.map(id => this.chip(id))))}
                ${this.row('Attacked by', this.chips(by.map(it => attack(it.from, it.type, it.on))))}
                ${this.row('Attacks', this.chips(on.map(it => attack(it.to, it.type, it.on))))}
            </div>
        `;
    }

    private row(title: string, content: unknown) {
        return html`<div class="row"><div class="title">${title}</div>${content}</div>`;
    }

    private chips(items: unknown[]) {
        return html`<div class="chips">${items.length === 0 ? html`<span class="muted">none</span>` : items}</div>`;
    }

    // An argument by its name, in the colour of its label
    private chip(id: string) {
        const argument: ArgumentData | undefined = this.drawn.arguments.find(it => it.id === id);
        const label = argument?.label ?? 'na';
        const name = argument === undefined ? id : nameOf(argument, isAbstract(this.drawn));
        return html`<span class="chip ${label}">${name}</span>`;
    }

    static override styles = [
        tokens,
        css`
            :host {
                display: flex;
                flex-direction: column;
                min-height: 200px;
                background: var(--_surface);
                font-size: 13px;
            }
            .bar {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px 16px;
                padding: 6px 10px;
                border-bottom: 1px solid var(--_border);
                color: var(--_muted);
            }
            .legend {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-right: auto;
            }
            .item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .toggle {
                cursor: pointer;
                user-select: none;
            }
            /* attacks take the colour of the attacker: the legend shows the stroke alone */
            .line {
                display: inline-block;
                width: 26px;
                border-top: 2px solid var(--_muted);
            }
            .line.support {
                border-top: 2px dashed var(--_support);
            }
            button {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font: inherit;
                color: var(--_text);
                background: var(--_surface);
                border: 1px solid var(--_border);
                border-radius: 4px;
                padding: 2px 8px;
                cursor: pointer;
            }
            button:hover:not(:disabled) {
                background: var(--_hover);
            }
            button:disabled {
                opacity: 0.5;
                cursor: default;
            }
            .stages {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .stage {
                min-width: 80px;
                text-align: center;
                font-variant-numeric: tabular-nums;
            }
            .area {
                flex: 1;
                min-height: 0;
                position: relative;
                overflow: hidden;
            }
            .canvas {
                position: absolute;
                inset: 0;
            }
            .none {
                position: absolute;
                top: 40%;
                width: 100%;
                text-align: center;
                color: var(--_muted);
                font-style: italic;
                pointer-events: none;
            }
            .popup {
                position: absolute;
                z-index: 20;
                width: max-content;
                max-width: min(320px, calc(100% - 16px));
                padding: 10px 12px;
                background: var(--_surface);
                border: 1px solid var(--_border);
                border-radius: 8px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
                pointer-events: none;
            }
            .header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            .label,
            .kind {
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: var(--_muted);
            }
            .kind {
                font-weight: normal;
            }
            .row {
                display: grid;
                grid-template-columns: 82px 1fr;
                column-gap: 8px;
                align-items: baseline;
                padding: 3px 0;
            }
            .title,
            .muted,
            .type {
                color: var(--_muted);
            }
            .term {
                font-family: var(--_mono);
                word-break: break-word;
            }
            .chips {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }
            .attack {
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .type {
                font-size: 12px;
            }
            .chip {
                color: #ffffff;
                border-radius: 10px;
                padding: 0 8px;
                font-size: 12px;
                background: var(--_unlabelled);
            }
            .chip.in {
                background: var(--_in);
            }
            .chip.out {
                background: var(--_out);
            }
            .chip.und {
                background: var(--_und);
            }
        `,
    ];
}

// The name of an argument drawn: what the theory calls it, in an abstract framework
function nameOfNode(node: NodeSingular): string {
    return node.data('name') as string;
}

customElements.define('arg2p-graph', Arg2pGraph);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-graph': Arg2pGraph;
    }
}
