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
| `engines.ts` | The engines of the documents: each solves on a Web Worker of its own, so that its results (its solutions, Next, the stages) are there when it is shown again; the workers of the documents used last are kept (6, 3 on phones), and a run whose worker was let go is solved again, past the solutions given, when asked for more |
| `tabs.ts`, `layout.ts`, `share.ts`, `menus.ts` | The tabs of the documents, the dividers and the widths they keep, the dialog of a shared link, the menus |
| `links.ts`, `router.ts` | The links that share a theory, its query and its flags; the links the page is opened with, in the page or in the installed app: a shared one opens in a tab, one of a pairing in the *Federation* tab |
| `federation/` | Parallel runs, and the federation with the playgrounds of other devices |
| `formalize/` | A text in natural language, formalized by a language model as a theory, its statements linked to the passages they come from |

## The federation

| | |
| --- | --- |
| `federation.ts` | The federation of the page: its cluster, started once asked for, its pairing, and what it is |
| `cluster.ts` | The cluster, a `WebWorkerCluster` of `@tuprolog/arg2p` on Web Workers (`worker.ts`): loaded with the solver, apart from the page. It solves any goal, on the flags of the run, and tells what its federation is |
| `engine.ts` | `ClusterEngine`, the engine of the parallel runs (the `Engine` of the ui) on the cluster |
| `pairing.ts`, `relay.ts` | The pairing: an invitation as one QR code, its reply sealed (AES-GCM) through a ntfy relay (an https address) with a short code, or as a link. An invitation lasts 10 minutes, reads the relay while its page is shown, and pairs with no code two different replies came with |
| `links.ts` | The links of a pairing (`#join=`, `#reply=`), and the codes they carry |
| `panel.ts`, `qr.ts` | The *Federation* tab, a tab of the solver, and its QR codes, drawn and scanned |

## The formalization

The *Text* button of the theory shows the text the theory formalizes, above it. *Formalize* has a language model of
[OpenRouter](https://openrouter.ai) write it as a structured theory or an abstract framework, as picked, following the
method of Arg2P: the skill `arg2p-formalize` of [arg2p-kt](https://github.com/tuProlog/arg2p-kt), downloaded from
GitHub at the release of the `@tuprolog/arg2p` the page solves with (or else its latest version) and kept in the
browser. The theory the model writes is checked by the engine of the page (its profile is the one picked, its theory
parses), and sent back to it, to fix, when it is not: three answers at most. The theory goes in its document
when it has none yet, else in a new one, and is solved with `arg2p::solve(In, Out, Und)`.

Each user gives their own OpenRouter key: kept in this browser alone (`localStorage`, under `arg2p.formalize`), it is
sent to OpenRouter alone, by the page itself; the requests are charged to it. The model is `anthropic/claude-haiku-5.5` by
default (`openai/gpt-oss-120b` and `openai/gpt-oss-20b` are offered too, cheaper and weaker), and any other that
answers in a JSON schema can be set. Its providers are taken by their throughput, the fastest first, among those that
hold to the schema.

The model quotes, for each statement, the passages of the text it comes from: the passages are found again in the
text as it is edited, and the statements in the theory by their names. A statement and its passages share a colour;
the one picked (by the cursor, in the text or in the theory, or tapping one of its arguments) stands out in both, and
its arguments are outlined in the graph; hovering one does the same while hovered, and the popup of an
argument quotes the passages of its statement. While the text is empty, sample texts are offered.

| | |
| --- | --- |
| `skill.ts` | The skill, downloaded and kept |
| `openrouter.ts`, `settings.ts`, `dialog.ts` | The requests to OpenRouter, for an answer in a JSON schema; the key, the model and its effort, and their dialog |
| `prompt.ts` | What the model is asked, the schema of its answer, and how it is asked to fix one |
| `formalizer.ts` | The formalization: asked, checked, fixed |
| `anchors.ts`, `marks.ts` | The passages quoted, found in the text; the statements of a theory; the marks of both in the editors |
| `samples.ts` | The texts offered to try |
| `panel.ts` | `<arg2p-text>`, the text, its *Formalize* button and what the formalization says besides the theory (its glossary, the readings chosen, its notes, its model and what it cost) |

A shared link carries the text and the formalization too (version 3 of the format of `links.ts`).

## Updates

The service worker precaches the build, so that the playground is installable and works offline. A new version waits
for the page: the page offers to load it, in a banner of its own, and warns while a run or a federation goes on, which
loading would end. A page left open looks for a new version every hour.
