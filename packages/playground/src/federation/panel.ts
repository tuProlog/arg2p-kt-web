import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { readArgument } from './arguments.js';
import type { FederatedAnswer, FederatedArgument, Federation } from './federation.js';
import { codeIn, pairingLink, type Pairing, type PairingKind } from './links.js';
import { receiveReply, workerCount } from './pairing.js';
import { qrSvg, scanQr } from './qr.js';

/**
 * The federation of the playground with those of other devices: the pairing by hand (an invitation and its reply, as
 * QR codes or links), the devices paired, and the statements solved by the workers of every one of them.
 */
export class Arg2pFederation extends LitElement {
    static override properties = {
        theory: {},
        flags: {},
        invitation: { state: true },
        reply: { state: true },
        joining: { state: true },
        scanning: { state: true },
        pasted: { state: true },
        devices: { state: true },
        running: { state: true },
        statement: { state: true },
        answer: { state: true },
        solving: { state: true },
        message: { state: true },
    };

    /** The theory, and its flags (Prolog facts), solved on the federation */
    theory = '';
    flags = '';

    // the federation, and with it the solver, loaded once asked for
    private federation: Federation | null = null;
    // the links of this device's invitation and of its reply to another's
    private invitation: string | null = null;
    private reply: string | null = null;
    // the code of an invitation asked for, to scan or paste
    private joining = false;
    private scanning: PairingKind | null = null;
    private pasted = '';
    private devices = 0;
    private running = false;
    private statement = '';
    private answer: FederatedAnswer | null = null;
    private solving = false;
    private message: { text: string; error: boolean } | null = null;
    private stopScan: (() => void) | null = null;
    private timer: ReturnType<typeof setInterval> | null = null;

    private async started(): Promise<Federation> {
        if (this.federation === null) {
            const { Federation } = await import('./federation.js');
            const federation = new Federation();
            federation.onPaired = () => {
                this.invitation = null;
                this.pasted = '';
                this.tell('Paired: the devices lend each other their workers.');
                this.refresh();
            };
            federation.onFailed = message => this.tell(message, true);
            this.federation = federation;
        }
        return this.federation;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        // the devices come and go: told every second
        this.timer = setInterval(() => this.refresh(), 1000);
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.timer !== null) clearInterval(this.timer);
        this.stopScan?.();
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('scanning') && this.scanning !== null) void this.startScan(this.scanning);
    }

    /** Accepts the invitation [code] of another device (a link #join= opened here) */
    async join(code: string): Promise<void> {
        this.joining = false;
        this.reply = null;
        this.tell('Accepting the invitation…');
        try {
            const reply = await (await this.started()).accept(code);
            this.reply = pairingLink(location.href, { kind: 'reply', code: reply });
            this.tell('Show this code to the device that invited, or send it the link: it pairs with this one once it reads it.');
        } catch (error) {
            this.tell(`The invitation could not be accepted: ${(error as Error).message ?? String(error)}`, true);
        }
        this.refresh();
    }

    /** Hands the reply [code] (a link #reply= opened here) to the page of this device that invited */
    async receive(code: string): Promise<void> {
        this.tell('Handing the reply to the page that invited…');
        const answered = await receiveReply(code);
        if (answered === null) {
            this.tell('No page of this device is waiting for this reply: open the link on the device that invited, while its page is open.', true);
        } else if (answered.paired) {
            this.tell('Paired: the page that invited is linked to the other device. This page can be closed.');
        } else {
            this.tell(answered.message, true);
        }
    }

    /** What the link of [pairing] opened here asks */
    opened(pairing: Pairing): void {
        if (pairing.kind === 'join') void this.join(pairing.code);
        else void this.receive(pairing.code);
    }

    private refresh(): void {
        this.running = this.federation?.running ?? false;
        this.devices = this.federation?.devices ?? 0;
    }

    private tell(text: string, error = false): void {
        this.message = { text, error };
    }

    private async invite(): Promise<void> {
        this.joining = false;
        this.reply = null;
        this.tell('Preparing the invitation…');
        try {
            const code = await (await this.started()).invite();
            this.invitation = pairingLink(location.href, { kind: 'join', code });
            this.tell('Scan this code with the camera of the other device (or send it the link), then read the code it shows back.');
        } catch (error) {
            this.tell(`The invitation could not be made: ${(error as Error).message ?? String(error)}`, true);
        }
        this.refresh();
    }

    private async startScan(kind: PairingKind): Promise<void> {
        await this.updateComplete;
        const video = this.renderRoot.querySelector<HTMLVideoElement>('video');
        if (video === null) return;
        try {
            this.stopScan = await scanQr(video, text => {
                this.stopScan = null;
                this.scanning = null;
                this.read(text, kind);
            });
        } catch (error) {
            this.scanning = null;
            this.tell(`The camera could not be used: ${(error as Error).message ?? String(error)}. Paste the code instead.`, true);
        }
    }

    private cancelScan(): void {
        this.stopScan?.();
        this.stopScan = null;
        this.scanning = null;
    }

    // A code scanned or pasted: the reply to this device's invitation, or the invitation of another
    private read(text: string, kind: PairingKind): void {
        const code = codeIn(text, kind);
        if (code === null) {
            this.tell(kind === 'reply' ? 'That is not the reply to an invitation.' : 'That is not an invitation.', true);
            return;
        }
        this.pasted = '';
        if (kind === 'reply') void this.started().then(federation => federation.complete(code));
        else void this.join(code);
    }

    private async share(link: string): Promise<void> {
        if (typeof navigator.share === 'function') {
            await navigator.share({ title: 'Arg2P federation', url: link }).catch(() => {});
            return;
        }
        await navigator.clipboard?.writeText(link).then(
            () => this.tell('Link copied.'),
            () => this.tell('The link could not be copied.', true),
        );
    }

    private async solve(): Promise<void> {
        const statement = this.statement.trim().replace(/\.$/, '');
        if (statement === '') return;
        this.solving = true;
        this.answer = null;
        try {
            this.answer = await (await this.started()).solve(this.theory, this.flags, statement);
            if (this.answer.error) this.tell(this.answer.error, true);
        } catch (error) {
            this.tell(`The federation could not solve it: ${(error as Error).message ?? String(error)}`, true);
        } finally {
            this.solving = false;
        }
    }

    private leave(): void {
        this.cancelScan();
        this.federation?.close();
        this.invitation = null;
        this.reply = null;
        this.answer = null;
        this.tell('Left the federation.');
        this.refresh();
    }

    private renderCode(link: string, label: string) {
        const native = typeof navigator.share === 'function';
        return html`
            <figure class="code">
                <div class="qr" role="img" aria-label=${label}>${unsafeHTML(qrSvg(link))}</div>
                <figcaption>
                    <button type="button" @click=${() => this.share(link)}>${native ? 'Share the link' : 'Copy the link'}</button>
                </figcaption>
            </figure>
        `;
    }

    private renderPaste(kind: PairingKind) {
        const label = kind === 'reply' ? 'its reply' : 'an invitation';
        return html`
            <div class="read">
                <button type="button" @click=${() => (this.scanning = kind)}>Scan ${label}</button>
                <span class="hint">or paste it</span>
                <input
                    type="text"
                    aria-label="Paste ${label}"
                    .value=${this.pasted}
                    @input=${(e: Event) => (this.pasted = (e.target as HTMLInputElement).value)}
                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.read(this.pasted, kind)}
                />
                <button type="button" ?disabled=${this.pasted.trim() === ''} @click=${() => this.read(this.pasted, kind)}>
                    ${kind === 'reply' ? 'Pair' : 'Join'}
                </button>
            </div>
        `;
    }

    // An argument: what it concludes and the rules it rests on, or its text as the federation gave it
    private renderArgument(argument: FederatedArgument) {
        const text = argument.chain.join(', ');
        const read = readArgument(text);
        return read === null
            ? html`<li><code>${argument.claim}</code>${text === '' ? nothing : html`<small>${text}</small>`}</li>`
            : html`<li><code>${read.conclusion}</code><small>${read.rules.join(', ')}</small></li>`;
    }

    private renderArguments(label: string, list: readonly FederatedArgument[]) {
        return html`
            <div class="label ${label}">
                <h4>${label.toUpperCase()} <span class="count">${list.length}</span></h4>
                ${list.length === 0
                    ? html`<p class="hint">none</p>`
                    : html`<ul>
                          ${list.map(it => this.renderArgument(it))}
                      </ul>`}
            </div>
        `;
    }

    protected override render() {
        return html`
            <p class="hint">
                Pair this playground with that of another device on the same network (the same Wi-Fi): each lends the other its
                workers (${workerCount()} here), and a statement is solved by the workers of both. A device runs the
                theories the others send it: pair only with devices you trust.
            </p>
            <div class="actions">
                <button type="button" class="primary" @click=${() => this.invite()}>Invite a device</button>
                <button type="button" @click=${() => ((this.joining = true), (this.invitation = null), (this.reply = null))}>Join a device</button>
                <span class="status" role="status">
                    ${this.devices > 0
                        ? html`Paired with ${this.devices} ${this.devices === 1 ? 'device' : 'devices'}`
                        : this.running
                          ? 'Not paired yet'
                          : nothing}
                </span>
                ${this.running ? html`<button type="button" class="link" @click=${() => this.leave()}>Leave</button>` : nothing}
            </div>
            ${this.message === null ? nothing : html`<p class="message ${this.message.error ? 'error' : ''}">${this.message.text}</p>`}
            ${this.scanning === null
                ? nothing
                : html`<div class="scanner">
                      <video aria-label="The camera"></video>
                      <button type="button" @click=${() => this.cancelScan()}>Cancel</button>
                  </div>`}
            ${this.invitation === null ? nothing : html`${this.renderCode(this.invitation, 'The invitation, as a QR code')} ${this.renderPaste('reply')}`}
            ${this.joining ? this.renderPaste('join') : nothing}
            ${this.reply === null ? nothing : this.renderCode(this.reply, 'The reply, as a QR code')}
            ${this.devices > 0
                ? html`
                      <div class="solve">
                          <input
                              type="text"
                              aria-label="Statement"
                              placeholder="A statement of the theory: flies(X)"
                              .value=${this.statement}
                              @input=${(e: Event) => (this.statement = (e.target as HTMLInputElement).value)}
                              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.solve()}
                          />
                          <button type="button" class="primary" ?disabled=${this.solving || this.statement.trim() === ''} @click=${() => this.solve()}>
                              ${this.solving ? 'Solving…' : 'Solve on the federation'}
                          </button>
                      </div>
                      ${this.answer === null
                          ? nothing
                          : html`<div class="answer">
                                ${this.renderArguments('in', this.answer.in)} ${this.renderArguments('out', this.answer.out)}
                                ${this.renderArguments('und', this.answer.und)}
                            </div>`}
                  `
                : nothing}
        `;
    }

    static override styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 10px;
            color: var(--arg2p-text);
            font-family: var(--arg2p-font);
            font-size: 14px;
        }
        button {
            font: inherit;
            color: var(--arg2p-text);
            background: var(--arg2p-surface);
            border: 1px solid var(--arg2p-border);
            border-radius: 6px;
            padding: 4px 12px;
            cursor: pointer;
        }
        button:disabled {
            opacity: 0.5;
            cursor: default;
        }
        button.primary {
            color: #ffffff;
            background: var(--arg2p-accent);
            border-color: var(--arg2p-accent);
        }
        button.link {
            border: none;
            background: none;
            color: var(--arg2p-accent);
        }
        input {
            font: inherit;
            font-family: var(--arg2p-mono);
            color: var(--arg2p-text);
            background: var(--arg2p-surface);
            border: 1px solid var(--arg2p-border);
            border-radius: 6px;
            padding: 4px 8px;
            min-width: 0;
            flex: 1;
        }
        .hint {
            margin: 0;
            color: var(--arg2p-muted);
            font-size: 13px;
        }
        .actions,
        .read,
        .solve {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
        }
        .status {
            color: var(--arg2p-muted);
        }
        .message {
            margin: 0;
        }
        .message.error {
            color: var(--arg2p-error);
        }
        .code {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .qr {
            width: min(320px, 80vw);
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
        .answer {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
        }
        h4 {
            margin: 0 0 4px 0;
            font-size: 13px;
        }
        .label.in h4 {
            color: var(--arg2p-in, #008080);
        }
        .label.out h4 {
            color: var(--arg2p-out, #800000);
        }
        .label.und h4 {
            color: var(--arg2p-und, #808080);
        }
        .count {
            color: var(--arg2p-muted);
            font-weight: 400;
        }
        ul {
            margin: 0;
            padding-left: 18px;
        }
        li small {
            display: block;
            color: var(--arg2p-muted);
            font-family: var(--arg2p-mono);
            font-size: 12px;
        }
    `;
}

customElements.define('arg2p-federation', Arg2pFederation);
