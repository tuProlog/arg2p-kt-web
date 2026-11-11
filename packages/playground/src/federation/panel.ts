import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { messageOf } from '../errors.js';
import { controls } from '../styles.js';
import { deviceName, devicesOf, workerCount, type Federation, type FederationStats } from './federation.js';
import { serverAddress, unreachable, type ServerLink } from './links.js';

/**
 * The federation of the playground with a server (see federation.ts): its address and code typed, or opened with its link
 * (`open`, which asks the page to show the panel, `arg2p-reveal`, and to be confirmed); the devices of the federation,
 * and what the last parallel run did.
 */
export class Arg2pFederation extends LitElement {
    static override properties = {
        federation: { attribute: false },
        address: { state: true },
        code: { state: true },
        confirming: { state: true },
        connecting: { state: true },
        message: { state: true },
        stats: { state: true },
    };

    federation: Federation | null = null;

    private address = '';
    private code = '';
    // a link of a server opened in the page, to confirm
    private confirming = false;
    private connecting = false;
    private message: { text: string; error: boolean } | null = null;
    private stats: FederationStats | null = null;
    private unsubscribe: (() => void) | null = null;

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.unsubscribe?.();
        this.unsubscribe = null;
    }

    protected override willUpdate(changed: PropertyValues): void {
        if (changed.has('federation')) {
            this.unsubscribe?.();
            const federation = this.federation;
            this.unsubscribe = federation?.subscribe(() => (this.stats = federation.stats)) ?? null;
            this.stats = federation?.stats ?? null;
        }
    }

    /** Opens [link], the link of a server opened in the page: connected to once confirmed. The page is asked to show the panel. */
    async open(link: ServerLink): Promise<void> {
        await this.updateComplete;
        this.dispatchEvent(new CustomEvent('arg2p-reveal', { bubbles: true, composed: true }));
        this.address = link.url;
        this.code = link.code ?? '';
        this.confirming = true;
        this.tell(null);
    }

    private tell(text: string | null, error = false): void {
        this.message = text === null ? null : { text, error };
    }

    private async connect(): Promise<void> {
        const federation = this.federation;
        if (federation === null || this.connecting) return;
        const url = serverAddress(this.address);
        if (url === null) return this.tell('That is no address of a server: it reads as wss://host:port.', true);
        const refused = unreachable(url, location.href);
        if (refused !== null) return this.tell(refused, true);
        this.confirming = false;
        this.connecting = true;
        this.tell(null);
        try {
            await federation.connect(url, this.code.trim() === '' ? null : this.code.trim());
            this.tell('Connected: this device lends its workers to the federation of the server, and parallel runs use theirs.');
        } catch (error) {
            this.tell(messageOf(error), true);
        } finally {
            this.connecting = false;
        }
    }

    private leave(): void {
        this.confirming = false;
        this.federation?.leave();
        this.tell('Left the federation: the Web Workers of this device stopped.');
    }

    private renderConnect() {
        return html`
            ${this.confirming
                ? html`<p>
                      A link connects this device to the federation of a server. Connecting starts ${workerCount()} Web Workers here,
                      and runs the theories the server and its devices send: connect only to servers you trust.
                  </p>`
                : nothing}
            <div class="row">
                <input
                    type="text"
                    class="address"
                    aria-label="The address of the server"
                    placeholder="wss://host:port"
                    autocomplete="off"
                    spellcheck="false"
                    .value=${this.address}
                    @input=${(e: Event) => (this.address = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.connect()}
                />
                <input
                    type="text"
                    class="code"
                    aria-label="The code of the server"
                    placeholder="Code"
                    autocomplete="off"
                    inputmode="numeric"
                    spellcheck="false"
                    maxlength="8"
                    .value=${this.code}
                    @input=${(e: Event) => (this.code = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.connect()}
                />
                <button type="button" class="primary" ?disabled=${this.connecting || this.address.trim() === ''} @click=${() => this.connect()}>
                    Connect
                </button>
                ${this.confirming ? html`<button type="button" @click=${() => (this.confirming = false)}>Decline</button>` : nothing}
            </div>
            ${this.connecting
                ? html`<div class="row" role="status"><span class="spinner" aria-hidden="true"></span><span>Connecting…</span></div>`
                : nothing}
        `;
    }

    private renderStats() {
        const stats = this.stats;
        if (stats === null) return html`<p class="hint">Not running: a parallel run, or a connection to a server, starts it.</p>`;
        const evaluation = stats.evaluation;
        return html`
            <table>
                <caption>
                    Devices
                </caption>
                <thead>
                    <tr><th scope="col">Device</th><th scope="col">Workers</th></tr>
                </thead>
                <tbody>
                    ${devicesOf(stats).map(it => html`<tr><td title=${it.id}>${it.name}</td><td>${it.workers ?? '—'}</td></tr>`)}
                </tbody>
            </table>
            ${evaluation === null
                ? html`<p class="hint">No parallel run yet.</p>`
                : html`
                      <p>
                          The last run built ${evaluation.arguments} arguments and ${evaluation.attacks} attacks
                          (${evaluation.added} new) on the ${evaluation.locality === 'wholeGraph' ? 'whole graph' : evaluation.locality}, in
                          ${Math.round(evaluation.milliseconds)} ms.
                      </p>
                      <table>
                          <caption>
                              What each worker built
                          </caption>
                          <thead>
                              <tr><th scope="col">Partition</th><th scope="col">Device</th><th scope="col">Arguments</th><th scope="col">Attacks</th></tr>
                          </thead>
                          <tbody>
                              ${evaluation.workers.map(
                                  it => html`<tr><td>${it.partition}</td><td>${deviceName(stats, it.site)}</td><td>${it.arguments}</td><td>${it.attacks}</td></tr>`,
                              )}
                          </tbody>
                      </table>
                  `}
        `;
    }

    protected override render() {
        const running = this.stats !== null;
        const server = this.federation?.server ?? null;
        const others = this.federation?.devices.length ?? 0;
        return html`
            <p class="hint">
                A parallel run solves on the ${workerCount()} Web Workers of this device. Connect it to a server of Arg2P (the
                extension of VS Code, or an instance on the JVM or Node.js, listening) with the address and the code it shows: the
                devices of its federation lend each other their workers, and parallel runs use them all. A device runs the theories
                the others send it: connect only to servers you trust.
            </p>
            ${this.renderConnect()}
            <div class="row">
                <span class="status" role="status"
                    >${server !== null
                        ? `Connected to ${server}${others > 0 ? `, with ${others} ${others === 1 ? 'device' : 'devices'}` : ''}`
                        : running
                          ? 'Not connected'
                          : ''}</span
                >
                ${running ? html`<button type="button" class="link" @click=${() => this.leave()}>Leave</button>` : nothing}
            </div>
            ${this.message === null ? nothing : html`<p class="message ${this.message.error ? 'error' : ''}" role="status">${this.message.text}</p>`}
            <section class="stats" aria-label="The federation">${this.renderStats()}</section>
        `;
    }

    static override styles = [
        controls,
        css`
            :host {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 8px 2px;
            }
            p {
                margin: 0;
            }
            .row {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
            }
            .row input.address {
                flex: 1 1 18em;
            }
            .row input.code {
                flex: 0 1 7em;
                letter-spacing: 0.2em;
            }
            .status {
                color: var(--arg2p-muted);
            }
            table {
                border-collapse: collapse;
                font-size: 13px;
                font-variant-numeric: tabular-nums;
            }
            caption {
                text-align: left;
                font-weight: 600;
                padding-bottom: 4px;
            }
            th,
            td {
                text-align: left;
                padding: 3px 14px 3px 0;
                border-bottom: 1px solid var(--arg2p-border);
            }
            th {
                color: var(--arg2p-muted);
                font-weight: 400;
            }
            .stats {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .spinner {
                width: 12px;
                height: 12px;
                border: 2px solid currentColor;
                border-right-color: transparent;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
            @media (prefers-reduced-motion: reduce) {
                .spinner {
                    animation: none;
                }
            }
        `,
    ];
}

customElements.define('arg2p-federation', Arg2pFederation);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-federation': Arg2pFederation;
    }
}
