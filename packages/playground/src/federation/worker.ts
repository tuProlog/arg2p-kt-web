import { nodeService, startWebWorker } from '@tuprolog/arg2p';

// A Web Worker of the parallel solver of the playground (see WebWorkerSolver): the node of the federation runs on one
// of them, with its site (nodeService)
startWebWorker(nodeService);
