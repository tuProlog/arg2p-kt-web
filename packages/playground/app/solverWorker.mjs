// The solver, in a worker of its own: the page stays responsive while it
// works, and a query that runs too long is stopped by ending the worker.
import { createSolverHost } from './service/solverHost.mjs';

const host = createSolverHost(message => self.postMessage(message));
self.onmessage = event => host.handle(event.data);
