import type { Core, EventObject, NodeSingular, StylesheetJson } from 'cytoscape';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import type { GraphData } from '../engine.js';
import { declaredFramework, redrawn } from '../formats/declarations.js';
import type { Framework } from '../formats/frameworks.js';
import { NODE_FONT, drawing, fit, nodeSize, png } from '../graph/canvas.js';
import { labelColor, tokens } from '../theme.js';

const NAME = /^[a-z][a-zA-Z0-9_]*$/;
// how far apart arguments added by text are put, around the middle of the view
const SPREAD = 90;

type Mode = 'select' | 'argument' | 'attack';

const STYLE: StylesheetJson = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            'background-color': 'data(color)',
            label: 'data(id)',
            color: '#ffffff',
            'font-family': NODE_FONT.family,
            'font-size': NODE_FONT.size,
            'text-valign': 'center',
            'text-halign': 'center',
            width: 'data(width)',
            height: 'data(height)',
        },
    },
    { selector: 'node:selected, node.source', style: { 'border-width': 3, 'border-color': 'data(outline)' } },
    {
        selector: 'edge',
        style: {
            width: 2,
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
        },
    },
    { selector: 'edge:selected', style: { width: 4 } },
    // what the theory derives and does not declare: drawn, not edited by drawing
    { selector: 'node.derived', style: { 'border-width': 2, 'border-style': 'dashed', 'border-color': 'data(outline)' } },
    { selector: 'edge.derived', style: { 'line-style': 'dashed' } },
];

/**
 * An abstract framework drawn: the arguments and attacks its theory (of the profile abstract) declares, as nodes and
 * arrows. Drawing writes the theory: an argument added is a fact `a.`, an attack `a -> b.`; deleting or renaming one
 * changes its declaration, and every other clause of the theory (those that derive attacks, say) stays as it is.
 * The theory edited as text is drawn again, the arguments kept where they were.
 *
 * Given the graph of a solution, the arguments take the colours of their labels, and what the theory derives without
 * declaring it is drawn too, dashed: it changes with the clauses that derive it, not by drawing.
 *
 * Events: `arg2p-theory-change` with the theory, after every change made by drawing; `arg2p-export` with the picture
 * of the framework, as for the graph.
 */
export class Arg2pFramework extends LitElement {
    static override properties = {
        theory: {},
        graph: { attribute: false },
        readonly: { type: Boolean, reflect: true },
        fileName: { attribute: 'file-name' },
        mode: { state: true },
        selected: { state: true },
        renaming: { state: true },
        source: { state: true },
    };

    /** The theory drawn */
    theory = '';
    /** The graph of a solution of [theory], to show its labels and what it derives; null when there is none */
    graph: GraphData | null = null;
    readonly = false;
    /** The name of the picture the framework is saved as, with no extension */
    fileName = 'framework';

    private mode: Mode = 'select';
    private selected = false;
    private renaming: { name: string; value: string } | null = null;
    // the attacker picked, in attack mode
    private source: string | null = null;

    private cy: Core | null = null;
    // the framework of [theory], as drawn
    private drawn: Framework = { arguments: [], attacks: [] };

    /** The arguments and attacks the theory declares */
    framework(): Framework {
        return this.drawn;
    }

    /** The drawing, for what the element does not do itself (and for tests) */
    get drawing(): Core | null {
        return this.cy;
    }

    /** Fits the drawing to the element (after it was hidden, and so sized to nothing) */
    fit(): void {
        if (this.cy === null) return;
        this.cy.resize();
        fit(this.cy);
    }

    /** The framework as a PNG picture, as a data URL */
    png(): string {
        if (this.cy === null) return '';
        return png(this.cy, getComputedStyle(this).getPropertyValue('--_surface').trim() || '#ffffff');
    }

    protected override firstUpdated(): void {
        const cy = drawing(this.renderRoot.querySelector<HTMLElement>('.canvas')!, STYLE);
        cy.on('tap', (event: EventObject) => this.tap(event));
        cy.on('dbltap', (event: EventObject) => {
            if (this.readonly) return;
            if (event.target === cy) this.add(event.position);
            else if (event.target.isNode()) this.startRename(event.target.id());
        });
        cy.on('select unselect', () => {
            this.selected = cy.$(':selected').nonempty();
        });
        cy.on('viewport position', () => this.placeRename());
        this.cy = cy;
        this.draw();
    }

    protected override willUpdate(changed: PropertyValues): void {
        // the graph of another theory: its labels no longer hold
        if (changed.has('theory') && !changed.has('graph') && changed.get('theory') !== undefined) this.graph = null;
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('theory') || changed.has('graph')) this.draw();
        if (changed.has('readonly')) {
            if (this.readonly) this.setMode('select');
            this.cy?.autoungrabify(this.readonly);
        }
        if (changed.has('renaming') && this.renaming !== null && changed.get('renaming') === null) {
            const box = this.renderRoot.querySelector<HTMLInputElement>('.rename');
            this.placeRename();
            box?.focus();
            box?.select();
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.cy?.destroy();
        this.cy = null;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        if (this.hasUpdated && this.cy === null) this.firstUpdated();
    }

    // The declared framework, and what the graph adds to it, drawn: the arguments already drawn stay where they are,
    // the new ones go around the middle of the view (all placed anew when there were none)
    private draw(): void {
        const cy = this.cy;
        if (cy === null) return;
        this.drawn = declaredFramework(this.theory);
        const declared = new Set(this.drawn.arguments);
        const named = this.graph?.profile === 'abstract' ? this.graph : null;
        const labels = new Map((named?.arguments ?? []).map(it => [it.conclusion, it.label]));
        const names = new Map((named?.arguments ?? []).map(it => [it.id, it.conclusion]));
        const attacks = new Set(this.drawn.attacks.map(it => `${it.from}->${it.to}`));
        const derivedAttacks = (named?.attacks ?? [])
            .map(it => ({ from: names.get(it.from), to: names.get(it.to) }))
            .filter((it): it is { from: string; to: string } => it.from !== undefined && it.to !== undefined && !attacks.has(`${it.from}->${it.to}`));
        const outline = getComputedStyle(this).getPropertyValue('--_accent').trim() || '#008080';
        const nodes = [...this.drawn.arguments, ...[...labels.keys()].filter(it => !declared.has(it))].map(name => ({
            data: { id: name, color: labelColor(this, labels.get(name)), outline, ...nodeSize(name) },
            classes: declared.has(name) ? '' : 'derived',
        }));
        const attackColor = (from: string) => (labels.has(from) ? labelColor(this, labels.get(from)) : labelColor(this, null));
        const edges = [
            ...this.drawn.attacks.map(it => ({ data: { id: `${it.from}->${it.to}`, source: it.from, target: it.to, color: attackColor(it.from) }, classes: '' })),
            ...derivedAttacks.map(it => ({ data: { id: `${it.from}->${it.to}`, source: it.from, target: it.to, color: attackColor(it.from) }, classes: 'derived' })),
        ];
        const wanted = new Set([...nodes, ...edges].map(it => it.data.id));
        const first = cy.nodes().empty();
        const added: NodeSingular[] = [];

        cy.batch(() => {
            cy.elements().filter(it => !wanted.has(it.id())).remove();
            nodes.forEach(({ data, classes }) => {
                const node = cy.getElementById(data.id);
                if (node.nonempty()) node.data(data).classes(classes);
                else added.push(cy.add({ group: 'nodes', data, classes }));
            });
            edges.forEach(({ data, classes }) => {
                const edge = cy.getElementById(data.id);
                if (edge.nonempty()) edge.data(data).classes(classes);
                else cy.add({ group: 'edges', data, classes });
            });
        });

        if (first && added.length > 0) {
            cy.layout({ name: 'cose', animate: false, randomize: true, fit: false }).run();
            fit(cy);
        } else {
            const extent = cy.extent();
            const middle = { x: (extent.x1 + extent.x2) / 2, y: (extent.y1 + extent.y2) / 2 };
            added
                .filter(it => it.position().x === 0 && it.position().y === 0)
                .forEach((node, i) => {
                    const angle = i * 2.4;
                    const radius = SPREAD * Math.sqrt(i + 1) * 0.6;
                    node.position({ x: middle.x + radius * Math.cos(angle), y: middle.y + radius * Math.sin(angle) });
                });
        }
        if (this.source !== null && cy.getElementById(this.source).empty()) this.source = null;
    }

    private tap(event: EventObject): void {
        const cy = this.cy!;
        if (this.readonly) return;
        const onNode = event.target !== cy && event.target.isNode();
        if (this.mode === 'argument' && event.target === cy) this.add(event.position);
        else if (this.mode === 'attack') {
            if (!onNode) return this.pick(null);
            const id = event.target.id() as string;
            if (this.source === null) return this.pick(id);
            const from = this.source;
            this.pick(null);
            const known = this.drawn.arguments.includes(from) && this.drawn.arguments.includes(id);
            if (known && !this.drawn.attacks.some(it => it.from === from && it.to === id)) {
                this.change({ arguments: this.drawn.arguments, attacks: [...this.drawn.attacks, { from, to: id }] });
            }
        }
    }

    // The attacker of the attack being drawn
    private pick(id: string | null): void {
        this.cy?.$('.source').removeClass('source');
        this.source = id;
        if (id !== null) this.cy?.getElementById(id).addClass('source');
    }

    private add(position: { x: number; y: number }): void {
        const name = this.suggestedName();
        // placed where it was asked for before the theory draws it
        this.cy?.add({ group: 'nodes', data: { id: name, color: labelColor(this, null), ...nodeSize(name) }, position: { ...position } });
        this.change({ arguments: [...this.drawn.arguments, name], attacks: this.drawn.attacks });
    }

    // A change made by drawing: the theory rewritten, then drawn again from it
    private change(framework: Framework, renamed: ReadonlyMap<string, string> = new Map()): void {
        this.theory = redrawn(this.theory, framework, renamed);
        // the labels were those of the theory before
        this.graph = null;
        this.dispatchEvent(new CustomEvent('arg2p-theory-change', { detail: { theory: this.theory }, bubbles: true, composed: true }));
    }

    // Only what is declared is deleted by drawing
    private deleteSelected(): void {
        const cy = this.cy;
        if (cy === null) return;
        const gone = new Set(cy.$('node:selected').map(it => it.id()).filter(it => this.drawn.arguments.includes(it)));
        const goneAttacks = new Set(cy.$('edge:selected').map(it => it.id()));
        this.change({
            arguments: this.drawn.arguments.filter(it => !gone.has(it)),
            attacks: this.drawn.attacks.filter(it => !gone.has(it.from) && !gone.has(it.to) && !goneAttacks.has(`${it.from}->${it.to}`)),
        });
        this.selected = cy.$(':selected').nonempty();
    }

    private setMode(mode: Mode): void {
        this.mode = mode;
        this.pick(null);
    }

    private suggestedName(): string {
        const taken = new Set(this.cy?.nodes().map(it => it.id()) ?? []);
        for (let i = 1; ; i++) if (!taken.has(`a${i}`)) return `a${i}`;
    }

    private isAvailable(name: string, current: string): boolean {
        return NAME.test(name) && (name === current || (this.cy?.getElementById(name).empty() ?? true));
    }

    private startRename(name: string): void {
        if (this.drawn.arguments.includes(name)) this.renaming = { name, value: name };
    }

    // An invalid or taken name is dropped: the argument keeps its name
    private commitRename(): void {
        const renaming = this.renaming;
        this.renaming = null;
        if (renaming === null) return;
        const wanted = renaming.value.trim();
        if (wanted === renaming.name || !this.isAvailable(wanted, renaming.name)) return;
        const node = this.cy?.getElementById(renaming.name);
        // the renamed argument stays where it was
        if (node?.nonempty()) this.cy?.add({ group: 'nodes', data: { ...node.data(), id: wanted, ...nodeSize(wanted) }, position: { ...node.position() } });
        const rename = (it: string) => (it === renaming.name ? wanted : it);
        this.change(
            {
                arguments: this.drawn.arguments.map(rename),
                attacks: this.drawn.attacks.map(it => ({ from: rename(it.from), to: rename(it.to) })),
            },
            new Map([[renaming.name, wanted]]),
        );
    }

    // The rename box stays on its node while the drawing moves
    private placeRename(): void {
        const box = this.renderRoot.querySelector<HTMLElement>('.rename');
        const node = this.renaming === null ? null : this.cy?.getElementById(this.renaming.name);
        if (box === null || node == null || node.empty()) return;
        const point = node.renderedPosition();
        box.style.left = `${point.x}px`;
        box.style.top = `${point.y}px`;
    }

    private onKey(event: KeyboardEvent): void {
        if (this.readonly || this.renaming !== null) return;
        if (event.key === 'Escape') this.setMode('select');
        else if ((event.key === 'Delete' || event.key === 'Backspace') && this.selected) {
            event.preventDefault();
            this.deleteSelected();
        }
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
        const tool = (mode: Mode, text: string, title: string) => html`
            <button type="button" class=${this.mode === mode ? 'active' : ''} aria-pressed=${this.mode === mode} title=${title} @click=${() => this.setMode(mode)}>${text}</button>
        `;
        const renaming = this.renaming;
        const hint =
            this.mode === 'argument' ? 'Click where an argument goes'
            : this.mode === 'attack' ? (this.source === null ? 'Click the attacker' : `Click the argument ${this.source} attacks`)
            : 'Double click to add an argument, or to rename one';
        return html`
            <div class="bar" part="bar">
                ${this.readonly
                    ? nothing
                    : html`
                          ${tool('select', 'Select', 'Select and move arguments (Esc)')}
                          ${tool('argument', '+ Argument', 'Add arguments')}
                          ${tool('attack', '+ Attack', 'Add attacks: the attacker, then the argument it attacks')}
                          <button type="button" title="Delete what is selected (Del)" ?disabled=${!this.selected} @click=${() => this.deleteSelected()}>Delete</button>
                          <span class="hint">${hint}</span>
                      `}
                <button type="button" class="png" title="Download the framework as a picture" @click=${() => this.export()}>PNG</button>
            </div>
            <div class="area" tabindex="0" @keydown=${(e: KeyboardEvent) => this.onKey(e)}>
                <div class="canvas"></div>
                ${renaming === null
                    ? nothing
                    : html`<input
                          class="rename ${this.isAvailable(renaming.value.trim(), renaming.name) ? '' : 'invalid'}"
                          type="text"
                          aria-label="Argument name"
                          title="Argument name: a lowercase letter, then letters, digits or underscores"
                          .value=${renaming.value}
                          @input=${(e: Event) => (this.renaming = { ...renaming, value: (e.target as HTMLInputElement).value })}
                          @keydown=${(e: KeyboardEvent) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') this.commitRename();
                              else if (e.key === 'Escape') this.renaming = null;
                          }}
                          @blur=${() => this.commitRename()}
                      />`}
            </div>
        `;
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
                gap: 6px;
                padding: 6px 10px;
                border-bottom: 1px solid var(--_border);
            }
            button {
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
            button.active {
                border-color: var(--_accent);
                color: var(--_accent);
            }
            button:disabled {
                opacity: 0.5;
                cursor: default;
            }
            .hint {
                margin-left: auto;
                color: var(--_muted);
            }
            .png {
                margin-left: auto;
            }
            .hint + .png {
                margin-left: 0;
            }
            .area {
                flex: 1;
                min-height: 0;
                position: relative;
                overflow: hidden;
                outline: none;
            }
            .canvas {
                position: absolute;
                inset: 0;
            }
            .rename {
                position: absolute;
                transform: translate(-50%, -50%);
                width: 9em;
                font: 14px var(--_mono);
                text-align: center;
                color: var(--_text);
                background: var(--_surface);
                border: 2px solid var(--_accent);
                border-radius: 4px;
                padding: 2px 4px;
                z-index: 10;
            }
            .rename.invalid {
                border-color: var(--_error);
            }
        `,
    ];
}

customElements.define('arg2p-framework', Arg2pFramework);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-framework': Arg2pFramework;
    }
}
