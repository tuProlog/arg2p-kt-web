import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { messageOf } from '../errors.js';
import '../share.js';
import { controls } from '../styles.js';
import { deviceName, devicesOf, workerCount, type Federation, type FederationStats } from './federation.js';
import { codeIn, followPairingLinks, type PairingKind, type PairingLink } from './links.js';
import { DEFAULT_RELAY, decodeInvitation, decodeReply, type Joined } from './pairing.js';
import { qrSvg, scanQr } from './qr.js';

/** Where a pairing is, as this device shows it */
type Step =
    | { kind: 'idle' }
    // this device invites: its link, to scan, and the code the other shows, to type
    | { kind: 'inviting'; link: string }
    // a link of an invitation opened here, to confirm
    | { kind: 'confirm'; code: string }
    // an invitation to scan or paste
    | { kind: 'joining' }
    // joined: what to show the device that invited
    | { kind: 'joined'; joined: Joined }
    // waiting: for an invitation, for a reply, for the pairing to complete
    | { kind: 'waiting'; text: string; back: Step };

/**
 * The federation of the playground with the playgrounds of other devices: the pairing (see pairing.ts), the devices
 * paired, and what the last parallel run did. A link of a pairing opened in the page comes here: the panel asks to be
 * shown (`arg2p-reveal`).
 */
export class Arg2pFederation extends LitElement {
    static override properties = {
        federation: { attribute: false },
        step: { state: true },
        scanning: { state: true },
        pasted: { state: true },
        typed: { state: true },
        reached: { state: true },
        message: { state: true },
        stats: { state: true },
    };

    federation: Federation | null = null;

    private step: Step = { kind: 'idle' };
    private scanning: PairingKind | null = null;
    private pasted = '';
    private typed = '';
    // whether the relay of the invitation can be read
    private reached: boolean | null = null;
    private message: { text: string; error: boolean } | null = null;
    private stats: FederationStats | null = null;
    // the step an answer was waited in: one that comes after another step is let go
    private attempt = 0;
    private scan: AbortController | null = null;
    private unsubscribe: (() => void) | null = null;
    private unfollow: (() => void) | null = null;

    // shown no longer: the camera is let go
    static override get observedAttributes(): string[] {
        return [...super.observedAttributes, 'hidden'];
    }

    override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
        super.attributeChangedCallback(name, old, value);
        if (name === 'hidden' && value !== null) this.cancelScan();
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.unfollow = followPairingLinks(window, link => void this.opened(link));
        document.addEventListener('visibilitychange', this.pageHidden);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.unfollow?.();
        this.unsubscribe?.();
        this.unsubscribe = null;
        document.removeEventListener('visibilitychange', this.pageHidden);
        this.cancelScan();
    }

    protected override willUpdate(changed: PropertyValues): void {
        if (changed.has('federation')) {
            this.unsubscribe?.();
            const federation = this.federation;
            this.unsubscribe =
                federation?.subscribe(() => {
                    this.stats = federation.stats;
                    // paired by a reply opened in another page of this device
                    if (this.step.kind === 'inviting' && !federation.inviting) this.paired();
                }) ?? null;
            this.stats = federation?.stats ?? null;
        }
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('scanning') && this.scanning !== null) void this.startScan(this.scanning);
    }

    private readonly pageHidden = (): void => {
        if (document.hidden) this.cancelScan();
    };

    // A link of a pairing opened here: an invitation is joined once confirmed, a reply handed to the page that invited.
    // The page is asked to show the panel once it is drawn (the link of the page comes as it draws it).
    private async opened(link: PairingLink): Promise<void> {
        await this.updateComplete;
        this.dispatchEvent(new CustomEvent('arg2p-reveal', { bubbles: true, composed: true }));
        if (link.kind === 'join') {
            this.go({ kind: 'confirm', code: link.code });
            this.tell(null);
        } else {
            void this.handOff(link.code);
        }
    }

    private go(step: Step): number {
        this.cancelScan();
        this.step = step;
        this.pasted = '';
        return ++this.attempt;
    }

    private tell(text: string | null, error = false): void {
        this.message = text === null ? null : { text, error };
    }

    // What [task] gives, in a step of waiting that tells [text] and goes back to [back] when cancelled; null when it
    // was cancelled, or failed (told)
    private async wait<T>(text: string, back: Step, task: (federation: Federation) => Promise<T>): Promise<T | null> {
        const federation = this.federation;
        if (federation === null) return null;
        const attempt = this.go({ kind: 'waiting', text, back });
        this.tell(null);
        try {
            const result = await task(federation);
            return attempt === this.attempt ? result : null;
        } catch (error) {
            if (attempt === this.attempt) {
                this.go(back);
                this.tell(messageOf(error), true);
            }
            return null;
        }
    }

    private async invite(): Promise<void> {
        this.reached = null;
        const link = await this.wait('Preparing the invitation…', { kind: 'idle' }, federation =>
            federation.invite(location.href, ok => (this.reached = ok)),
        );
        if (link !== null) this.go({ kind: 'inviting', link });
    }

    // The code the other device shows, typed: its reply, once the relay brings it
    private async pair(back: Step): Promise<void> {
        const code = this.typed;
        if (code.trim() === '') return;
        const done = await this.wait('Pairing…', back, federation => federation.pair(code).then(() => true));
        if (done) this.paired();
    }

    // A reply scanned or pasted on this device
    private async take(text: string, back: Step): Promise<void> {
        const code = codeIn(text, 'reply');
        if (code === null) return this.tell('That is not the reply to an invitation.', true);
        const done = await this.wait('Pairing…', back, federation => federation.take(code).then(() => true));
        if (done) this.paired();
    }

    private paired(): void {
        this.go({ kind: 'idle' });
        this.typed = '';
        this.tell('Paired: the devices lend each other their workers, and parallel runs use them.');
    }

    // An invitation scanned, pasted or opened here, confirmed
    private async join(text: string): Promise<void> {
        const code = codeIn(text, 'join');
        if (code === null) return this.tell('That is not an invitation.', true);
        const joined = await this.wait('Accepting the invitation…', { kind: 'idle' }, federation => federation.join(code, location.href));
        if (joined !== null) this.go({ kind: 'joined', joined });
    }

    private async handOff(code: string): Promise<void> {
        const answered = await this.wait('Handing the reply to the page that invited…', { kind: 'idle' }, federation => federation.handOff(code));
        this.go({ kind: 'idle' });
        if (answered === null) this.tell('No page of this device is waiting for this reply: open the link on the device that invited, while its page is open.', true);
        else if (answered.paired) this.tell('Paired: the page that invited is linked to the other device. This page can be closed.');
        else this.tell(answered.message, true);
    }

    private leave(): void {
        this.go({ kind: 'idle' });
        this.federation?.leave();
        this.tell('Left the federation: the Web Workers of this device stopped.');
    }

    private async startScan(kind: PairingKind): Promise<void> {
        await this.updateComplete;
        const video = this.renderRoot.querySelector<HTMLVideoElement>('video');
        if (video === null) return;
        const scan = new AbortController();
        this.scan = scan;
        const back = this.step;
        try {
            await scanQr(
                video,
                text => {
                    // another QR code: the camera looks on
                    if (!isPairing(text, kind)) {
                        this.tell(kind === 'reply' ? 'That QR code is no reply link: still looking.' : 'That QR code is no invitation: still looking.', true);
                        return false;
                    }
                    this.scanning = null;
                    if (kind === 'reply') void this.take(text, back);
                    else void this.join(text);
                    return true;
                },
                scan.signal,
            );
        } catch (error) {
            if (scan.signal.aborted) return;
            this.scanning = null;
            this.tell(`The camera could not be used: ${messageOf(error)}. Paste the link instead.`, true);
        }
    }

    private cancelScan(): void {
        this.scan?.abort();
        this.scan = null;
        this.scanning = null;
    }

    private renderQr(link: string, label: string) {
        return html`
            <figure class="code">
                <div class="qr" role="img" aria-label=${label}>${unsafeHTML(qrSvg(link))}</div>
                <figcaption><arg2p-link .url=${link} subject="Arg2P federation"></arg2p-link></figcaption>
            </figure>
        `;
    }

    // Where a link of [kind] is scanned or pasted
    private renderRead(kind: PairingKind, act: (text: string) => void) {
        const label = kind === 'reply' ? 'its reply link' : 'the invitation';
        return html`
            <div class="row">
                <button type="button" @click=${() => (this.scanning = kind)}>Scan ${label}</button>
                <span class="hint">or paste it</span>
                <input
                    type="text"
                    aria-label="Paste ${label}"
                    .value=${this.pasted}
                    @input=${(e: Event) => (this.pasted = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && act(this.pasted)}
                />
                <button type="button" ?disabled=${this.pasted.trim() === ''} @click=${() => act(this.pasted)}>${kind === 'reply' ? 'Pair' : 'Join'}</button>
            </div>
        `;
    }

    private renderStep() {
        const step = this.step;
        const relay = hostOf(this.federation?.relay ?? DEFAULT_RELAY);
        switch (step.kind) {
            case 'idle':
                return nothing;
            case 'waiting':
                return html`<div class="row" role="status">
                    <span class="spinner" aria-hidden="true"></span><span>${step.text}</span>
                    <button type="button" @click=${() => this.go(step.back)}>Cancel</button>
                </div>`;
            case 'inviting':
                return html`
                    <p>Scan this QR code with the camera of the other device (or send it the link): it shows a code to type here.</p>
                    ${this.renderQr(step.link, 'The invitation, as a QR code')}
                    <div class="row">
                        <input
                            type="text"
                            class="typed"
                            aria-label="The code the other device shows"
                            placeholder="Code"
                            autocomplete="off"
                            autocapitalize="characters"
                            spellcheck="false"
                            maxlength="8"
                            .value=${this.typed}
                            @input=${(e: Event) => (this.typed = (e.target as HTMLInputElement).value)}
                            @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.pair(step)}
                        />
                        <button type="button" class="primary" ?disabled=${this.typed.trim() === ''} @click=${() => this.pair(step)}>Pair</button>
                    </div>
                    ${this.reached === false
                        ? html`<p class="error">The relay ${relay} cannot be reached: pair with the reply link the other device shows.</p>`
                        : html`<p class="hint">The replies come through ${relay}, sealed: it cannot read them.</p>`}
                    <details ?open=${this.reached === false}>
                        <summary>The other device shows a reply link instead</summary>
                        ${this.renderRead('reply', text => this.take(text, step))}
                    </details>
                `;
            case 'confirm':
                return html`
                    <p>
                        A device invites this one to its federation. Joining starts ${workerCount()} Web Workers here, connects to
                        that device, and runs the theories it sends: join only devices you trust.
                    </p>
                    <div class="row">
                        <button type="button" class="primary" @click=${() => this.join(step.code)}>Join</button>
                        <button type="button" @click=${() => this.go({ kind: 'idle' })}>Decline</button>
                    </div>
                `;
            case 'joining':
                return this.renderRead('join', text => this.join(text));
            case 'joined':
                return step.joined.code === null
                    ? html`
                          <p class="error">The relay could not take the reply (${step.joined.relayError}).</p>
                          <p>Show this QR code to the device that invited (or send it the link): it pairs once it reads it.</p>
                          ${this.renderQr(step.joined.link, 'The reply, as a QR code')}
                      `
                    : html`
                          <p>Type this code on the device that invited:</p>
                          <p class="big" aria-label="The code">${step.joined.code}</p>
                          <details>
                              <summary>The code does not pair? Show the reply as a QR code</summary>
                              ${this.renderQr(step.joined.link, 'The reply, as a QR code')}
                          </details>
                      `;
        }
    }

    private renderStats() {
        const stats = this.stats;
        if (stats === null) return html`<p class="hint">Not running: a parallel run, an invitation or a join starts it.</p>`;
        const evaluation = stats.evaluation;
        return html`
            <table>
                <caption>
                    Devices
                </caption>
                <thead>
                    <tr><th scope="col">Device</th><th scope="col">Workers</th><th scope="col">Linked</th></tr>
                </thead>
                <tbody>
                    ${devicesOf(stats).map(
                        (it, i) => html`<tr>
                            <td title=${it.id}>${it.name}</td>
                            <td>${it.workers ?? '—'}</td>
                            <td>${i === 0 ? '' : it.via === null ? 'directly' : `through ${it.via}`}</td>
                        </tr>`,
                    )}
                </tbody>
            </table>
            ${evaluation === null
                ? html`<p class="hint">No parallel run yet.</p>`
                : html`
                      <p>
                          The last run built ${evaluation.arguments} arguments and ${evaluation.attacks} attacks
                          (${evaluation.added} new) on the ${evaluation.locality.replace(/_/g, ' ')}, in
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
        const others = this.federation?.devices.length ?? 0;
        return html`
            <p class="hint">
                A parallel run solves on the ${workerCount()} Web Workers of this device. Pair it with the playground of another
                device on the same network: each lends the other its workers, and parallel runs use them all. A device runs the
                theories the others send it: pair only with devices you trust.
            </p>
            <div class="row">
                <button type="button" class="primary" @click=${() => this.invite()}>Invite a device</button>
                <button type="button" @click=${() => (this.go({ kind: 'joining' }), this.tell(null))}>Join a device</button>
                <span class="status" role="status">${others > 0 ? `Paired with ${others} ${others === 1 ? 'device' : 'devices'}` : running ? 'Not paired' : ''}</span>
                ${running ? html`<button type="button" class="link" @click=${() => this.leave()}>Leave</button>` : nothing}
            </div>
            ${this.message === null ? nothing : html`<p class="message ${this.message.error ? 'error' : ''}" role="status">${this.message.text}</p>`}
            ${this.scanning === null
                ? nothing
                : html`<div class="scanner">
                      <video aria-label="The camera"></video>
                      <button type="button" @click=${() => this.cancelScan()}>Cancel</button>
                  </div>`}
            ${this.renderStep()}
            <section class="stats" aria-label="The federation">${this.renderStats()}</section>
            <details class="relay">
                <summary>Relay</summary>
                <p class="hint">The ntfy server the replies to invitations go through, sealed: ntfy.sh, or one of your own.</p>
                <input
                    type="text"
                    aria-label="The relay"
                    placeholder=${DEFAULT_RELAY}
                    .value=${this.federation?.relay ?? DEFAULT_RELAY}
                    @change=${(e: Event) => this.federation && (this.federation.relay = (e.target as HTMLInputElement).value)}
                />
            </details>
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
            .row input {
                flex: 1;
            }
            .row input.typed {
                flex: 0 1 10em;
                font-size: 18px;
                letter-spacing: 0.2em;
                text-transform: uppercase;
            }
            .status {
                color: var(--arg2p-muted);
            }
            .big {
                font: 600 32px var(--arg2p-mono);
                letter-spacing: 0.25em;
                color: var(--arg2p-accent);
            }
            .code {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .code figcaption {
                width: min(480px, 100%);
            }
            .qr {
                width: min(300px, 80vw);
                line-height: 0;
                border-radius: 8px;
                overflow: hidden;
            }
            .qr svg {
                width: 100%;
                height: auto;
            }
            .scanner {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .scanner video {
                width: min(420px, 100%);
                border-radius: 8px;
                background: #000000;
            }
            details > summary {
                cursor: pointer;
                border: none;
                background: none;
                padding: 4px 0;
                color: var(--arg2p-muted);
            }
            details[open] > summary {
                margin-bottom: 6px;
            }
            .relay input {
                width: min(420px, 100%);
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

// The host of the relay at [url], or the URL as it was set when it is none
function hostOf(url: string): string {
    try {
        return new URL(url).host;
    } catch {
        return url;
    }
}

// Whether [text], scanned, is a link of a pairing of [kind] (or its code)
function isPairing(text: string, kind: PairingKind): boolean {
    const code = codeIn(text, kind);
    return code !== null && (kind === 'reply' ? decodeReply(code) : decodeInvitation(code)) !== null;
}

customElements.define('arg2p-federation', Arg2pFederation);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-federation': Arg2pFederation;
    }
}
