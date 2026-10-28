# @tuprolog/arg2p-ui

The user interface of [Arg2P](https://tuprolog.github.io/arg2p-kt/) as web components: the
[playground](https://tuprolog.github.io/arg2p-kt-web/) is made of them, and so is the solver of the extension of VS
Code. They run on an engine that gives plain data: the solver of the browser (`@tuprolog/arg2p-ui/js`, in a worker),
or the language server of Arg2P on the JVM.

```sh
npm install @tuprolog/arg2p-ui @tuprolog/arg2p
```

```html
<arg2p-editor id="theory" kind="theory"></arg2p-editor>
<arg2p-editor id="query" kind="query"></arg2p-editor>
<arg2p-solutions></arg2p-solutions>
<arg2p-graph></arg2p-graph>

<script type="module">
    import '@tuprolog/arg2p-ui';
    import { JsEngine } from '@tuprolog/arg2p-ui/js';

    const engine = new JsEngine();
    const [theory, query] = ['#theory', '#query'].map(it => document.querySelector(it));
    theory.engine = query.engine = engine;
    const solutions = document.querySelector('arg2p-solutions');
    const graph = document.querySelector('arg2p-graph');
    solutions.addEventListener('arg2p-solution', e => graph.showSolution(e.detail.solution, e.detail.run));
    query.addEventListener('arg2p-submit', async () => {
        const run = await engine.solve({ theory: theory.value, query: query.value, flags: 'queryMode.' });
        solutions.start(run);
    });
</script>
```

## Components

| Element | |
| --- | --- |
| `<arg2p-editor>` | A theory, a query or flags (CodeMirror), its syntax errors shown as it is typed |
| `<arg2p-solutions>` | The solutions of a query, asked for one at a time |
| `<arg2p-graph>` | The argument graph of a solution: its stages, the popup of each argument, its picture |
| `<arg2p-framework>` | An abstract framework drawn: drawing writes its theory, its theory edited is drawn again |
| `<arg2p-flags>` | The flags, the profile first, each with its value in effect and where it comes from |

`@tuprolog/arg2p-ui/data` has what they are built on with no DOM: the contract of engines, the flags and profiles, the
formats of abstract frameworks (APX, TGF, ICCMA'23), the layout of graphs.

The components take their colours from custom properties (`--arg2p-surface`, `--arg2p-text`, `--arg2p-accent`, ...),
with a light theme otherwise.
