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
  npm start -w @tuprolog/arg2p-playground
  npm run dev -w @tuprolog/arg2p-ui
```

- Run the tests of every package

```bash
  npm test
```

- Build every package (the playground in `packages/playground/dist`)

```bash
  npm run build
```

- Deploy the playground to GitHub Pages

```bash
  npm run deploy -w @tuprolog/arg2p-playground
```

## Theories and profiles

A theory is read in a **profile** (see [Profiles](https://tuprolog.github.io/arg2p-kt/docs/profiles/)):
ASPIC<sup>+</sup> by default, or the one it states, as `graphBuildMode(aba).`, or the one picked
in the *Flags* tab, which shows the flags the profile presets and where each value comes from.

An abstract framework is a theory of the profile `abstract`: `a.` an argument, `a -> b.` an
attack, `a <-> b.` a mutual one, and Prolog clauses may derive them
(`X -> Y :- beats(X, Y).`). Its arguments and attacks can also be **drawn**: the *Drawing* view
writes what is drawn into the theory, draws the theory as it is edited, colours the arguments
with the labelling of the solution shown, and draws dashed what the theory derives. Frameworks
in the formats of ICCMA (APX, TGF, ICCMA'23) are imported as theories, and exported.

## Sharing a setup

*Share* builds a link to the theory, query and flags shown: it packs them in a single compressed
`s` parameter, and the link opens them in a tab of their own, and runs them. Links can also be
written by hand with the plain parameters below.

| Parameter | Meaning |
| --- | --- |
| `theory` | The theory |
| `query` | The query |
| `flags` | The flags, as Prolog facts |
| `arguments` | The arguments of an abstract framework, e.g. `a,b,c` |
| `attacks` | Its attacks as `attacker-attacked`, e.g. `a-b,b-c` |

Every value is percent-encoded. A framework given by `arguments` and `attacks` becomes a theory of
the profile `abstract`; arguments mentioned only in `attacks` are added, so
`?attacks=a-b,b-a` is enough to describe a two argument framework. The links of the former
playground (its abstract mode, and the flags of `standard_af`) keep working.

```
?arguments=a,b,c&attacks=a-b,b-a,b-c&flags=argumentLabellingMode(preferred).
```
