import '@tuprolog/arg2p-ui/editor';
import '@tuprolog/arg2p-ui/solver';
import type { Arg2pEditor, Arg2pSolver } from '@tuprolog/arg2p-ui';
import {
    declaredFramework,
    frameworkOf,
    parseFramework,
    toApx,
    toTgf,
    toTheory,
    type GraphData,
    type SolutionData,
    type SyntaxProblem,
} from '@tuprolog/arg2p-ui/data';
import { JsEngine } from '@tuprolog/arg2p-ui/js';
import { LitElement, html, nothing } from 'lit';
import { blank, DEFAULT_QUERY, profileOf, type Content, type Workspace } from './documents.js';
import { EXAMPLES, type Example } from './examples.js';
import { ClusterEngine } from './federation/engine.js';
import { Federation, workerCount } from './federation/federation.js';
import './federation/panel.js';
import { downloadText, fileName, pickFile } from './files.js';
import { loadLayout, saveLayout, type Layout } from './layout.js';
import { shareUrl, type Shared } from './links.js';
import { Menus } from './menus.js';
import { followLinks } from './router.js';
import { Session } from './session.js';
import type { Arg2pShare } from './share.js';
import './share.js';
import { browserStorage } from './storage.js';
import { styles } from './styles.js';
import './tabs.js';
import { currentTheme, followSystem, toggleTheme } from './theme.js';

const DOCS = 'https://tuprolog.github.io/arg2p-kt/';
const PROJECT = 'https://github.com/tuProlog/arg2p-kt';
const UNSAVED =
    'The browser did not keep the last changes (its storage is full, or disabled): they stay in this page, and are saved again at the next change. Forget closed theories, or close some, to make room.';

/** What the page tells: a failure, or news */
interface Notice {
    readonly text: string;
    readonly error: boolean;
}

/**
 * The playground: the theories worked on, in tabs kept in the browser; the theory edited on the left, and its solver
 * on the right (the query, its solutions with their graphs or, for an abstract framework, its drawing, the flags), on
 * the solver of the page or, in parallel, on the Web Workers of this device and of the devices of its federation.
 */
export class Arg2pPlayground extends LitElement {
    static override properties = {
        workspace: { state: true },
        active: { state: true },
        content: { state: true },
        notice: { state: true },
        newVersion: { state: true },
        theme: { state: true },
        layout: { state: true },
        tab: { state: true },
        parallel: { state: true },
        busy: { state: true },
        devices: { state: true },
    };

    private readonly local = new JsEngine();
    private readonly federation = new Federation(() => import('./federation/cluster.js').then(it => new it.WebCluster()));
    private readonly parallelEngine = new ClusterEngine(() => this.federation.solver(), this.local);
    private readonly session = new Session(browserStorage(), {
        show: doc => this.show(doc),
        changed: (workspace, active) => {
            this.workspace = workspace;
            this.active = active;
        },
        unsaved: () => (this.notice = { text: UNSAVED, error: true }),
    });

    private workspace: Workspace = this.session.current;
    private active: string | null = null;
    private content: Content = blank();
    private notice: Notice | null = null;
    private theme = currentTheme();
    private layout: Layout = loadLayout();
    // the tab of the solver shown
    private tab = 'results';
    // whether the solver runs in parallel, on the federation
    private parallel = false;
    // a run is being started, or a solution computed
    private busy = false;
    // the other devices of the federation
    private devices = 0;
    // the graph of the solution shown, for its framework to be exported
    private graph: GraphData | null = null;
    // a new version of the playground, waiting to be loaded: what loads it, and whether loading it now was warned of
    private newVersion: { readonly apply: () => void; readonly warned: boolean } | null = null;
    // what stops following the page, its links, its theme and the federation, once the playground leaves it
    private stops: (() => void)[] = [];

    constructor() {
        super();
        new Menus(this);
    }

    override connectedCallback(): void {
        super.connectedCallback();
        const themed = () => {
            this.theme = currentTheme();
            this.solver?.restyle();
        };
        document.addEventListener('arg2p-theme', themed);
        this.stops = [
            () => document.removeEventListener('arg2p-theme', themed),
            followSystem(),
            this.federation.subscribe(() => (this.devices = this.federation.devices.length)),
            this.session.attach(window),
        ];
        this.session.restore(() => EXAMPLES[0]!, EXAMPLES[0]!.name);
        this.stops.push(
            followLinks(window, {
                shared: link => this.openShared(link),
                pairing: link => void this.updateComplete.then(() => this.renderRoot.querySelector('arg2p-federation')?.open(link)),
            }),
        );
        // the first evaluation is much slower than the next ones: the solver warms up meanwhile
        whenIdle(() => this.local.start());
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.stops.forEach(stop => stop());
        this.stops = [];
    }

    /**
     * Offers [apply], which loads a new version of the playground: once nothing would be lost by it, as a run or a
     * federation goes on, and the user agrees
     */
    offerUpdate(apply: () => void): void {
        this.newVersion = { apply, warned: false };
    }

    private reload(): void {
        const update = this.newVersion;
        if (update === null) return;
        if (!update.warned && (this.busy || this.federation.running)) this.newVersion = { ...update, warned: true };
        else update.apply();
    }

    // A shared link opens in a tab of its own, so that it never overwrites anything, and runs
    private openShared(link: Shared): void {
        if (link.errors.length > 0) this.notice = { text: link.errors.join(' '), error: true };
        if (link.content === null) return;
        this.session.open({ ...blank(), ...link.content }, 'Shared link');
        void this.updateComplete.then(() => this.solver?.run());
    }

    private get solver(): Arg2pSolver | null {
        return this.renderRoot.querySelector('arg2p-solver');
    }

    // --- documents ---------------------------------------------------------------------------------------------------

    // Another document shown: the results of the one before let go, its run stopped
    private show(doc: Content): void {
        this.content = { theory: doc.theory, query: doc.query, flags: doc.flags };
        this.graph = null;
        this.solver?.clear();
    }

    private edit(change: Partial<Content>): void {
        this.content = { ...this.content, ...change };
        this.session.edit(change);
    }

    private openExample(example: Example): void {
        this.session.open(example, example.name);
    }

    private get abstract(): boolean {
        return profileOf(this.content) === 'abstract';
    }

    private get name(): string {
        return this.workspace.tabs.find(it => it.id === this.active)?.name ?? 'theory';
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
        void this.renderRoot.querySelector<Arg2pShare>('arg2p-share')?.open(shareUrl(this.content, window.location.href));
    }

    private resize(column: keyof Layout, value: number): void {
        this.layout = { ...this.layout, [column]: value };
        saveLayout(this.layout);
    }

    // --- rendering -----------------------------------------------------------------------------------------------------

    protected override render() {
        return html`
            ${this.renderTop()}
            <arg2p-tabs .session=${this.session} .workspace=${this.workspace} .active=${this.active}></arg2p-tabs>
            <main style="--theory: ${this.layout.theory}%">
                ${this.renderTheory()}
                <arg2p-divider label="Width of the theory" .value=${this.layout.theory} @arg2p-resize=${(e: CustomEvent<{ value: number }>) => this.resize('theory', e.detail.value)}></arg2p-divider>
                ${this.renderSolver()}
            </main>
            <arg2p-share></arg2p-share>
        `;
    }

    private renderTop() {
        const groups = [...new Set(EXAMPLES.map(it => it.group))];
        const notice = this.notice;
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
                                    it => html`<button type="button" role="menuitem" @click=${() => this.openExample(it)}>${it.name}</button>`,
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
            ${notice === null
                ? nothing
                : html`<div class="notice ${notice.error ? 'error' : ''}" role="status">
                      <span>${notice.text}</span>
                      <button type="button" class="link" @click=${() => (this.notice = null)}>Dismiss</button>
                  </div>`}
            ${this.renderNewVersion()}
        `;
    }

    // A new version, offered apart from the notices: none of them hides it
    private renderNewVersion() {
        const update = this.newVersion;
        if (update === null) return nothing;
        return html`<div class="notice" role="status">
            <span>
                ${update.warned
                    ? 'A run or a federation is going on, and reloading would end it: reload once it is over (or leave the federation).'
                    : 'A new version of the playground is ready.'}
            </span>
            <button type="button" @click=${() => this.reload()}>${update.warned ? 'Reload anyway' : 'Reload'}</button>
            <button type="button" class="link" @click=${() => (this.newVersion = null)}>Later</button>
        </div>`;
    }

    private renderTheory() {
        return html`
            <section class="theory">
                <div class="bar">
                    <label for="theory" class="title">Theory</label>
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
                    .engine=${this.local}
                    .value=${this.content.theory}
                    @arg2p-change=${(e: CustomEvent<{ value: string }>) => this.edit({ theory: e.detail.value })}
                ></arg2p-editor>
            </section>
        `;
    }

    private renderSolver() {
        const devices = this.devices;
        return html`
            <arg2p-solver
                style="--arg2p-solutions-width: ${this.layout.solutions}%"
                file-name=${this.name}
                .engine=${this.parallel ? this.parallelEngine : this.local}
                .theory=${this.content.theory}
                .query=${this.content.query}
                .flags=${this.content.flags}
                .tab=${this.tab}
                @arg2p-query-change=${(e: CustomEvent<{ query: string }>) => this.edit({ query: e.detail.query })}
                @arg2p-flags-change=${(e: CustomEvent<{ flags: string }>) => this.edit({ flags: e.detail.flags })}
                @arg2p-theory-change=${(e: CustomEvent<{ theory: string }>) => this.edit({ theory: e.detail.theory })}
                @arg2p-theory-error=${(e: CustomEvent<{ problem: SyntaxProblem }>) => this.renderRoot.querySelector<Arg2pEditor>('#theory')?.report(e.detail.problem)}
                @arg2p-run=${() => this.session.flush()}
                @arg2p-busy=${(e: CustomEvent<{ busy: boolean }>) => (this.busy = e.detail.busy)}
                @arg2p-solution=${(e: CustomEvent<{ solution: SolutionData }>) => (this.graph = e.detail.solution.graph)}
                @arg2p-tab-change=${(e: CustomEvent<{ tab: string }>) => (this.tab = e.detail.tab)}
                @arg2p-reveal=${(e: Event) => (this.tab = (e.target as HTMLElement).id)}
            >
                <arg2p-divider slot="split" label="Width of the solutions" .value=${this.layout.solutions} @arg2p-resize=${(e: CustomEvent<{ value: number }>) => this.resize('solutions', e.detail.value)}></arg2p-divider>
                <label
                    slot="actions"
                    class="mode ${this.parallel ? 'on' : ''}"
                    title="Solve in parallel on the ${workerCount()} Web Workers of this device${devices > 0 ? `, and on those of the ${devices} paired` : ''}"
                >
                    <input type="checkbox" role="switch" .checked=${this.parallel} ?disabled=${this.busy} @change=${(e: Event) => (this.parallel = (e.target as HTMLInputElement).checked)} />
                    Parallel
                </label>
                <arg2p-federation slot="tab" id="federation" label=${devices > 0 ? `Federation (${devices})` : 'Federation'} .federation=${this.federation}></arg2p-federation>
            </arg2p-solver>
        `;
    }

    static override styles = styles;
}

function whenIdle(task: () => void): void {
    const run = () => ('requestIdleCallback' in window ? requestIdleCallback(task, { timeout: 3000 }) : setTimeout(task, 1000));
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
}

customElements.define('arg2p-playground', Arg2pPlayground);

declare global {
    const __ARG2P_VERSION__: string;
    interface HTMLElementTagNameMap {
        'arg2p-playground': Arg2pPlayground;
    }
}
