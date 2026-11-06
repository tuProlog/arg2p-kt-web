import '@tuprolog/arg2p-ui/editor';
import type { Arg2pEditor, EditorMark } from '@tuprolog/arg2p-ui/editor';
import type { Engine } from '@tuprolog/arg2p-ui';
import { LitElement, css, html, nothing } from 'lit';
import { profileOf } from '../documents.js';
import { setting, keepSetting } from '../storage.js';
import { controls } from '../styles.js';
import type { Arg2pModelSettings } from './dialog.js';
import './dialog.js';
import { formalize, type Formalization, type Formalized } from './formalizer.js';
import type { Framework } from './prompt.js';
import { SAMPLES } from './samples.js';
import { loadSettings } from './settings.js';
import { loadSkill } from './skill.js';

const FRAMEWORK = 'arg2p.formalize.framework';

/**
 * A text in natural language, and its formalization: the text edited (`arg2p-text-change`), the passages of the
 * statements linked marked on it (`marks`, see marks.ts; `arg2p-mark-select` tells the one the cursor is in), and the
 * button that has a language model formalize it as a structured theory or an abstract framework, as picked: the page
 * is told the result (`arg2p-formalized`). Under the text, what the formalization says besides the theory: its
 * glossary, the readings chosen, its notes, the model and what it cost.
 */
export class Arg2pText extends LitElement {
    static override properties = {
        text: {},
        formalization: { attribute: false },
        marks: { attribute: false },
        unquoted: { attribute: false },
        gone: { attribute: false },
        unlinked: { attribute: false },
        engine: { attribute: false },
        framework: { state: true },
        step: { state: true },
        elapsed: { state: true },
        failure: { state: true },
    };

    text = '';
    formalization: Formalization | null = null;
    marks: readonly EditorMark[] = [];
    /** Statements whose passage is not in the text */
    unquoted: readonly string[] = [];
    /** Statements linked that the theory no longer has */
    gone: readonly string[] = [];
    /** Statements of the theory no link gives */
    unlinked: readonly string[] = [];
    /** What checks the theories the model writes */
    engine: Pick<Engine, 'check'> | null = null;

    private framework: Framework = setting(FRAMEWORK) === 'abstract' ? 'abstract' : 'structured';
    // what the formalization going on is doing, or null when there is none
    private step: string | null = null;
    private failure: string | null = null;
    private running: AbortController | null = null;
    // the seconds the formalization going on has taken so far
    private elapsed = 0;
    // a formalization waiting for the key to be given
    private waiting = false;

    /** Scrolls the passage of the statement [key] into view */
    showMark(key: string): void {
        this.renderRoot.querySelector<Arg2pEditor>('arg2p-editor')?.showMark(key);
    }

    private pick(framework: Framework): void {
        this.framework = framework;
        keepSetting(FRAMEWORK, framework);
    }

    private async start(): Promise<void> {
        if (this.running !== null) return;
        const settings = loadSettings();
        if (settings.key.trim() === '') {
            this.waiting = true;
            await this.renderRoot.querySelector<Arg2pModelSettings>('arg2p-model-settings')?.open('Give your OpenRouter key to formalize the text.');
            return;
        }
        const engine = this.engine;
        if (engine === null) return;
        const running = new AbortController();
        this.running = running;
        this.failure = null;
        this.step = 'Starting';
        this.elapsed = 0;
        const started = Date.now();
        const ticking = setInterval(() => (this.elapsed = Math.round((Date.now() - started) / 1000)), 1000);
        const text = this.text;
        try {
            const formalized: Formalized = await formalize({
                text,
                framework: this.framework,
                settings,
                skill: () => loadSkill(__ARG2P_VERSION__, (url, init) => fetch(url, init), { get: setting, set: keepSetting }, running.signal),
                check: (theory, kind) => engine.check(theory, kind),
                profileOf: (theory, flags) => profileOf({ theory, flags }),
                post: (url, init) => fetch(url, init),
                signal: running.signal,
                progress: step => (this.step = step),
            });
            if (!running.signal.aborted) this.dispatchEvent(new CustomEvent('arg2p-formalized', { detail: { formalized, text }, bubbles: true, composed: true }));
        } catch (error) {
            this.failure = running.signal.aborted ? 'Stopped.' : messageOf(error);
        } finally {
            clearInterval(ticking);
            this.running = null;
            this.step = null;
        }
    }

    private stop(): void {
        this.running?.abort();
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.stop();
    }

    protected override render() {
        const busy = this.step !== null;
        return html`
            <div class="bar">
                <label for="text" class="title">Text</label>
                <span class="choice" role="radiogroup" aria-label="Formalize as">
                    ${(['structured', 'abstract'] as const).map(
                        it => html`<button
                            type="button"
                            role="radio"
                            aria-checked=${this.framework === it}
                            class=${this.framework === it ? 'on' : ''}
                            ?disabled=${busy}
                            title=${it === 'structured' ? 'Formalize as a structured theory: rules, premises, preferences (ASPIC+, ABA, …)' : 'Formalize as an abstract framework: arguments and attacks'}
                            @click=${() => this.pick(it)}
                        >
                            ${it === 'structured' ? 'Structured' : 'Abstract'}
                        </button>`,
                    )}
                </span>
                <span class="spacer"></span>
                ${busy
                    ? html`<button type="button" @click=${() => this.stop()}>Stop</button>`
                    : html`<button type="button" class="primary" ?disabled=${this.text.trim() === ''} title="Have a language model write the theory of the text" @click=${() => this.start()}>Formalize</button>`}
                <button type="button" class="icon" title="The language model, and your OpenRouter key" aria-label="Settings of the language model" @click=${() => this.renderRoot.querySelector<Arg2pModelSettings>('arg2p-model-settings')?.open()}>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <path
                            d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.5 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"
                            transform="translate(-1 0)"
                        />
                    </svg>
                </button>
            </div>
            <arg2p-editor
                id="text"
                kind="text"
                label="Text"
                placeholder="A text in natural language: rules and their exceptions, facts, norms, opinions… Formalize it, and its passages are linked to the statements of the theory."
                .value=${this.text}
                .marks=${this.marks}
                @arg2p-change=${(e: CustomEvent<{ value: string }>) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent('arg2p-text-change', { detail: { text: e.detail.value }, bubbles: true, composed: true }));
                }}
            ></arg2p-editor>
            ${busy ? html`<div class="status" role="status"><span class="spinner" aria-hidden="true"></span><span>${this.step}…</span><span class="time">${this.elapsed} s</span></div>` : nothing}
            ${!busy && this.text.trim() === '' ? this.renderSamples() : nothing}
            ${this.failure === null
                ? nothing
                : html`<div class="status error" role="alert">
                      <span>${this.failure}</span>
                      <button type="button" class="link" @click=${() => (this.failure = null)}>Dismiss</button>
                  </div>`}
            ${this.renderNotes()}
            <arg2p-model-settings
                @arg2p-model-settings=${() => {
                    if (this.waiting && loadSettings().key.trim() !== '') void this.start();
                    this.waiting = false;
                }}
            ></arg2p-model-settings>
        `;
    }

    // Texts to try, while there is none
    private renderSamples() {
        return html`<div class="samples">
            <span class="hint">Try one:</span>
            ${SAMPLES.map(
                it => html`<button
                    type="button"
                    class="sample"
                    title=${it.text}
                    @click=${() => this.dispatchEvent(new CustomEvent('arg2p-text-change', { detail: { text: it.text }, bubbles: true, composed: true }))}
                >
                    ${it.name}
                </button>`,
            )}
        </div>`;
    }

    private renderNotes() {
        const it = this.formalization;
        if (it === null) return nothing;
        const linked = new Set(it.links.map(link => link.statement)).size;
        const details = [
            it.provider === undefined ? it.model : `${it.model} via ${it.provider}`,
            it.seconds === undefined ? null : `${it.seconds.toFixed(1)} s`,
            it.tokens === undefined
                ? null
                : `${count(it.tokens.prompt)} in, ${count(it.tokens.completion)} out${it.tokens.reasoning > 0 ? ` (${count(it.tokens.reasoning)} reasoning)` : ''}`,
            it.cost === null ? null : `$${it.cost < 0.01 ? it.cost.toPrecision(2) : it.cost.toFixed(2)}`,
        ].filter(part => part !== null);
        return html`
            <details class="notes">
                <summary>
                    ${it.framework === 'abstract' ? 'Abstract framework' : 'Structured theory'}: ${linked} statement${linked === 1 ? '' : 's'} linked
                    <span class="hint">${details.join(' · ')}</span>
                    ${this.unquoted.length + this.gone.length > 0 ? html`<span class="warn" title="Some links are lost">⚠</span>` : nothing}
                </summary>
                ${this.unquoted.length === 0 ? nothing : html`<p class="warn">Passages no longer in the text: ${this.unquoted.join(', ')}.</p>`}
                ${this.gone.length === 0 ? nothing : html`<p class="warn">Statements no longer in the theory: ${this.gone.join(', ')}.</p>`}
                ${this.unlinked.length === 0 ? nothing : html`<p class="hint">Not linked to the text: ${this.unlinked.join(', ')}.</p>`}
                ${it.notes === '' ? nothing : html`<p>${it.notes}</p>`}
                ${it.glossary.length === 0
                    ? nothing
                    : html`<h3>Glossary</h3>
                          <dl>${it.glossary.map(entry => html`<dt><code>${entry.term}</code></dt><dd>${entry.meaning}</dd>`)}</dl>`}
                ${it.ledger.length === 0
                    ? nothing
                    : html`<h3>Readings chosen</h3>
                          <ul>
                              ${it.ledger.map(entry => html`<li><strong>${entry.point}</strong>: ${entry.chosen} <span class="hint">(${entry.readings})</span></li>`)}
                          </ul>`}
                <p class="hint">Written by a language model: check that the theory says what the text does.</p>
            </details>
        `;
    }

    static override styles = [
        controls,
        css`
            :host {
                display: flex;
                flex-direction: column;
                gap: 6px;
                min-height: 0;
            }
            .bar {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }
            .bar button {
                padding: 2px 10px;
                font-size: 13px;
            }
            .bar button.icon {
                padding: 4px;
            }
            .title {
                font-weight: 600;
            }
            .choice {
                display: inline-flex;
            }
            .choice button {
                border-radius: 0;
                color: var(--arg2p-muted);
            }
            .choice button:first-child {
                border-radius: 6px 0 0 6px;
            }
            .choice button:last-child {
                border-radius: 0 6px 6px 0;
                border-left: none;
            }
            .choice button.on {
                color: var(--arg2p-accent);
                background: color-mix(in srgb, var(--arg2p-accent) 12%, var(--arg2p-surface));
                font-weight: 600;
            }
            arg2p-editor {
                flex: 1;
                min-height: 80px;
                /* a text in natural language reads in the font of the page */
                --arg2p-mono: var(--arg2p-font);
            }
            .status {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--arg2p-muted);
            }
            .status .time {
                flex: none;
                font-variant-numeric: tabular-nums;
            }
            .samples {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 6px;
            }
            .samples .hint {
                font-size: 13px;
            }
            .samples .sample {
                font-size: 13px;
                padding: 2px 10px;
                border-radius: 999px;
            }
            .status.error {
                color: var(--arg2p-error);
            }
            .status span {
                flex: 1;
            }
            .spinner {
                flex: none !important;
                width: 12px;
                height: 12px;
                border: 2px solid var(--arg2p-border);
                border-top-color: var(--arg2p-accent);
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
            .notes {
                font-size: 13px;
                max-height: 40%;
                overflow: auto;
                border: 1px solid var(--arg2p-border);
                border-radius: 6px;
                padding: 4px 10px;
                background: var(--arg2p-surface-2);
            }
            .notes summary {
                cursor: pointer;
                padding: 2px 0;
            }
            .notes summary .hint {
                margin-left: 6px;
                font-size: 12px;
            }
            .notes p,
            .notes ul,
            .notes dl {
                margin: 6px 0;
                line-height: 1.45;
            }
            .notes h3 {
                margin: 10px 0 2px 0;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--arg2p-muted);
            }
            .notes dl {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 2px 10px;
            }
            .notes dd {
                margin: 0;
            }
            .notes ul {
                padding-left: 18px;
            }
            .warn {
                color: var(--arg2p-error);
            }
            code {
                font-family: var(--arg2p-mono);
            }
        `,
    ];
}

// [tokens], short: 950, 14.2k
function count(tokens: number): string {
    return tokens < 1000 ? `${tokens}` : `${(tokens / 1000).toFixed(1)}k`;
}

function messageOf(error: unknown): string {
    if (error instanceof TypeError) return 'OpenRouter or GitHub could not be reached: is the device online?';
    return error instanceof Error ? error.message : String(error);
}

customElements.define('arg2p-text', Arg2pText);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-text': Arg2pText;
    }
}
