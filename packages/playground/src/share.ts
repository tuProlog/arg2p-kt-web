import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { controls, dialogs } from './styles.js';

/**
 * A link to hand on: shown, to select, with a button that copies it and, where the system shares, one that shares it
 * (by message, mail, ...) as [subject].
 */
export class Arg2pLink extends LitElement {
    static override properties = {
        url: {},
        subject: {},
        copied: { state: true },
    };

    url = '';
    subject = '';

    private copied: string | null = null;

    private async copy(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.url);
            this.copied = 'Copied ✓';
        } catch {
            this.renderRoot.querySelector('input')?.select();
            this.copied = 'Press Ctrl+C';
        }
    }

    protected override willUpdate(changed: PropertyValues): void {
        if (changed.has('url')) this.copied = null;
    }

    protected override render() {
        const native = typeof navigator.share === 'function';
        return html`
            <input type="text" readonly aria-label="The link" .value=${this.url} @focus=${(e: Event) => (e.target as HTMLInputElement).select()} />
            <button type="button" class="primary" @click=${() => this.copy()}>${this.copied ?? 'Copy'}</button>
            ${native
                ? html`<button type="button" @click=${() => navigator.share({ title: this.subject || document.title, url: this.url }).catch(() => {})}>Share via…</button>`
                : nothing}
        `;
    }

    static override styles = [
        controls,
        css`
            :host {
                display: flex;
                gap: 8px;
            }
            input {
                flex: 1;
            }
        `,
    ];
}

/** The dialog of a link to the playground as it is now */
export class Arg2pShare extends LitElement {
    static override properties = {
        url: { state: true },
    };

    private url = '';

    /** Shows the dialog of [url] */
    async open(url: string): Promise<void> {
        this.url = url;
        await this.updateComplete;
        this.renderRoot.querySelector('dialog')?.showModal();
        this.renderRoot.querySelector('arg2p-link')?.renderRoot.querySelector('input')?.select();
    }

    protected override render() {
        return html`
            <dialog aria-labelledby="share-title" @click=${(e: Event) => e.target === e.currentTarget && (e.currentTarget as HTMLDialogElement).close()}>
                <form method="dialog">
                    <h2 id="share-title">Share</h2>
                    <p class="hint">The link opens the playground as it is now, and runs it.</p>
                    <arg2p-link .url=${this.url}></arg2p-link>
                    <div class="dialog-actions">
                        <button value="close" class="link">Close</button>
                    </div>
                </form>
            </dialog>
        `;
    }

    static override styles = [controls, dialogs];
}

customElements.define('arg2p-link', Arg2pLink);
customElements.define('arg2p-share', Arg2pShare);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-link': Arg2pLink;
        'arg2p-share': Arg2pShare;
    }
}
