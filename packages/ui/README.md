# @tuprolog/arg2p-ui

The user interface of [Arg2P](https://tuprolog.github.io/arg2p-kt/) as web components: the
[playground](https://tuprolog.github.io/arg2p-kt-web/) is made of them, and so are the solver of the extension of VS
Code and the MCP App of Arg2P. They run on an engine that gives plain data: the solver of the browser
(`@tuprolog/arg2p-ui/js`, in a worker), or the language server of Arg2P on the JVM.

```sh
npm install @tuprolog/arg2p-ui @tuprolog/arg2p
```

## A solver: `<arg2p-solver>`

The way to embed a solver: the query with Run and Stop, and in tabs the solutions with the graph of the one shown (for
an abstract framework, its drawing, which edits the theory), the flags, and what the solver prints. The page gives it
an engine, the theory, the query and the flags, and a height (that of a webview, of an iframe, of a column).

```html
<arg2p-solver theory-tab style="height: 100vh"></arg2p-solver>

<script type="module">
    import '@tuprolog/arg2p-ui/solver';
    import { JsEngine } from '@tuprolog/arg2p-ui/js';

    const solver = document.querySelector('arg2p-solver');
    solver.engine = new JsEngine();
    solver.theory = 'f1 :=> bird(tweety).\nr1 : bird(X) => flies(X).\nf2 :=> -flies(tweety).';
    solver.query = 'buildLabelSets(In, Out, Und)';
    solver.flags = 'argumentLabellingMode(grounded).\nqueryMode.';
    solver.addEventListener('arg2p-theory-change', e => console.log('theory', e.detail.theory));
    solver.run();
</script>
```

| Property | Attribute | |
| --- | --- | --- |
| `engine: Engine \| null` | | What solves, and checks the texts |
| `theory: string` | `theory` | The theory |
| `query: string` | `query` | The query |
| `flags: string` | `flags` | The flags, as Prolog facts |
| `fileName: string` | `file-name` | The name the pictures of the graph and the drawing are saved as (`theory`) |
| `theoryTab: boolean` | `theory-tab` | The theory edited in a tab of its own, for a page without an editor of its own |
| `tab: string` | `tab` | The tab shown: `results` (the default), `flags`, `console`, `theory`, or the `id` of a tab of the page |
| `busy: boolean` (read only) | `busy` (set by the solver) | A run is being started, or a solution computed |

| Method | |
| --- | --- |
| `run(): Promise<void>` | Solves the query: the results before are let go, and a run under way stopped |
| `stop()` | Stops the run under way: what it was computing fails, as stopped |
| `clear()` | Forgets the results, and where the arguments were drawn (another theory is shown), stopping a run under way |
| `reveal(error: EngineError)` | Takes to where the error does not parse: the query, the flags, the theory in its tab, or else tells the page |
| `fit()` | Fits the graph and the drawing to their room (after the page resized it) |
| `restyle()` | Draws the graph and the drawing again in the colours the page sets now (after a change of theme) |

| Event | `detail` | |
| --- | --- | --- |
| `arg2p-query-change` | `{ query }` | The query edited |
| `arg2p-flags-change` | `{ flags }` | The flags edited, with the controls or as text |
| `arg2p-theory-change` | `{ theory }` | The theory edited, by drawing or in its tab |
| `arg2p-run` | `{ theory, query, flags }` | A run starts |
| `arg2p-busy` | `{ busy }` | The solver is busy, or no longer |
| `arg2p-tab-change` | `{ tab }` | Another tab shown: picked, or the solutions of a run, or where an error is |
| `arg2p-error` | `{ error: EngineError }` | A run could not start, or a solution could not be computed (`error.stopped` when stopped) |
| `arg2p-theory-error` | `{ problem: SyntaxProblem }` | Where the theory does not parse, without a Theory tab: the page has the theory |
| `arg2p-solution` | `{ solution, run }` | A solution shown (`Solved`), from the solutions inside |
| `arg2p-positions`, `arg2p-toggle`, `arg2p-export` | | From the graph and the drawing inside (see below) |

| Slot | |
| --- | --- |
| `actions` | At the end of the bar of the tabs: the actions of the page (a link, full screen, ...) |
| `split` | Between the solutions and the graph: a handle that resizes them, setting `--arg2p-solutions-width` |
| `tab` | The tabs of the page, after those of the solver: each element is one, named by its `id` and reading its `label` attribute, shown alone when picked |

A page adds tabs of its own with elements in the slot `tab`; the solver follows them as they come, go and change
their `label`:

```html
<arg2p-solver tab="notes">
    <section slot="tab" id="notes" label="Notes">What the page shows in a tab of its own</section>
</arg2p-solver>
```

| CSS | |
| --- | --- |
| `--arg2p-solutions-width` | The width of the solutions beside the graph (`30%`) |
| `::part(query)`, `::part(tabs)`, `::part(notice)`, `::part(results)`, `::part(view)` | The query, the bar of the tabs, what a failure tells, the solutions with the graph, the graph |

Narrower than 600 pixels, the graph goes under the solutions.

## Engines

An engine (`Engine`, in `@tuprolog/arg2p-ui/data`) solves, checks texts, tells the flags in effect, and stops; it
gives plain data, as it crosses a worker or a process.

`JsEngine` (`@tuprolog/arg2p-ui/js`) is the solver of @tuprolog/arg2p in a worker of its own, so that the page stays
responsive while it works: `start()` starts the worker, and its warm-up, ahead of the first evaluation (the first one
is much slower than the next ones); `stop()` ends the worker, the only way to interrupt an evaluation, and starts a
fresh one (nothing is ended when nothing is being evaluated). A query has no more solutions once its worker is ended,
or once another query is solved.

The worker is a `Channel`: a constructor argument gives another one that answers its messages (see `Request` and
`Answer`), a bridge to a language server say, as the extension of VS Code does.

```ts
import { JsEngine, type Channel } from '@tuprolog/arg2p-ui/js';

const engine = new JsEngine((): Channel => {
    const channel: Channel = {
        onmessage: null,
        postMessage: request => server.send(request),
        terminate: () => server.restart(),
    };
    server.onAnswer = answer => channel.onmessage?.({ data: answer });
    return channel;
});
```

## Components

The solver is made of components that can be used apart:

| Element | |
| --- | --- |
| `<arg2p-editor>` | A theory, a query or flags (CodeMirror), its syntax errors shown as it is typed |
| `<arg2p-solutions>` | The solutions of a query, asked for one at a time |
| `<arg2p-graph>` | The argument graph of a solution: its stages, the popup of each argument, its picture |
| `<arg2p-framework>` | An abstract framework drawn: drawing writes its theory, its theory edited is drawn again |
| `<arg2p-flags>` | The flags, the profile first, each with its value in effect and where it comes from |

### `<arg2p-editor>`

| | |
| --- | --- |
| Properties | `value`, `kind` (`theory`, `query`, `flags`), `engine` (checks the text), `label` (its name, for the messages and readers of the screen), `placeholder`, `readonly` |
| Methods | `report(problem)` shows a problem found by running and goes there; `reveal(line, column)`; `focus()` |
| Events | `arg2p-change` `{ value }` as it is typed; `arg2p-submit` `{ value }` on Enter in a query |

### `<arg2p-solutions>`

| | |
| --- | --- |
| Properties | `hideExhaustedNo` (`hide-exhausted-no`); read only: `busy`, `trivial` (attributes too), `hasNext` |
| Methods | `start(run)`, `next()`, `fail(error)`, `clear()` |
| Events | `arg2p-solution` `{ solution, run }`; `arg2p-busy` `{ busy }`; `arg2p-failure` `{ error }`; `arg2p-error-select` `{ error }` when the error shown is picked |

### `<arg2p-graph>`

| | |
| --- | --- |
| Properties | `solution` (a `Solved`: the solution and its run, to browse its stages; null for none), `positions`, `showSupports` (`show-supports`), `showConclusions` (`show-conclusions`), `fileName` (`file-name`); read only: `empty` (attribute too: nothing to show) |
| Methods | `png()`, `fit()`, `restyle()` |
| Events | `arg2p-toggle` `{ showSupports, showConclusions }`; `arg2p-positions` `{ positions }`; `arg2p-export` `{ fileName, dataUrl }`, cancelable to save the picture another way |

### `<arg2p-framework>`

| | |
| --- | --- |
| Properties | `theory`, `graph` (of a solution of the theory: its labels, and what it derives), `positions`, `readonly`, `fileName` (`file-name`) |
| Methods | `png()`, `fit()`, `restyle()` |
| Events | `arg2p-theory-change` `{ theory }` after a change made by drawing; `arg2p-positions` `{ positions }`; `arg2p-export` |

### `<arg2p-flags>`

| | |
| --- | --- |
| Properties | `flags`, `theory`, `engine` (tells the settings in effect) |
| Events | `arg2p-flags-change` `{ flags }` |

### Where the arguments are

The graph of an abstract framework and its drawing are two ways of working on the same framework: each tells where its
arguments are (`arg2p-positions`) as they are laid out or dragged, and places them where it is given (`positions`).
A page that shows both passes on what one tells to the other (the solver does it by itself):

```js
const share = e => (graph.positions = framework.positions = e.detail.positions);
graph.addEventListener('arg2p-positions', share);
framework.addEventListener('arg2p-positions', share);
```

## Imports

| | |
| --- | --- |
| `@tuprolog/arg2p-ui` | Every component, and what they are built on |
| `@tuprolog/arg2p-ui/solver`, `/graph`, `/framework`, `/solutions`, `/editor`, `/flags` | One component alone (the solver with those it is made of) |
| `@tuprolog/arg2p-ui/solver.bundle` | The solver in one file, its dependencies within: for a page with no bundler, loading it from a CDN as it is (`https://cdn.jsdelivr.net/npm/@tuprolog/arg2p-ui@<version>/dist/bundle/solver.js`) |
| `@tuprolog/arg2p-ui/data` | What the components are built on, with no DOM: the contract of engines, the flags and profiles, the formats of abstract frameworks (APX, TGF, ICCMA'23), the layout of graphs |
| `@tuprolog/arg2p-ui/js` | The engine of the browser: it brings the solver with it; and `graphData`, a graph of @tuprolog/arg2p (of a cluster of its parallel solver, say) as the components read it |

A component is defined once: a page with two copies of the package keeps the first.

## Theming

The components take their colours and fonts from custom properties a page sets (they cross into the components), with
a light theme otherwise:

| Property | |
| --- | --- |
| `--arg2p-surface`, `--arg2p-surface-2` | The background of the components, and of their bars |
| `--arg2p-hover`, `--arg2p-border` | What is hovered, and the borders |
| `--arg2p-text`, `--arg2p-muted` | The text, and what is said aside |
| `--arg2p-accent`, `--arg2p-error`, `--arg2p-no` | What stands out: the active, the errors, the solutions that are no |
| `--arg2p-in`, `--arg2p-out`, `--arg2p-und`, `--arg2p-unlabelled` | The labels of the arguments (the same in every theme: they carry meaning) |
| `--arg2p-support` | The supports between arguments |
| `--arg2p-atom`, `--arg2p-functor`, `--arg2p-variable`, `--arg2p-comment` | The highlighting of the editors |
| `--arg2p-font`, `--arg2p-mono` | The fonts, of the text and of the code |

A dark theme, say:

```css
:root[data-theme='dark'] {
    --arg2p-surface: #1f2125;
    --arg2p-border: #383c43;
    --arg2p-text: #e3e5e8;
    --arg2p-muted: #9aa0a8;
    --arg2p-accent: #3fb0ac;
}
```

The graph and the drawing draw on a canvas: after the page changes theme, `restyle()` (on `<arg2p-solver>`, or on
`<arg2p-graph>` and `<arg2p-framework>`) draws them in the new colours.
