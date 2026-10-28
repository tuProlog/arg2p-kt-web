<p align="center"><img src="packages/playground/assets/pwa/icon.svg" width="200" alt="A2P logo"></p>

# [Arg2P-Kt](https://github.com/tuProlog/arg2p-kt) Web Playground

Try it at <https://tuprolog.github.io/arg2p-kt-web/>. The playground can be
installed as an app (*Install app* in Chrome and Edge, *Add to Home Screen* on
iOS) and then works offline.

## Packages

- [`packages/ui`](packages/ui): `@tuprolog/arg2p-ui`, the user interface of
  Arg2P as web components (the argument graph, the solutions, the drawing of
  abstract frameworks), on any engine: the solver of the browser
  (`@tuprolog/arg2p-ui/js`), or one of the JVM.
- [`packages/playground`](packages/playground): the playground, the page
  published on GitHub Pages.

## Install
```bash
  npm install
```

## Usage

- Start the dev server of the playground, or the page the components are tried on

```bash
  npm start -w packages/playground
  npm run dev -w packages/ui
```

- Run the tests of every package

```bash
  npm test
```

- Build every package (the playground in `packages/playground/prodDist`)

```bash
  npm run build
```

- Deploy the playground to GitHub Pages

```bash
  npm run deploy -w packages/playground
```

## Modes

The playground runs in one of two modes, selected from the toolbar:

- **Structured** — write an ASPIC<sup>+</sup> theory and run any query against it.
- **Abstract** — draw an abstract argumentation framework and evaluate it, the way
  ConArg does. Use the toolbar on the canvas to add arguments and attacks; the
  query is generated for you as `abstract::solve(Arguments, Attacks, In, Out, Und)`
  and the drawn graph is recoloured with the labelling of the solution currently
  shown. The semantics comes from the `argumentLabellingMode` flag, which the
  *Semantics* selector next to the query keeps in sync.

## Sharing a setup

The playground restores its state from the query string, so an example can be
handed over as a plain link. *Share* in the toolbar builds one from whatever is
currently loaded: it packs the whole state in a single compressed `s`
parameter. Links can also be written by hand with the plain parameters below,
which keep working.

| Parameter | Mode | Meaning |
| --- | --- | --- |
| `mode` | both | `structured` (default) or `abstract` |
| `flags` | both | Content of the *Flags* tab |
| `theory` | structured | Content of the *Theory* editor |
| `query` | structured | Content of the *Query* editor |
| `arguments` | abstract | Argument names, e.g. `a,b,c` |
| `attacks` | abstract | Attacks as `attacker-attacked`, e.g. `a-b,b-c` |

Every value is percent-encoded. Argument names have to be Prolog atoms; invalid
ones are dropped and reported. Arguments mentioned only in `attacks` are added to
the graph, so `?mode=abstract&attacks=a-b,b-a` is enough to describe a two
argument framework.

```
?mode=abstract&arguments=a,b,c&attacks=a-b,b-a,b-c&flags=argumentLabellingMode(preferred).
```
