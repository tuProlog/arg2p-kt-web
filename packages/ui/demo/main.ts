import '../src/index.js';
import { DEFAULT_FLAGS } from '../src/flags/schema.js';
import { JsEngine } from '../src/js/index.js';
import type { EngineError, Run, SolutionData } from '../src/engine.js';

// A page to try the components on while they are written (npm run dev): not published

const EXAMPLES: Record<string, string> = {
    tweety: '% Tweety, the bird that does not fly\nf1 :=> bird(tweety).\nr1 : bird(X) => flies(X).\nf2 :=> -flies(tweety).\n',
    aba: 'graphBuildMode(aba).\n\nassumption(a).\nassumption(b).\ncontrary(a, x).\n\nr1 : b -> x.\nr2 : a -> y.\n',
    abstract: 'graphBuildMode(abstract).\n\na.\nb.\nc.\na -> b.\nb <-> c.\n\nX -> Y :- beats(X, Y).\nbeats(d, a).\n',
};

const $ = <K extends keyof HTMLElementTagNameMap>(selector: string) => document.querySelector(selector) as HTMLElementTagNameMap[K];
const theory = $<'arg2p-editor'>('#theory');
const query = $<'arg2p-editor'>('#query');
const example = $<'select'>('#example');
const flags = $<'arg2p-flags'>('arg2p-flags');
const solutions = $<'arg2p-solutions'>('arg2p-solutions');
const graph = $<'arg2p-graph'>('arg2p-graph');
const framework = $<'arg2p-framework'>('arg2p-framework');

// from the sources: the worker of the package is found next to the engine once built
const engine = new JsEngine(() => new Worker(new URL('../src/js/worker.ts', import.meta.url), { type: 'module' }) as never);
engine.start();
theory.engine = engine;
query.engine = engine;
flags.engine = engine;
flags.flags = DEFAULT_FLAGS;
query.value = 'buildLabelSets(In, Out, Und)';

const setTheory = (text: string) => {
    theory.value = text;
    framework.theory = text;
    flags.theory = text;
};
Object.keys(EXAMPLES).forEach(name => example.add(new Option(name, name)));
example.addEventListener('change', () => setTheory(EXAMPLES[example.value]));
setTheory(EXAMPLES.tweety);

theory.addEventListener('arg2p-change', event => {
    framework.theory = (event as CustomEvent<{ value: string }>).detail.value;
    flags.theory = framework.theory;
});
framework.addEventListener('arg2p-theory-change', event => {
    theory.value = (event as CustomEvent<{ theory: string }>).detail.theory;
    flags.theory = theory.value;
});
solutions.addEventListener('arg2p-solution', event => {
    const { solution, run } = (event as CustomEvent<{ solution: SolutionData; run: Run }>).detail;
    graph.showSolution(solution, run);
    framework.graph = solution.graph;
});
solutions.addEventListener('arg2p-error-select', event => {
    const { syntax } = (event as CustomEvent<{ error: EngineError }>).detail.error;
    if (syntax?.where === 'theory') theory.report(syntax);
    else if (syntax?.where === 'query') query.report(syntax);
});

const solve = () => {
    graph.clear();
    engine.solve({ theory: theory.value, query: query.value, flags: flags.flags }, text => console.log(text)).then(
        run => solutions.start(run),
        (error: EngineError) => solutions.fail(error),
    );
};
query.addEventListener('arg2p-submit', solve);
document.querySelector('#solve')!.addEventListener('click', solve);
document.querySelector('#stop')!.addEventListener('click', () => engine.stop());
