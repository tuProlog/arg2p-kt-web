import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import type { EngineError, Run, SolutionData } from '../engine.js';
import { tokens } from '../theme.js';

// Bindings named after a label (In, Out, Und) hold sets of arguments or statements: shown as chips coloured like the
// graph
const LABELS = ['in', 'out', 'und'];

interface Entry {
    readonly solution: SolutionData;
    // its number among the yes solutions, 0 for the others
    readonly accepted: number;
}

/**
 * The solutions of a query, asked for one at a time (Next): yes with its bindings, no, or halt with its error; an
 * error that kept the query from running shows alone. Picking a yes solution shows it again (its graph, say).
 *
 * Events: `arg2p-solution` with the solution and its run, when one is shown (the newest, or one picked);
 * `arg2p-busy` with whether a solution is being computed; `arg2p-failure` with the EngineError of a computation that
 * failed (stopped, say); `arg2p-error-select` with the error shown, when it is picked (to go where it is).
 *
 * Attributes: `hide-exhausted-no` hides the no that only tells that the yes solutions are over; `trivial` is set
 * when there is nothing to show besides the query itself (a page may hide the solutions then).
 */
export class Arg2pSolutions extends LitElement {
    static override properties = {
        hideExhaustedNo: { type: Boolean, attribute: 'hide-exhausted-no' },
        trivial: { type: Boolean, reflect: true },
        busy: { type: Boolean, reflect: true },
        run: { state: true },
        entries: { state: true },
        error: { state: true },
        shown: { state: true },
    };

    hideExhaustedNo = false;
    trivial = true;
    busy = false;

    private run: Run | null = null;
    private entries: Entry[] = [];
    private error: EngineError | null = null;
    private shown: Entry | null = null;

    /** Shows the solutions of [run], from its first one */
    start(run: Run): Promise<void> {
        this.reset();
        this.run = run;
        return this.next();
    }

    /** Shows [error], which kept a query from running */
    fail(error: EngineError): void {
        this.reset();
        this.error = error;
    }

    clear(): void {
        this.reset();
    }

    /** Whether there is another solution to ask for */
    get hasNext(): boolean {
        return this.run !== null && !this.busy && this.run.hasNext();
    }

    /** Asks for the next solution: the page stays responsive meanwhile. A run replaced meanwhile is let go */
    next(): Promise<void> {
        const run = this.run;
        if (run === null || this.busy || !run.hasNext()) return Promise.resolve();
        this.setBusy(true);
        return run.next().then(
            solution => {
                if (run !== this.run) return;
                this.setBusy(false);
                this.add(solution);
            },
            (error: EngineError) => {
                if (run !== this.run) return;
                this.setBusy(false);
                this.emit('arg2p-failure', { error });
            },
        );
    }

    private reset(): void {
        this.run = null;
        this.entries = [];
        this.error = null;
        this.shown = null;
        this.setBusy(false);
    }

    private setBusy(busy: boolean): void {
        if (this.busy === busy) return;
        this.busy = busy;
        this.emit('arg2p-busy', { busy });
    }

    private add(solution: SolutionData): void {
        const accepted = this.entries.filter(it => it.accepted > 0).length;
        // Once a solution has been accepted, a trailing no only marks the end of the enumeration. A leading one still
        // means something (no extension under the semantics chosen), so it is never hidden.
        if (this.hideExhaustedNo && solution.result === 'no' && accepted > 0) return;
        const entry = { solution, accepted: solution.result === 'yes' ? accepted + 1 : 0 };
        this.entries = [...this.entries, entry];
        // the newest solution is the one shown
        if (solution.result === 'yes') this.show(entry);
    }

    private show(entry: Entry): void {
        this.shown = entry;
        this.emit('arg2p-solution', { solution: entry.solution, run: this.run });
    }

    private emit(type: string, detail: unknown): void {
        this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
    }

    protected override willUpdate(): void {
        // A plain yes with no bindings only repeats the query: the solutions are worth showing for bindings, failures
        // and errors, and as soon as there is a second solution to pick from
        const yes = this.entries.filter(it => it.solution.result === 'yes');
        this.trivial =
            this.error === null &&
            this.entries.every(it => it.solution.result === 'yes' && it.solution.bindings.length === 0) &&
            yes.length <= 1;
    }

    protected override updated(changed: PropertyValues): void {
        if (changed.has('entries')) this.renderRoot.querySelector('.solution:last-child')?.scrollIntoView?.({ block: 'nearest' });
    }

    protected override render() {
        if (this.error !== null) return this.renderError(this.error);
        if (this.run === null) return nothing;
        return html`
            <div class="head">
                <div class="query">?- ${this.run.query}</div>
                <button type="button" class="next" title="The next solution" ?disabled=${!this.hasNext} @click=${() => this.next()}>Next</button>
            </div>
            <ol class="list">
                ${this.entries.map(entry => this.renderEntry(entry))}
                ${this.busy ? html`<li class="pending" aria-live="polite">Solving…</li>` : nothing}
            </ol>
        `;
    }

    private renderError(error: EngineError) {
        const where = error.syntax;
        const select = () => this.emit('arg2p-error-select', { error });
        return html`
            <ol class="list">
                <li
                    class="solution halt ${where !== null ? 'selectable' : ''}"
                    tabindex=${where !== null ? 0 : -1}
                    title=${where !== null ? 'Go to the error' : ''}
                    @click=${where !== null ? select : null}
                    @keydown=${where !== null ? (e: KeyboardEvent) => activate(e, select) : null}
                >
                    ${header('error', error.name)}
                    <div class="error">${error.message}</div>
                </li>
            </ol>
        `;
    }

    private renderEntry(entry: Entry) {
        const { solution, accepted } = entry;
        if (solution.result === 'no') {
            const any = this.entries.some(it => it.accepted > 0);
            return html`<li class="solution no">${header('no', any ? 'No more solutions' : 'No solutions')}</li>`;
        }
        if (solution.result === 'halt') {
            return html`<li class="solution halt">${header('halt', 'Halted')}<div class="error">${solution.error ?? ''}</div></li>`;
        }
        const pick = () => this.show(entry);
        return html`
            <li
                class="solution yes selectable ${this.shown === entry ? 'shown' : ''}"
                tabindex="0"
                role="button"
                aria-pressed=${this.shown === entry}
                title="Show the graph of this solution"
                @click=${pick}
                @keydown=${(e: KeyboardEvent) => activate(e, pick)}
            >
                ${header('yes', `Solution ${accepted}`)}
                ${solution.bindings.length > 0 ? bindings(solution.bindings) : html`<div class="term">${solution.query}</div>`}
            </li>
        `;
    }

    static override styles = [
        tokens,
        css`
            :host {
                display: block;
                font-size: 14px;
            }
            .head {
                display: flex;
                align-items: baseline;
                gap: 8px;
                padding: 0 2px 8px 2px;
            }
            .query {
                flex: 1;
                font-family: var(--_mono);
                font-size: 13px;
                color: var(--_muted);
                word-break: break-word;
            }
            button {
                font: inherit;
                font-size: 13px;
                color: var(--_text);
                background: var(--_surface);
                border: 1px solid var(--_border);
                border-radius: 4px;
                padding: 2px 10px;
                cursor: pointer;
            }
            button:hover:not(:disabled) {
                background: var(--_hover);
            }
            button:disabled {
                opacity: 0.5;
                cursor: default;
            }
            .list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            .solution {
                border: 1px solid var(--_border);
                border-left: 4px solid var(--_accent);
                border-radius: 6px;
                padding: 8px 10px;
                margin-bottom: 8px;
                background: var(--_surface);
            }
            .selectable {
                cursor: pointer;
            }
            .selectable:hover {
                background: var(--_hover);
            }
            .selectable:focus {
                outline: none;
            }
            .selectable:focus-visible,
            .shown {
                box-shadow: 0 0 0 2px color-mix(in srgb, var(--_accent) 45%, transparent);
            }
            .solution.no {
                border-left-color: var(--_no);
            }
            .solution.halt {
                border-left-color: var(--_error);
            }
            .header {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .badge {
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                color: #ffffff;
                background: var(--_accent);
                border-radius: 4px;
                padding: 1px 6px;
            }
            .no .badge {
                background: var(--_no);
            }
            .halt .badge {
                background: var(--_error);
            }
            .term,
            .error,
            .bindings {
                margin: 8px 0 0 0;
                font-family: var(--_mono);
                font-size: 13px;
                word-break: break-word;
            }
            .error {
                color: var(--_error);
            }
            .bindings {
                display: grid;
                grid-template-columns: max-content 1fr;
                column-gap: 10px;
                row-gap: 6px;
                align-items: baseline;
            }
            dt {
                font-weight: bold;
            }
            dt::after {
                content: ' =';
                color: var(--_muted);
                font-weight: normal;
            }
            dd {
                margin: 0;
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }
            .chip {
                border-radius: 10px;
                padding: 0 8px;
                color: #ffffff;
            }
            .chip.in {
                background: var(--_in);
            }
            .chip.out {
                background: var(--_out);
            }
            .chip.und {
                background: var(--_und);
            }
            .empty,
            .pending {
                color: var(--_muted);
            }
            .pending {
                font-style: italic;
                padding: 4px 2px;
            }
        `,
    ];
}

function header(badge: string, title: string) {
    return html`<div class="header"><span class="badge">${badge}</span><span>${title}</span></div>`;
}

function activate(event: KeyboardEvent, action: () => void): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
}

// `Variable = value` rows. A value of a label variable that is a list shows its items as chips; any other value keeps
// its Prolog form, where a list and its single element would otherwise look the same.
function bindings(list: SolutionData['bindings']) {
    return html`
        <dl class="bindings">
            ${list.map(({ name, value }) => {
                const label = name.toLowerCase();
                const items = LABELS.includes(label) ? listItems(value) : null;
                return html`
                    <dt>${name}</dt>
                    <dd>
                        ${items === null ? value
                        : items.length === 0 ? html`<span class="empty">[ ]</span>`
                        : items.map(item => html`<span class="chip ${label}">${item}</span>`)}
                    </dd>
                `;
            })}
        </dl>
    `;
}

/** The top level elements of a Prolog list term, or null for any other term (a list with a tail, `[a | T]`, too) */
export function listItems(term: string): string[] | null {
    const text = term.trim();
    if (!text.startsWith('[') || !text.endsWith(']')) return null;
    const body = text.slice(1, -1).trim();
    if (body === '') return [];
    const items: string[] = [];
    let depth = 0;
    let quoted = false;
    let current = '';
    for (const char of body) {
        if (char === "'") quoted = !quoted;
        if (!quoted && '([{'.includes(char)) depth++;
        if (!quoted && ')]}'.includes(char)) depth--;
        if (!quoted && depth === 0 && char === '|') return null;
        if (!quoted && depth === 0 && char === ',') {
            items.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    items.push(current.trim());
    return items;
}

customElements.define('arg2p-solutions', Arg2pSolutions);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-solutions': Arg2pSolutions;
    }
}
