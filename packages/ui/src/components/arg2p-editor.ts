import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { linter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState, Prec, type Extension, type Text } from '@codemirror/state';
import { EditorView, drawSelection, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { arg2p } from '../editor/language.js';
import { keepView, rangeOf } from '../editor/view.js';
import type { Engine, SyntaxProblem } from '../engine.js';
import { emit } from '../events.js';
import { tokens } from '../theme.js';
import { activate, define } from './shared.js';

// How long the typing is let be before the text is checked
const CHECK_DELAY = 500;

export type EditorKind = 'theory' | 'query' | 'flags';

/**
 * An editor of a theory, a query or flags, in the language of arg2p. The engine checks the text once the typing
 * settles: a syntax error is underlined (its message shows when hovering it), and written under the editor, which
 * takes to it when tapped (touch screens have no hover). A query is one line: Enter submits it.
 *
 * Events: `arg2p-change` with the text, as it is typed; `arg2p-submit` when Enter is pressed in a query.
 */
export class Arg2pEditor extends LitElement {
    static override properties = {
        value: {},
        kind: { reflect: true },
        engine: { attribute: false },
        label: {},
        placeholder: {},
        readonly: { type: Boolean, reflect: true },
        problem: { state: true },
    };

    /** The text */
    value = '';
    kind: EditorKind = 'theory';
    /** What checks the text; without it, the text is not checked */
    engine: Pick<Engine, 'check'> | null = null;
    /** What the text is called, by the messages and by readers of the screen (the theory, the flags, ...) */
    label = '';
    placeholder = '';
    readonly = false;

    // the syntax error shown, if any, and how many were reported (a check started before one does not hide it)
    private problem: SyntaxProblem | null = null;
    private reports = 0;
    private view: EditorView | null = null;
    // what follows the properties: the kind of text, its name, whether it is edited, its placeholder, its check
    private readonly shape = new Compartment();
    private readonly named = new Compartment();
    private readonly editable = new Compartment();
    private readonly hint = new Compartment();
    private readonly checking = new Compartment();

    /** Shows [problem] (found by running, say) at once, and takes the editor to it */
    report(problem: SyntaxProblem): void {
        const view = this.view;
        if (view === null) return;
        this.reports++;
        view.dispatch(setDiagnostics(view.state, [this.diagnostic(view.state.doc, problem)]));
        this.problem = problem;
        this.reveal(problem.line, problem.column);
    }

    /** Takes the editor to [line] and [column] (from 1), focused */
    reveal(line: number, column: number): void {
        const view = this.view;
        if (view === null) return;
        const { from } = rangeOf(view.state.doc, { line, column, length: 0 });
        view.dispatch({ selection: { anchor: from }, effects: EditorView.scrollIntoView(from, { y: 'center' }) });
        view.focus();
    }

    override focus(): void {
        this.view?.focus();
    }

    protected override firstUpdated(): void {
        this.view = new EditorView({
            root: this.renderRoot as ShadowRoot,
            parent: this.renderRoot.querySelector<HTMLElement>('.editor')!,
            state: EditorState.create({ doc: this.value, extensions: this.extensions() }),
        });
        keepView(this, this.view);
    }

    protected override updated(changed: PropertyValues): void {
        const view = this.view;
        if (view === null) return;
        if (changed.has('value') && this.value !== view.state.doc.toString()) {
            view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: this.value } });
        }
        const effects = [
            changed.has('kind') ? this.shape.reconfigure(this.shaped()) : null,
            changed.has('label') || changed.has('kind') ? this.named.reconfigure(this.name()) : null,
            changed.has('readonly') ? this.editable.reconfigure(EditorState.readOnly.of(this.readonly)) : null,
            changed.has('placeholder') ? this.hint.reconfigure(placeholder(this.placeholder)) : null,
            changed.has('engine') || changed.has('kind') ? this.checking.reconfigure(this.check()) : null,
        ].filter(it => it !== null);
        if (effects.length > 0) view.dispatch({ effects });
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.view?.destroy();
        this.view = null;
        keepView(this, null);
    }

    override connectedCallback(): void {
        super.connectedCallback();
        if (this.hasUpdated && this.view === null) this.firstUpdated();
    }

    private extensions(): Extension[] {
        return [
            arg2p(),
            history(),
            drawSelection(),
            bracketMatching(),
            highlightSelectionMatches(),
            this.shape.of(this.shaped()),
            keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
            this.named.of(this.name()),
            this.editable.of(EditorState.readOnly.of(this.readonly)),
            this.hint.of(placeholder(this.placeholder)),
            this.checking.of(this.check()),
            EditorView.updateListener.of(update => {
                if (!update.docChanged) return;
                const value = update.state.doc.toString();
                if (value === this.value) return;
                this.value = value;
                emit(this, 'arg2p-change', { value });
            }),
            EditorView.theme({
                '&': { height: '100%', backgroundColor: 'var(--_surface)', color: 'var(--_text)' },
                '&.cm-focused': { outline: 'none' },
                '.cm-scroller': { fontFamily: 'var(--_mono)', lineHeight: '1.5' },
                // the text as typed: no ligature turns => into an arrow
                '.cm-content': { caretColor: 'var(--_text)', fontVariantLigatures: 'none' },
                '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--_text)' },
                '.cm-gutters': { backgroundColor: 'var(--_surface-2)', color: 'var(--_muted)', border: 'none' },
                '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
                    backgroundColor: 'color-mix(in srgb, var(--_accent) 25%, transparent) !important',
                },
                '.cm-placeholder': { color: 'var(--_muted)' },
                '.cm-tooltip': { backgroundColor: 'var(--_surface)', color: 'var(--_text)', border: '1px solid var(--_border)' },
            }),
        ];
    }

    // A query is one line: Enter submits it, and a text pasted in is joined on one line; the others have lines
    private shaped(): Extension {
        if (this.kind !== 'query') return [lineNumbers(), EditorView.lineWrapping];
        return [
            Prec.highest(keymap.of([{ key: 'Enter', run: () => (emit(this, 'arg2p-submit', { value: this.value }), true) }])),
            EditorState.transactionFilter.of(tr => (tr.newDoc.lines > 1 ? [tr, { changes: { from: 0, to: tr.newDoc.length, insert: tr.newDoc.toString().replace(/\s*\n\s*/g, ' ') }, sequential: true }] : tr)),
        ];
    }

    // The name readers of the screen give the text
    private name(): Extension {
        return EditorView.contentAttributes.of({ 'aria-label': this.label || this.kind });
    }

    // The check of the text by the engine, once the typing settles: the problem it finds is shown under the editor too,
    // unless the text changed meanwhile, or a problem was reported meanwhile (by running: it stays until the text
    // changes)
    private check(): Extension {
        const engine = this.engine;
        if (engine === null) return [];
        const kind = this.kind === 'query' ? 'query' : 'theory';
        return linter(
            async view => {
                const doc = view.state.doc;
                const reports = this.reports;
                let problem: SyntaxProblem | null = null;
                try {
                    problem = await engine.check(doc.toString(), kind);
                } catch {
                    // an engine that cannot check now (stopped, say) finds nothing
                }
                if (view.state.doc !== doc || this.reports !== reports) problem = this.problem;
                else this.problem = problem;
                return problem === null ? [] : [this.diagnostic(view.state.doc, problem)];
            },
            { delay: CHECK_DELAY },
        );
    }

    private diagnostic(doc: Text, problem: SyntaxProblem): Diagnostic {
        return { ...rangeOf(doc, problem), severity: 'error', message: problem.message, source: 'arg2p' };
    }

    protected override render() {
        const problem = this.problem;
        const reveal = () => problem !== null && this.reveal(problem.line, problem.column);
        return html`
            <div class="editor"></div>
            ${problem === null
                ? nothing
                : html`
                      <div class="problem" role="button" tabindex="0" title="Go to the error" @click=${reveal} @keydown=${(e: KeyboardEvent) => activate(e, reveal)}>
                          <span class="place">${this.label ? `${this.label}, ` : ''}line ${problem.line}, col ${problem.column}</span>
                          <span>${problem.message}</span>
                      </div>
                  `}
        `;
    }

    static override styles = [
        tokens,
        css`
            :host {
                display: flex;
                flex-direction: column;
                min-height: 0;
                border: 1px solid var(--_border);
                border-radius: 4px;
                overflow: hidden;
                background: var(--_surface);
            }
            :host([kind='query']) {
                flex: none;
            }
            .editor {
                flex: 1;
                min-height: 0;
                font-size: 14px;
            }
            .problem {
                display: flex;
                gap: 8px;
                padding: 4px 8px;
                font-size: 12px;
                color: var(--_error);
                background: color-mix(in srgb, var(--_error) 8%, transparent);
                border-top: 1px solid color-mix(in srgb, var(--_error) 30%, transparent);
                cursor: pointer;
            }
            .place {
                font-weight: 600;
                white-space: nowrap;
            }
        `,
    ];
}

define('arg2p-editor', Arg2pEditor);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-editor': Arg2pEditor;
    }
}
