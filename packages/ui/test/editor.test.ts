// @vitest-environment happy-dom
import { forceLinting } from '@codemirror/lint';
import { Text } from '@codemirror/state';
import { runScopeHandlers } from '@codemirror/view';
import { afterEach, assert, describe, it } from 'vitest';
import '../src/index.js';
import { rangeOf, type Arg2pEditor } from '../src/components/arg2p-editor.js';
import type { SyntaxProblem } from '../src/engine.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

async function editor(kind: 'theory' | 'query', value: string, problem: SyntaxProblem | null = null) {
    const element = document.createElement('arg2p-editor') as Arg2pEditor;
    const checked: string[] = [];
    element.kind = kind;
    element.value = value;
    element.label = 'Theory';
    element.engine = {
        check: text => {
            checked.push(text);
            return Promise.resolve(problem);
        },
    };
    document.body.appendChild(element);
    await element.updateComplete;
    const events: { type: string; value: string }[] = [];
    for (const type of ['arg2p-change', 'arg2p-submit']) {
        element.addEventListener(type, event => events.push({ type, value: (event as CustomEvent).detail.value }));
    }
    return { element, view: element.editor!, checked, events };
}

const settled = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

afterEach(() => {
    document.body.replaceChildren();
});

describe('<arg2p-editor>', function () {
    it('should edit its value, and tell the changes typed', async function () {
        const { element, view, events } = await editor('theory', 'a :=> b.');
        equal(view.state.doc.toString(), 'a :=> b.');
        view.dispatch({ changes: { from: view.state.doc.length, insert: '\nc :=> d.' } });
        deepEqual(events, [{ type: 'arg2p-change', value: 'a :=> b.\nc :=> d.' }]);
        equal(element.value, 'a :=> b.\nc :=> d.');
        // a value set from outside is shown, and not told back
        element.value = 'e :=> f.';
        await element.updateComplete;
        equal(view.state.doc.toString(), 'e :=> f.');
        equal(events.length, 1);
    });

    it('should keep a query on one line, and submit it with Enter', async function () {
        const { view, events } = await editor('query', 'flies(X)');
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: 'buildLabelSets(\n  In, Out,\n  Und)' } });
        equal(view.state.doc.toString(), 'buildLabelSets( In, Out, Und)');
        runScopeHandlers(view, new KeyboardEvent('keydown', { key: 'Enter' }), 'editor');
        deepEqual(events.at(-1), { type: 'arg2p-submit', value: 'buildLabelSets( In, Out, Und)' });
    });

    it('should show where the text does not parse, as the engine tells', async function () {
        const problem = { line: 2, column: 7, length: 1, message: "Unexpected token '('" };
        const { element, view, checked } = await editor('theory', 'a :=> b.\nc :=> d(.', problem);
        forceLinting(view);
        await settled();
        await element.updateComplete;
        deepEqual(checked, ['a :=> b.\nc :=> d(.']);
        const strip = element.shadowRoot!.querySelector('.problem')!;
        ok(strip.textContent!.includes('Theory, line 2, col 7'));
        ok(strip.textContent!.includes("Unexpected token '('"));
        // tapped, it takes the editor there
        (strip as HTMLElement).click();
        equal(view.state.selection.main.head, 'a :=> b.\n'.length + 6);
    });

    it('should report a problem found by running at once', async function () {
        const { element, view } = await editor('theory', 'a :=> b');
        element.report({ line: 1, column: 8, length: 1, message: 'Unexpected end of file' });
        await element.updateComplete;
        ok(element.shadowRoot!.querySelector('.problem')!.textContent!.includes('Unexpected end of file'));
        equal(view.state.selection.main.head, 7);
    });

    it('should place a problem within the text', function () {
        const doc = Text.of(['a :=> b.', 'cd']);
        deepEqual(rangeOf(doc, { line: 2, column: 2, length: 5 }), { from: 10, to: 11 });
        deepEqual(rangeOf(doc, { line: 9, column: 9, length: 1 }), { from: 11, to: 11 });
    });
});
