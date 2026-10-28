# @tuprolog/arg2p-playground

The web playground of Arg2P, published at <https://tuprolog.github.io/arg2p-kt-web/>: what it does is told in the
[README of the repository](../../README.md). It is built with the components of
[`@tuprolog/arg2p-ui`](../ui): the theory is edited in an `<arg2p-editor>`, and solved in an `<arg2p-solver>`.

```sh
npm start -w @tuprolog/arg2p-playground   # the dev server
npm test -w @tuprolog/arg2p-playground    # the tests (build the ui first: npm run build -w @tuprolog/arg2p-ui)
npm run build -w @tuprolog/arg2p-playground
```

## Its parts

| | |
| --- | --- |
| `app.ts` | The page: the bar on top, the tabs of the documents, the theory, and its solver |
| `documents.ts`, `session.ts` | The documents worked on, kept in the browser (`localStorage`, under `arg2p.workspace.2`; `arg2p.workspace`, of version 1, is only read once), in step with the other pages open |
| `tabs.ts`, `layout.ts`, `share.ts`, `menus.ts` | The tabs of the documents, the dividers and the widths they keep, the dialog of a shared link, the menus |
| `links.ts` | The links that share a theory, its query and its flags |
| `federation/` | Parallel runs, and the federation with the playgrounds of other devices |

## The federation

| | |
| --- | --- |
| `federation.ts` | The federation of the page: its cluster, started once asked for, its pairing, and what it is |
| `cluster.ts` | The cluster, a `WebWorkerCluster` of `@tuprolog/arg2p` on Web Workers (`worker.ts`): loaded with the solver, apart from the page |
| `engine.ts` | `ClusterEngine`, the engine of the parallel runs (the `Engine` of the ui) on the cluster |
| `pairing.ts`, `relay.ts` | The pairing: an invitation as one QR code, its reply sealed (AES-GCM) through a ntfy relay with a short code, or as a link |
| `links.ts` | The links of a pairing (`#join=`, `#reply=`), followed as they are opened, in the page or in the installed app |
| `panel.ts`, `qr.ts` | The *Federation* tab, a tab of the solver, and its QR codes, drawn and scanned |

## Updates

The service worker precaches the build, so that the playground is installable and works offline. A new version waits
for the page: the page offers to load it, and warns while a run or a federation goes on, which loading would end.
