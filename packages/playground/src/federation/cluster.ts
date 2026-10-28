import { WebWorkerCluster } from '@tuprolog/arg2p';
import type { SolveRequest } from '@tuprolog/arg2p-ui/data';
import { workerCount, type Cluster, type FederationStats, type ParallelRun } from './federation.js';
import workerUrl from './worker.ts?worker&url';

// The cluster of the playground: a WebWorkerCluster of @tuprolog/arg2p on Web Workers of this device (see worker.ts).
// Loaded once a federation, or a parallel run, is asked for: it brings the solver with it.

/** How often the sites of the cluster are looked at, as it does not tell when they change */
const LOOK_EVERY = 1000;

/**
 * A cluster of the WebWorkerCluster of @tuprolog/arg2p 0.19.1, which solves statements alone and tells no statistics: its
 * runs fail, and the sites it knows are counted, until the parallel solver answers any query, one solution at a time
 * with its graph, and tells what its federation is
 */
export class WebCluster implements Cluster {
    onChange: (() => void) | null = null;

    private readonly cluster: WebWorkerCluster;
    private readonly threads = workerCount();
    private readonly timer: ReturnType<typeof setInterval>;
    private seen = 0;

    constructor() {
        this.cluster = new WebWorkerCluster(this.threads, workerUrl);
        this.timer = setInterval(() => {
            const peers = this.cluster.peers.length;
            if (peers === this.seen) return;
            this.seen = peers;
            this.onChange?.();
        }, LOOK_EVERY);
    }

    invite(): Promise<string> {
        return this.cluster.invite();
    }

    accept(invitation: string): Promise<string> {
        return this.cluster.accept(invitation);
    }

    complete(reply: string): Promise<void> {
        return this.cluster.complete(reply);
    }

    solve(_request: SolveRequest): Promise<ParallelRun> {
        return Promise.reject({
            name: 'Parallel solver error',
            message: 'This version of @tuprolog/arg2p runs no query in parallel: a newer one is needed.',
            syntax: null,
        });
    }

    stop(): void {
        // a run of this version cannot be stopped
    }

    stats(): FederationStats {
        // its own Web Workers are sites too: the others are those of other devices
        const others = Math.max(0, this.cluster.peers.length - this.threads);
        const self = 'This device';
        return {
            site: self,
            sites: [
                { id: self, workers: this.threads, delegate: false, via: null },
                ...Array.from({ length: others }, (_, i) => ({ id: `Device ${i + 1}`, workers: null, delegate: false, via: null })),
            ],
            evaluation: null,
        };
    }

    close(): void {
        clearInterval(this.timer);
        this.cluster.close();
    }
}
