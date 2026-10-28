import '../src/index.js';
import { JsEngine } from '../src/js/index.js';
import type { EngineError, Run, SolutionData } from '../src/engine.js';

// A page to try the components on while they are written (npm run dev): not published

const EXAMPLES: Record<string, string> = {
    tweety: 'f1 :=> bird(tweety).\nr1 : bird(X) => flies(X).\nf2 :=> -flies(tweety).\n',
    aba: 'graphBuildMode(aba).\n\nassumption(a).\nassumption(b).\ncontrary(a, x).\n\nr1 : b -> x.\nr2 : a -> y.\n',
    abstract: 'graphBuildMode(abstract).\n\na.\nb.\nc.\na -> b.\nb <-> c.\n\nX -> Y :- beats(X, Y).\nbeats(d, a).\n',
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const theory = $<HTMLTextAreaElement>('#theory');
const flags = $<HTMLTextAreaElement>('#flags');
const query = $<HTMLInputElement>('#query');
const example = $<HTMLSelectElement>('#example');
const solutions = $('arg2p-solutions') as HTMLElementTagNameMap['arg2p-solutions'];
const graph = $('arg2p-graph') as HTMLElementTagNameMap['arg2p-graph'];
const framework = $('arg2p-framework') as HTMLElementTagNameMap['arg2p-framework'];

// from the sources: the worker of the package is found next to the engine once built
const engine = new JsEngine(() => new Worker(new URL('../src/js/worker.ts', import.meta.url), { type: 'module' }) as never);
engine.start();

Object.keys(EXAMPLES).forEach(name => example.add(new Option(name, name)));
const load = () => {
    theory.value = EXAMPLES[example.value];
    framework.theory = theory.value;
};
example.addEventListener('change', load);
load();

theory.addEventListener('input', () => (framework.theory = theory.value));
framework.addEventListener('arg2p-theory-change', event => (theory.value = (event as CustomEvent<{ theory: string }>).detail.theory));
solutions.addEventListener('arg2p-solution', event => {
    const { solution, run } = (event as CustomEvent<{ solution: SolutionData; run: Run }>).detail;
    graph.showSolution(solution, run);
    framework.graph = solution.graph;
});
solutions.addEventListener('arg2p-failure', event => console.warn((event as CustomEvent<{ error: EngineError }>).detail.error));

$('#solve').addEventListener('click', () => {
    graph.clear();
    engine.solve({ theory: theory.value, query: query.value, flags: flags.value }, text => console.log(text)).then(
        run => solutions.start(run),
        (error: EngineError) => solutions.fail(error),
    );
});
$('#stop').addEventListener('click', () => engine.stop());
