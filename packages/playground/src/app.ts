import '@tuprolog/arg2p-ui';
import {
    DEFAULT_PROFILE,
    declaredFramework,
    frameworkOf,
    parseFramework,
    profileInfo,
    statedProfile,
    toApx,
    toTgf,
    toTheory,
    type EngineError,
    type GraphData,
    type Positions,
    type Run,
    type SolutionData,
} from '@tuprolog/arg2p-ui/data';
import type { Arg2pEditor, Arg2pFramework, Arg2pGraph, Arg2pSolutions } from '@tuprolog/arg2p-ui';
import { JsEngine } from '@tuprolog/arg2p-ui/js';
import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { blank, DEFAULT_QUERY, type Content, type Workspace } from './documents.js';
import { EXAMPLES } from './examples.js';
import { downloadText, fileName, pickFile } from './files.js';
import { read, shareUrl } from './links.js';
import { Session, browserStorage } from './session.js';
import { styles } from './styles.js';
import { currentTheme, followSystem, toggleTheme } from './theme.js';

type Panel = 'results' | 'flags' | 'console';

const DOCS = 'https://tuprolog.github.io/arg2p-kt/';
const PROJECT = 'https://github.com/tuProlog/arg2p-kt';

/**
 * The playground: the theories worked on, in tabs kept in the browser; the theory, its query and its flags, edited
 * and solved in the browser; the solutions, their graphs and, for an abstract framework, its drawing.
 */
export class Arg2pPlayground extends LitElement {
    static override properties = {
        workspace: { state: true },
        active: { state: true },
        content: { state: true },
        panel: { state: true },
        busy: { state: true },
        output: { state: true },
        notice: { state: true },
        shared: { state: true },
        theme: { state: true },
        renaming: { state: true },
        layout: { state: true },
        positions: { state: true },
    };

    private readonly engine = new JsEngine();
    private readonly session = new Session(browserStorage(), {
        show: doc => this.showDocument(doc),
        changed: (workspace, active) => {
            this.workspace = workspace;
            this.active = active;
        },
    });

    private workspace: Workspace = this.session.current;
    private active: string | null = null;
    private content: Content = blank();
    private panel: Panel = 'results';
    // a query being solved, or a solution being computed
    private busy = false;
    private output = '';
    private notice: { text: string; error: boolean } | null = null;
    private shared: string | null = null;
    private theme = currentTheme();
    private renaming: string | null = null;
    private layout: Layout = loadLayout();
    // where the arguments of an abstract framework are drawn, kept while it is solved again
    private positions: Positions | null = null;
    // whether the drawing, rather than the graph, was shown last
    private drawn = false;
    // the graph of the solution shown, and the run it comes from
    private graph: GraphData | null = null;
    private runs = 0;

    override connectedCallback(): void {
        super.connectedCallback();
        followSystem();
        document.addEventListener('arg2p-theme', () => {
            this.theme = currentTheme();
            this.find<Arg2pGraph>('arg2p-graph')?.restyle();
        });
        // a menu closes when anything else is clicked
        document.addEventListener('click', event => {
            this.renderRoot.querySelectorAll<HTMLDetailsElement>('details.menu[open]').forEach(menu => {
                if (!event.composedPath().includes(menu)) menu.open = false;
            });
        });
        this.session.attach(window);
        this.session.restore(() => ({ ...blank(), ...example('tweety') }), 'Tweety');
        // A shared link opens in a tab of its own, so that it never overwrites anything, and runs; it leaves the
        // address bar, so that a reload does not open it again
        const link = read(window.location.search);
        if (link.errors.length > 0) this.notice = { text: link.errors.join(' '), error: true };
        if (link.content !== null) {
            this.session.open({ ...blank(), ...link.content }, 'Shared link');
            window.history.replaceState(null, '', window.location.pathname);
            this.updateComplete.then(() => this.run());
        } else {
            // the first evaluation is much slower than the next ones: the solver warms up meanwhile
            whenIdle(() => this.engine.start());
        }
    }

    protected override updated(changed: PropertyValues): void {
        // the drawing, or the graph, fits the room it is given when shown
        if (changed.has('panel') || this.abstract !== this.drawn) {
            this.drawn = this.abstract;
            this.find<Arg2pGraph>('arg2p-graph')?.fit();
            this.find<Arg2pFramework>('arg2p-framework')?.fit();
        }
    }

    private find<T extends Element>(selector: string): T | null {
        return this.renderRoot.querySelector<T>(selector);
    }

    // --- documents ---------------------------------------------------------------------------------------------------

    private showDocument(doc: Content): void {
        this.content = { theory: doc.theory, query: doc.query, flags: doc.flags };
        this.positions = null;
        this.clearResults();
    }

    private edit(change: Partial<Content>): void {
        this.content = { ...this.content, ...change };
        this.session.edit(change);
    }

    private get abstract(): boolean {
        return this.profile === 'abstract';
    }

    // The profile the theory is read in: the one it states, or the flags, or the default
    private get profile(): string {
        return statedProfile(this.content.theory) ?? statedProfile(this.content.flags) ?? DEFAULT_PROFILE;
    }

    private get name(): string {
        return this.workspace.tabs.find(it => it.id === this.active)?.name ?? 'theory';
    }

    // --- solving ---------------------------------------------------------------------------------------------------------

    private clearResults(): void {
        this.runs++;
        this.output = '';
        this.graph = null;
        this.find<Arg2pSolutions>('arg2p-solutions')?.clear();
        this.find<Arg2pGraph>('arg2p-graph')?.clear();
        const drawing = this.find<Arg2pFramework>('arg2p-framework');
        if (drawing !== null) drawing.graph = null;
    }

    private async run(): Promise<void> {
        await this.updateComplete;
        this.session.flush();
        this.clearResults();
        const run = this.runs;
        const solutions = this.find<Arg2pSolutions>('arg2p-solutions')!;
        this.panel = 'results';
        this.busy = true;
        try {
            const started = await this.engine.solve(this.content, text => {
                if (run === this.runs) this.output += text;
            });
            if (run !== this.runs) return;
            await solutions.start(started);
        } catch (error) {
            if (run !== this.runs) return;
            const failure = error as EngineError;
            solutions.fail(failure);
            this.reveal(failure);
        } finally {
            if (run === this.runs) this.busy = solutions.busy;
        }
    }

    private stop(): void {
        this.engine.stop();
    }

    private showSolution(solution: SolutionData, run: Run | null): void {
        this.graph = solution.graph;
        this.find<Arg2pGraph>('arg2p-graph')?.showSolution(solution, run);
        const drawing = this.find<Arg2pFramework>('arg2p-framework');
        if (drawing !== null) drawing.graph = solution.graph;
    }

    // Where a text does not parse: its editor shows it, and is taken there
    private reveal(error: EngineError): void {
        const syntax = error.syntax;
        if (syntax === null) return;
        if (syntax.where === 'flags') {
            this.panel = 'flags';
            this.updateComplete.then(() => {
                const details = this.find<HTMLDetailsElement>('.flags-text');
                if (details !== null) details.open = true;
                this.find<Arg2pEditor>('#flags')?.report(syntax);
            });
            return;
        }
        this.find<Arg2pEditor>(syntax.where === 'theory' ? '#theory' : '#query')?.report(syntax);
    }

    // --- files and links ---------------------------------------------------------------------------------------------

    private async openFile(): Promise<void> {
        const file = await pickFile('.pl,.pro,.prolog,.txt,text/plain');
        if (file !== null) this.session.open({ ...this.content, theory: file.text }, file.name);
    }

    private async importFramework(): Promise<void> {
        const file = await pickFile('.apx,.tgf,.af,.i23,.txt');
        if (file === null) return;
        try {
            const framework = parseFramework(file.text);
            this.session.open({ ...this.content, theory: toTheory(framework), query: DEFAULT_QUERY }, file.name);
            const renamed = framework.renamed;
            this.notice =
                renamed.length === 0
                    ? null
                    : {
                          text: `Renamed to Prolog atoms: ${renamed.slice(0, 4).map(it => `${it.from} → ${it.to}`).join(', ')}${renamed.length > 4 ? ` and ${renamed.length - 4} more` : ''}.`,
                          error: false,
                      };
        } catch (error) {
            this.notice = { text: `Could not read ${file.name}: ${(error as Error).message}`, error: true };
        }
    }

    // The framework solved last, or else the one the theory declares
    private exportFramework(format: 'apx' | 'tgf'): void {
        const framework = this.graph?.profile === 'abstract' ? frameworkOf(this.graph) : declaredFramework(this.content.theory);
        downloadText(fileName(this.name, format), format === 'apx' ? toApx(framework) : toTgf(framework));
    }

    private share(): void {
        this.session.flush();
        this.shared = shareUrl(this.content, window.location.href);
        this.updateComplete.then(() => {
            this.find<HTMLDialogElement>('dialog.share')?.showModal();
            this.find<HTMLInputElement>('dialog.share input')?.select();
        });
    }

    private async copy(button: HTMLButtonElement): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.shared ?? '');
            button.textContent = 'Copied ✓';
        } catch {
            this.find<HTMLInputElement>('dialog.share input')?.select();
            button.textContent = 'Press Ctrl+C';
        }
    }

    // --- layout --------------------------------------------------------------------------------------------------------

    // A divider between two columns, dragged (or moved with the arrows) to share the width of its container between
    // them: the share of the first one, in percent, is kept in the layout
    private divider(column: keyof Layout, label: string) {
        const set = (share: number) => {
            this.layout = { ...this.layout, [column]: Math.min(80, Math.max(15, share)) };
            saveLayout(this.layout);
        };
        const container = (element: Element) => element.parentElement!.getBoundingClientRect();
        return html`<div
            class="divider"
            role="separator"
            aria-orientation="vertical"
            aria-label=${label}
            aria-valuenow=${Math.round(this.layout[column])}
            tabindex="0"
            title="Drag to resize"
            @pointerdown=${(e: PointerEvent) => {
                const divider = e.currentTarget as HTMLElement;
                divider.setPointerCapture(e.pointerId);
                divider.classList.add('dragging');
                const move = (event: PointerEvent) => {
                    const box = container(divider);
                    set(((event.clientX - box.left) / box.width) * 100);
                };
                const done = () => {
                    divider.classList.remove('dragging');
                    divider.removeEventListener('pointermove', move);
                    divider.removeEventListener('pointerup', done);
                    divider.removeEventListener('pointercancel', done);
                };
                divider.addEventListener('pointermove', move);
                divider.addEventListener('pointerup', done);
                divider.addEventListener('pointercancel', done);
                e.preventDefault();
            }}
            @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'ArrowLeft') set(this.layout[column] - 2);
                else if (e.key === 'ArrowRight') set(this.layout[column] + 2);
            }}
        ></div>`;
    }

    // --- rendering -----------------------------------------------------------------------------------------------------

    protected override render() {
        return html`
            ${this.renderTop()} ${this.renderTabs()}
            <main style="--theory: ${this.layout.theory}%">
                ${this.renderTheory()}
                ${this.divider('theory', 'Width of the theory')}
                <section class="work">${this.renderQuery()} ${this.renderPanels()}</section>
            </main>
            ${this.renderShare()}
        `;
    }

    private renderTop() {
        const groups = [...new Set(EXAMPLES.map(it => it.group))];
        return html`
            <header class="top">
                <a class="brand" href=${DOCS}><img src="icons/icon.svg" alt="" width="24" height="24" /> Arg2P <span class="wide">Playground</span></a>
                <details class="menu">
                    <summary>Examples</summary>
                    <div class="menu-list" role="menu">
                        ${groups.map(
                            group => html`
                                <div class="menu-header">${group}</div>
                                ${EXAMPLES.filter(it => it.group === group).map(
                                    it => html`<button type="button" role="menuitem" @click=${(e: Event) => this.openExample(it.id, e)}>${it.name}</button>`,
                                )}
                            `,
                        )}
                    </div>
                </details>
                <span class="spacer"></span>
                <a class="wide" href=${DOCS}>Documentation</a>
                <a class="wide" href=${PROJECT}>Project</a>
                <span class="version" title="The version of Arg2P">${__ARG2P_VERSION__}</span>
                <button type="button" class="icon" title="Share a link to this theory, query and flags" aria-label="Share" @click=${() => this.share()}>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" fill="none" stroke="currentColor" stroke-width="2" /></svg>
                </button>
                <button type="button" class="icon" title="Switch between light and dark" aria-label="Switch between light and dark" @click=${toggleTheme}>
                    ${this.theme === 'dark'
                        ? html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" /></svg>`
                        : html`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>`}
                </button>
            </header>
            ${this.notice === null
                ? nothing
                : html`<div class="notice ${this.notice.error ? 'error' : ''}" role="status">
                      <span>${this.notice.text}</span><button type="button" class="link" @click=${() => (this.notice = null)}>Dismiss</button>
                  </div>`}
        `;
    }

    private openExample(id: string, event: Event): void {
        const found = EXAMPLES.find(it => it.id === id)!;
        this.session.open({ theory: found.theory, query: found.query, flags: found.flags }, found.name);
        (event.target as HTMLElement).closest('details')?.removeAttribute('open');
    }

    private renderTabs() {
        const closed = this.workspace.closed;
        return html`
            <nav class="tabs">
                <!-- the tabs scroll in a list of their own: the menus after it would be cut by the scrolling -->
                <div class="tab-list" role="tablist" aria-label="Open theories">
                ${this.workspace.tabs.map(
                    doc => html`
                        <div
                            class="tab ${doc.id === this.active ? 'active' : ''}"
                            role="tab"
                            tabindex="0"
                            aria-selected=${doc.id === this.active}
                            title="${doc.name} — double click to rename"
                            @click=${() => this.session.select(doc.id)}
                            @keydown=${(e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && this.session.select(doc.id)}
                            @auxclick=${(e: MouseEvent) => e.button === 1 && this.session.close(doc.id)}
                            @dblclick=${() => (this.renaming = doc.id)}
                        >
                            ${this.renaming === doc.id
                                ? html`<input
                                      class="rename"
                                      aria-label="Name of the theory"
                                      .value=${doc.name}
                                      @click=${(e: Event) => e.stopPropagation()}
                                      @keydown=${(e: KeyboardEvent) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                          if (e.key === 'Escape') this.renaming = null;
                                      }}
                                      @blur=${(e: Event) => {
                                          if (this.renaming === doc.id) this.session.rename(doc.id, (e.target as HTMLInputElement).value);
                                          this.renaming = null;
                                      }}
                                  />`
                                : html`<span class="name">${doc.name}</span>`}
                            <button
                                type="button"
                                class="close"
                                title="Close (it stays among the recently closed)"
                                aria-label="Close ${doc.name}"
                                @click=${(e: Event) => {
                                    e.stopPropagation();
                                    this.session.close(doc.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    `,
                )}
                </div>
                <button type="button" class="new" title="New theory" aria-label="New theory" @click=${() => this.session.open(blank(), null)}>+</button>
                <details class="menu history">
                    <summary title="Recently closed theories" aria-label="Recently closed theories">
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                    </summary>
                    <div class="menu-list" role="menu">
                        <div class="menu-header">Recently closed</div>
                        ${closed.length === 0
                            ? html`<span class="menu-empty">Nothing closed yet</span>`
                            : html`
                                  ${closed.map(
                                      doc => html`<button type="button" role="menuitem" @click=${() => this.session.reopen(doc.id)}>
                                          <span>${doc.name}</span><small>closed ${ago(doc.closedAt)}</small>
                                      </button>`,
                                  )}
                                  <hr />
                                  <button type="button" role="menuitem" @click=${() => this.session.clearClosed()}>Forget closed theories</button>
                              `}
                    </div>
                </details>
            </nav>
        `;
    }

    private renderTheory() {
        const info = profileInfo(this.profile);
        return html`
            <section class="theory">
                <div class="bar">
                    <label for="theory" class="title">Theory</label>
                    <span class="profile" title=${info?.help ?? ''}>${info?.label ?? this.profile}</span>
                    <span class="spacer"></span>
                    <button type="button" title="Save the theory as a .pl file" @click=${() => downloadText(fileName(this.name, 'pl', ['pro', 'prolog', 'txt']), this.content.theory)}>Save</button>
                    <button type="button" title="Open a theory in a new tab" @click=${() => this.openFile()}>Open…</button>
                    <details class="menu">
                        <summary title="Abstract frameworks in the formats of ICCMA">Framework</summary>
                        <div class="menu-list right" role="menu">
                            <button type="button" role="menuitem" @click=${() => this.importFramework()}>Import APX, TGF or ICCMA'23…</button>
                            <hr />
                            <button type="button" role="menuitem" ?disabled=${!this.abstract} @click=${() => this.exportFramework('apx')}>Export as APX</button>
                            <button type="button" role="menuitem" ?disabled=${!this.abstract} @click=${() => this.exportFramework('tgf')}>Export as TGF</button>
                        </div>
                    </details>
                </div>
                <arg2p-editor
                    id="theory"
                    kind="theory"
                    label="Theory"
                    placeholder="A theory: rules, facts, and its flags (graphBuildMode(abstract). for an abstract framework)"
                    .engine=${this.engine}
                    .value=${this.content.theory}
                    @arg2p-change=${(e: CustomEvent<{ value: string }>) => this.edit({ theory: e.detail.value })}
                ></arg2p-editor>
            </section>
        `;
    }

    private renderQuery() {
        return html`
            <div class="query">
                <label for="query" class="prompt">?-</label>
                <arg2p-editor
                    id="query"
                    kind="query"
                    label="Query"
                    placeholder=${DEFAULT_QUERY}
                    .engine=${this.engine}
                    .value=${this.content.query}
                    @arg2p-change=${(e: CustomEvent<{ value: string }>) => this.edit({ query: e.detail.value })}
                    @arg2p-submit=${() => this.run()}
                ></arg2p-editor>
                ${this.busy
                    ? html`<button type="button" class="stop" @click=${() => this.stop()}><span class="spinner" aria-hidden="true"></span>Stop</button>`
                    : html`<button type="button" class="run" title="Solve the query (Enter)" @click=${() => this.run()}>Run</button>`}
            </div>
        `;
    }

    private renderPanels() {
        const tab = (panel: Panel, text: string) => html`
            <button type="button" role="tab" aria-selected=${this.panel === panel} class=${this.panel === panel ? 'active' : ''} @click=${() => (this.panel = panel)}>${text}</button>
        `;
        return html`
            <div class="panel-tabs" role="tablist">
                ${tab('results', 'Solutions')} ${tab('flags', 'Flags')} ${tab('console', this.output === '' ? 'Console' : 'Console •')}
            </div>
            <div class="panel results" style="--solutions: ${this.layout.solutions}%" ?hidden=${this.panel !== 'results'}>
                <arg2p-solutions
                    ?hide-exhausted-no=${this.abstract}
                    @arg2p-solution=${(e: CustomEvent<{ solution: SolutionData; run: Run | null }>) => this.showSolution(e.detail.solution, e.detail.run)}
                    @arg2p-busy=${(e: CustomEvent<{ busy: boolean }>) => (this.busy = e.detail.busy)}
                    @arg2p-failure=${(e: CustomEvent<{ error: EngineError }>) =>
                        (this.notice = { text: e.detail.error.stopped ? 'Stopped before the next solution.' : e.detail.error.message, error: !e.detail.error.stopped })}
                    @arg2p-error-select=${(e: CustomEvent<{ error: EngineError }>) => this.reveal(e.detail.error)}
                ></arg2p-solutions>
                ${this.divider('solutions', 'Width of the solutions')}
                <div class="view">
                    <arg2p-graph
                        ?hidden=${this.abstract}
                        file-name=${this.name}
                    ></arg2p-graph>
                    <arg2p-framework
                        ?hidden=${!this.abstract}
                        file-name=${this.name}
                        .theory=${this.content.theory}
                        .positions=${this.positions}
                        @arg2p-positions=${(e: CustomEvent<{ positions: Positions }>) => (this.positions = e.detail.positions)}
                        @arg2p-theory-change=${(e: CustomEvent<{ theory: string }>) => this.edit({ theory: e.detail.theory })}
                    ></arg2p-framework>
                </div>
            </div>
            <div class="panel flags" ?hidden=${this.panel !== 'flags'}>
                <arg2p-flags
                    .engine=${this.engine}
                    .flags=${this.content.flags}
                    .theory=${this.content.theory}
                    @arg2p-flags-change=${(e: CustomEvent<{ flags: string }>) => this.edit({ flags: e.detail.flags })}
                ></arg2p-flags>
                <details class="flags-text">
                    <summary>Flags as text</summary>
                    <p class="hint">The facts the solver is given (and links share): edit them freely, the settings above follow.</p>
                    <arg2p-editor
                        id="flags"
                        kind="flags"
                        label="Flags"
                        .engine=${this.engine}
                        .value=${this.content.flags}
                        @arg2p-change=${(e: CustomEvent<{ value: string }>) => this.edit({ flags: e.detail.value })}
                    ></arg2p-editor>
                </details>
            </div>
            <div class="panel console" ?hidden=${this.panel !== 'console'}>
                ${this.output === '' ? html`<p class="hint">What the theory and the query print (write/1, say) shows here.</p>` : html`<pre>${this.output}</pre>`}
            </div>
        `;
    }

    private renderShare() {
        const native = typeof navigator.share === 'function';
        return html`
            <dialog class="share" aria-labelledby="share-title" @click=${(e: Event) => e.target === e.currentTarget && (e.currentTarget as HTMLDialogElement).close()}>
                <form method="dialog">
                    <h2 id="share-title">Share</h2>
                    <p class="hint">The link opens the playground as it is now, and runs it.</p>
                    <div class="share-link">
                        <input type="text" readonly aria-label="Link to share" .value=${this.shared ?? ''} />
                        <button type="button" class="run" @click=${(e: Event) => this.copy(e.currentTarget as HTMLButtonElement)}>Copy</button>
                    </div>
                    <div class="share-actions">
                        ${native ? html`<button type="button" @click=${() => navigator.share({ title: document.title, url: this.shared ?? '' }).catch(() => {})}>Share via…</button>` : nothing}
                        <button value="close" class="link">Close</button>
                    </div>
                </form>
            </dialog>
        `;
    }

    static override styles = styles;
}

// The widths of the columns, in percent of their container: the theory, and the solutions beside the graph
interface Layout {
    theory: number;
    solutions: number;
}

const LAYOUT = 'arg2p.layout';

function loadLayout(): Layout {
    const layout = { theory: 40, solutions: 30 };
    try {
        const stored = JSON.parse(localStorage.getItem(LAYOUT) ?? '{}') as Partial<Layout>;
        if (typeof stored.theory === 'number') layout.theory = stored.theory;
        if (typeof stored.solutions === 'number') layout.solutions = stored.solutions;
    } catch {
        // the default layout
    }
    return layout;
}

function saveLayout(layout: Layout): void {
    try {
        localStorage.setItem(LAYOUT, JSON.stringify(layout));
    } catch {
        // not remembered: it applies all the same
    }
}

function example(id: string): Content {
    const found = EXAMPLES.find(it => it.id === id)!;
    return { theory: found.theory, query: found.query, flags: found.flags };
}

function whenIdle(task: () => void): void {
    const run = () => ('requestIdleCallback' in window ? requestIdleCallback(task, { timeout: 3000 }) : setTimeout(task, 1000));
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

function ago(time: number): string {
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return new Date(time).toLocaleDateString();
}

customElements.define('arg2p-playground', Arg2pPlayground);

declare global {
    const __ARG2P_VERSION__: string;
    interface HTMLElementTagNameMap {
        'arg2p-playground': Arg2pPlayground;
    }
}
