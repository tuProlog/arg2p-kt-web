import { LitElement, css, html } from 'lit';
import { blank, type Workspace } from './documents.js';
import { Menus } from './menus.js';
import type { Session } from './session.js';
import { controls, menus } from './styles.js';

/**
 * The tabs of the theories worked on, as [session] keeps them: picked, renamed (double click), closed (middle click
 * too), a new one, and those closed recently, to reopen.
 */
export class Arg2pTabs extends LitElement {
    static override properties = {
        session: { attribute: false },
        workspace: { attribute: false },
        active: { attribute: false },
        renaming: { state: true },
    };

    session: Session | null = null;
    /** The workspace, and its active document, as the session told them last */
    workspace: Workspace | null = null;
    active: string | null = null;

    private renaming: string | null = null;

    constructor() {
        super();
        new Menus(this);
    }

    protected override render() {
        const session = this.session;
        if (session === null || this.workspace === null) return html``;
        const closed = this.workspace.closed;
        return html`
            <!-- the tabs scroll in a list of their own: the menu after it would be cut by the scrolling -->
            <div class="tab-list" role="tablist" aria-label="Open theories">
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
            <button type="button" class="new" title="New theory" aria-label="New theory" @click=${() => session.open(blank(), null)}>+</button>
            <details class="menu bare">
                <summary title="Recently closed theories" aria-label="Recently closed theories">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                </summary>
                <div class="menu-list" role="menu">
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
            :host {
                position: relative;
                display: flex;
                align-items: center;
                gap: 2px;
                padding: 4px 8px 0 8px;
                border-bottom: 1px solid var(--arg2p-border);
            }
            .tab-list {
                display: flex;
                align-items: flex-end;
                gap: 2px;
                min-width: 0;
                overflow-x: auto;
                scrollbar-width: thin;
                align-self: stretch;
            }
            .tab {
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
                margin-bottom: -1px;
                padding-bottom: 5px;
            }
            .tab .name {
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .tab .close {
                border: none;
                background: none;
                padding: 0 4px;
                color: var(--arg2p-muted);
            }
            .tab .rename {
                font: inherit;
                width: 12em;
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
