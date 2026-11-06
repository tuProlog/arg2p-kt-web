import { LitElement, css, html, type PropertyValues } from 'lit';
import { blank, type Workspace } from './documents.js';
import { Menus } from './menus.js';
import type { Session } from './session.js';
import { controls, menus } from './styles.js';

/**
 * The tabs of the theories worked on, as [session] keeps them: picked, renamed (double click), closed (middle click
 * too), a new one, and a menu of them all, open and closed recently (to reopen). The tabs narrow before they scroll;
 * scrolled, they fade at the edges cut, with arrows, and the wheel scrolls them; the active one is kept in view.
 */
export class Arg2pTabs extends LitElement {
    static override properties = {
        session: { attribute: false },
        workspace: { attribute: false },
        active: { attribute: false },
        renaming: { state: true },
        edges: { state: true },
    };

    session: Session | null = null;
    /** The workspace, and its active document, as the session told them last */
    workspace: Workspace | null = null;
    active: string | null = null;

    private renaming: string | null = null;
    // whether tabs are out of view, on the left and on the right
    private edges = { left: false, right: false };
    private readonly resized = new ResizeObserver(() => this.measure());

    constructor() {
        super();
        new Menus(this);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.resized.disconnect();
    }

    protected override firstUpdated(): void {
        const list = this.list;
        if (list !== null) this.resized.observe(list);
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('active') || changed.has('workspace')) this.reveal(changed.has('active'));
        this.measure();
    }

    private get list(): HTMLElement | null {
        return this.renderRoot.querySelector('.tab-list');
    }

    // The active tab scrolled into view (the page itself never scrolls for it)
    private reveal(smoothly: boolean): void {
        const list = this.list;
        const tab = list?.querySelector<HTMLElement>('.tab.active');
        if (!list || !tab) return;
        const area = list.getBoundingClientRect();
        const box = tab.getBoundingClientRect();
        const behavior: ScrollBehavior = smoothly && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto';
        if (box.left < area.left) list.scrollBy({ left: box.left - area.left - 24, behavior });
        else if (box.right > area.right) list.scrollBy({ left: box.right - area.right + 24, behavior });
    }

    private measure(): void {
        const list = this.list;
        if (list === null) return;
        const left = list.scrollLeft > 1;
        const right = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
        if (left !== this.edges.left || right !== this.edges.right) this.edges = { left, right };
    }

    private scrollTabs(direction: -1 | 1): void {
        const list = this.list;
        if (list !== null) list.scrollBy({ left: direction * Math.max(120, list.clientWidth * 0.7), behavior: 'smooth' });
    }

    // The wheel scrolls the tabs sideways
    private wheel(e: WheelEvent): void {
        const list = this.list;
        if (list === null || list.scrollWidth <= list.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        list.scrollLeft += e.deltaY;
        e.preventDefault();
    }

    protected override render() {
        const session = this.session;
        if (session === null || this.workspace === null) return html``;
        const closed = this.workspace.closed;
        return html`
            <button type="button" class="scroll" tabindex="-1" aria-hidden="true" title="Tabs on the left" ?hidden=${!this.edges.left} @click=${() => this.scrollTabs(-1)}>‹</button>
            <!-- the tabs scroll in a list of their own: the menu after it would be cut by the scrolling -->
            <div
                class="tab-list ${this.edges.left ? 'fade-left' : ''} ${this.edges.right ? 'fade-right' : ''}"
                role="tablist"
                aria-label="Open theories"
                @scroll=${() => this.measure()}
                @wheel=${(e: WheelEvent) => this.wheel(e)}
            >
                ${this.workspace.tabs.map(
                    doc => html`
                        <div
                            class="tab ${doc.id === this.active ? 'active' : ''}"
                            role="tab"
                            tabindex="0"
                            aria-selected=${doc.id === this.active}
                            title="${doc.name} — double click to rename"
                            @click=${() => session.select(doc.id)}
                            @keydown=${(e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && session.select(doc.id)}
                            @auxclick=${(e: MouseEvent) => e.button === 1 && session.close(doc.id)}
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
                                          if (this.renaming === doc.id) session.rename(doc.id, (e.target as HTMLInputElement).value);
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
                                    session.close(doc.id);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    `,
                )}
            </div>
            <button type="button" class="scroll" tabindex="-1" aria-hidden="true" title="Tabs on the right" ?hidden=${!this.edges.right} @click=${() => this.scrollTabs(1)}>›</button>
            <button type="button" class="new" title="New theory" aria-label="New theory" @click=${() => session.open(blank(), null)}>+</button>
            <details class="menu bare">
                <summary title="All the theories: open, and closed recently" aria-label="All the theories">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </summary>
                <div class="menu-list right" role="menu">
                    <div class="menu-header">Open</div>
                    ${this.workspace.tabs.map(
                        doc => html`<button type="button" role="menuitem" class=${doc.id === this.active ? 'current' : ''} @click=${() => session.select(doc.id)}>
                            <span>${doc.name}</span>
                        </button>`,
                    )}
                    <hr />
                    <div class="menu-header">Recently closed</div>
                    ${closed.length === 0
                        ? html`<span class="menu-empty">Nothing closed yet</span>`
                        : html`
                              ${closed.map(
                                  doc => html`<button type="button" role="menuitem" @click=${() => session.reopen(doc.id)}>
                                      <span>${doc.name}</span><small>closed ${ago(doc.closedAt)}</small>
                                  </button>`,
                              )}
                              <hr />
                              <button type="button" role="menuitem" @click=${() => session.clearClosed()}>Forget closed theories</button>
                          `}
                </div>
            </details>
        `;
    }

    static override styles = [
        controls,
        menus,
        css`
            /* the line under the tabs, which the active one stands on (drawn as a shadow: the tabs scroll, and nothing
               hangs out of their list) */
            :host {
                position: relative;
                display: flex;
                align-items: center;
                gap: 2px;
                padding: 4px 8px 0 8px;
                box-shadow: inset 0 -1px 0 var(--arg2p-border);
            }
            .tab-list {
                display: flex;
                align-items: flex-end;
                gap: 2px;
                min-width: 0;
                overflow-x: auto;
                overflow-y: hidden;
                scrollbar-width: none;
                align-self: stretch;
            }
            .tab-list::-webkit-scrollbar {
                display: none;
            }
            /* the edges cut fade out */
            .tab-list.fade-left {
                mask-image: linear-gradient(to right, transparent, #000 32px);
            }
            .tab-list.fade-right {
                mask-image: linear-gradient(to left, transparent, #000 32px);
            }
            .tab-list.fade-left.fade-right {
                mask-image: linear-gradient(to right, transparent, #000 32px, #000 calc(100% - 32px), transparent);
            }
            .scroll {
                align-self: stretch;
                border: none;
                background: none;
                padding: 0 4px;
                font-size: 18px;
                line-height: 1;
                color: var(--arg2p-muted);
            }
            /* the tabs narrow, as far as a few letters of their names, before they scroll */
            .tab {
                flex: 0 1 auto;
                min-width: 96px;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                max-width: 220px;
                padding: 4px 6px 4px 12px;
                border: 1px solid transparent;
                border-bottom: none;
                border-radius: 6px 6px 0 0;
                cursor: pointer;
                white-space: nowrap;
                color: var(--arg2p-muted);
            }
            .tab.active {
                color: var(--arg2p-text);
                background: var(--arg2p-surface);
                border-color: var(--arg2p-border);
            }
            .tab .name {
                flex: 1;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tab .close {
                flex: none;
                border: none;
                background: none;
                padding: 0 4px;
                color: var(--arg2p-muted);
            }
            .tab .rename {
                font: inherit;
                width: 12em;
            }
            .menu-list .current {
                font-weight: 600;
            }
            .new,
            summary {
                border: none;
                background: none;
                padding: 2px 8px;
                display: inline-flex;
            }
        `,
    ];
}

// How long ago [time] was, in words
function ago(time: number, now = Date.now()): string {
    const minutes = Math.round((now - time) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return new Date(time).toLocaleDateString();
}

customElements.define('arg2p-tabs', Arg2pTabs);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-tabs': Arg2pTabs;
    }
}
