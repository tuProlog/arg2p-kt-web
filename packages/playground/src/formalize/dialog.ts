import { LitElement, css, html } from 'lit';
import { controls, dialogs } from '../styles.js';
import type { ModelSettings } from './openrouter.js';
import { forgetKey, loadSettings, saveSettings, SUGGESTED_MODELS } from './settings.js';

const KEYS = 'https://openrouter.ai/keys';
const MODELS = 'https://openrouter.ai/models?supported_parameters=structured_outputs&order=pricing-low-to-high';

/**
 * The settings of the formalization: the OpenRouter key of the user, the model, how much it reasons. Kept in this
 * browser alone; the key is sent to OpenRouter only. Tells `arg2p-model-settings` once they are saved.
 */
export class Arg2pModelSettings extends LitElement {
    static override properties = {
        settings: { state: true },
        reason: { state: true },
    };

    private settings: ModelSettings = loadSettings();
    // why the dialog opened, when it is not for the settings alone (a formalization waiting for a key)
    private reason = '';

    /** Shows the settings, saying [reason] when there is one */
    async open(reason = ''): Promise<void> {
        this.settings = loadSettings();
        this.reason = reason;
        await this.updateComplete;
        this.renderRoot.querySelector('dialog')?.showModal();
        this.renderRoot.querySelector<HTMLInputElement>('#key')?.focus();
    }

    private save(event: Event): void {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const field = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement).value;
        saveSettings({ key: field('key'), model: field('model'), effort: field('effort') as ModelSettings['effort'] });
        this.renderRoot.querySelector('dialog')?.close();
        this.dispatchEvent(new CustomEvent('arg2p-model-settings', { detail: { settings: loadSettings() }, bubbles: true, composed: true }));
    }

    private forget(): void {
        forgetKey();
        this.settings = loadSettings();
        const key = this.renderRoot.querySelector<HTMLInputElement>('#key');
        if (key !== null) key.value = '';
    }

    protected override render() {
        const { key, model, effort } = this.settings;
        return html`
            <dialog aria-labelledby="model-title" @click=${(e: Event) => e.target === e.currentTarget && (e.currentTarget as HTMLDialogElement).close()}>
                <form @submit=${(e: Event) => this.save(e)}>
                    <h2 id="model-title">Formalize with a language model</h2>
                    ${this.reason === '' ? '' : html`<p>${this.reason}</p>`}
                    <p class="hint">
                        A model of <a href="https://openrouter.ai" target="_blank" rel="noopener">OpenRouter</a> writes the theory, following the method of Arg2P
                        (the skill arg2p-formalize). The text goes to OpenRouter with your key, from this page: the key is kept in this browser alone, and the
                        requests are charged to it.
                    </p>
                    <label for="key">OpenRouter key <a href=${KEYS} target="_blank" rel="noopener">get one</a></label>
                    <div class="row">
                        <input id="key" name="key" type="password" autocomplete="off" spellcheck="false" placeholder="sk-or-…" .value=${key} />
                        <button type="button" class="link" ?disabled=${key === ''} @click=${() => this.forget()}>Forget</button>
                    </div>
                    <label for="model">Model <a href=${MODELS} target="_blank" rel="noopener">others</a></label>
                    <input id="model" name="model" type="text" list="models" spellcheck="false" .value=${model} />
                    <datalist id="models">${SUGGESTED_MODELS.map(it => html`<option value=${it}></option>`)}</datalist>
                    <label for="effort">Reasoning</label>
                    <select id="effort" name="effort" .value=${effort}>
                        <option value="low" ?selected=${effort === 'low'}>Low: faster, cheaper</option>
                        <option value="medium" ?selected=${effort === 'medium'}>Medium</option>
                        <option value="high" ?selected=${effort === 'high'}>High: slower, more careful</option>
                    </select>
                    <div class="dialog-actions">
                        <button type="button" class="link" @click=${() => this.renderRoot.querySelector('dialog')?.close()}>Cancel</button>
                        <button type="submit" class="primary">Save</button>
                    </div>
                </form>
            </dialog>
        `;
    }

    static override styles = [
        controls,
        dialogs,
        css`
            form {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            p {
                margin: 0 0 6px 0;
                line-height: 1.45;
            }
            label {
                margin-top: 6px;
                font-weight: 600;
                font-size: 13px;
            }
            label a {
                font-weight: 400;
                margin-left: 6px;
            }
            .row {
                display: flex;
                gap: 8px;
            }
            input,
            select {
                flex: 1;
                min-width: 0;
                font: 13px var(--arg2p-mono);
                color: var(--arg2p-text);
                background: var(--arg2p-surface-2);
                border: 1px solid var(--arg2p-border);
                border-radius: 6px;
                padding: 6px 8px;
            }
            select {
                font-family: var(--arg2p-font);
            }
        `,
    ];
}

customElements.define('arg2p-model-settings', Arg2pModelSettings);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-model-settings': Arg2pModelSettings;
    }
}
