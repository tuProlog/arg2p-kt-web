import { WebWorkerCluster, type Response } from '@tuprolog/arg2p';
import { CHANNEL, workerCount, type PairingMessage } from './pairing.js';
import workerUrl from './worker.ts?worker&url';

// The federation of the playground with the playgrounds of other devices (see Federation in the documentation of the
// parallel solver): a WebWorkerCluster lending the workers of its Web Workers to the devices it is paired with by hand,
// and borrowing theirs. No server: the two devices exchange an invitation and its reply, and must be on the same
// network (no STUN nor TURN server).

/** The arguments of a statement, by label, as the federation built them */
export interface FederatedAnswer {
    readonly in: readonly FederatedArgument[];
    readonly out: readonly FederatedArgument[];
    readonly und: readonly FederatedArgument[];
    readonly error: string | null;
}

/** An argument: its claim, and the rules and premises it chains, as Prolog text */
export interface FederatedArgument {
    readonly claim: string;
    readonly chain: readonly string[];
}

export class Federation {
    private cluster: WebWorkerCluster | null = null;
    private readonly channel: BroadcastChannel | null = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
    private invited = false;

    /** What is told as the pairing goes on: paired, or failed with a message */
    onPaired: () => void = () => {};
    onFailed: (message: string) => void = () => {};

    readonly threads = workerCount();

    constructor() {
        // a reply opened in another page of this device (a link scanned with the camera of the system) comes here
        this.channel?.addEventListener('message', event => {
            const message = event.data as PairingMessage;
            if (message.type === 'reply' && this.invited) void this.complete(message.code);
        });
    }

    private get started(): WebWorkerCluster {
        this.cluster ??= new WebWorkerCluster(this.threads, workerUrl);
        return this.cluster;
    }

    /** Whether the federation runs (its Web Workers started) */
    get running(): boolean {
        return this.cluster !== null;
    }

    /** How many sites of other devices this one is linked to: its own Web Workers are sites too */
    get devices(): number {
        return Math.max(0, (this.cluster?.peers.length ?? 0) - this.threads);
    }

    /** An invitation for another device to accept */
    async invite(): Promise<string> {
        const invitation = await this.started.invite();
        this.invited = true;
        return invitation;
    }

    /** The reply to the [invitation] of another device, for it to complete the pairing */
    accept(invitation: string): Promise<string> {
        return this.started.accept(invitation);
    }

    /** The pairing this device invited to, completed with the [reply] of the other */
    async complete(reply: string): Promise<void> {
        try {
            await this.started.complete(reply);
            this.invited = false;
            this.post({ type: 'paired' });
            this.onPaired();
        } catch (error) {
            const message = `The reply could not complete the pairing: ${(error as Error).message ?? String(error)}`;
            this.post({ type: 'failed', message });
            this.onFailed(message);
        }
    }

    /** The arguments for [statement] on [theory] with [flags] (Prolog facts), built by the federation */
    async solve(theory: string, flags: string, statement: string): Promise<FederatedAnswer> {
        const cluster = this.started;
        // a flag the theory states is the one in effect: the flags go with the theory
        cluster.load(`${flags}\n${theory}`);
        const response = await cluster.solve(statement);
        const args = (list: readonly Response[]) => list.map(it => ({ claim: it.claim, chain: [...it.queryChain] }));
        return {
            in: args(response.inArgs),
            out: args(response.outArgs),
            und: args(response.undArgs),
            error: response.error ?? null,
        };
    }

    /** Leaves the federation: the links to the other devices close, and the Web Workers stop */
    close(): void {
        this.cluster?.close();
        this.cluster = null;
        this.invited = false;
    }

    private post(message: PairingMessage): void {
        this.channel?.postMessage(message);
    }
}
