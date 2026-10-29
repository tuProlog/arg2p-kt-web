import { assert, describe, it } from 'vitest';
import { Relay, relayUrl, type Fetch } from '../src/federation/relay.js';
import { fakeRelay, sleep } from './fakes.js';

const { deepEqual, equal } = assert;

const TOPIC = 'arg2p-abcdefgh12';

describe('The relay', function () {
    it('should be an https address alone', function () {
        equal(relayUrl(' https://ntfy.sh/ '), 'https://ntfy.sh');
        equal(relayUrl('https://ntfy.example.org:8080/base/?x=1#y'), 'https://ntfy.example.org:8080/base');
        for (const url of ['http://ntfy.sh', 'javascript:alert(1)', 'ntfy.sh', '', 'ftp://ntfy.sh']) assert.isNull(relayUrl(url), url);
        assert.throws(() => new Relay('http://ntfy.sh'), /https/);
    });

    it('should give each message of a topic once, until stopped', async function () {
        const relay = fakeRelay();
        const received: string[] = [];
        const reached: boolean[] = [];
        const subscription = new Relay('https://ntfy.sh', { fetch: relay.fetch, every: 20 }).subscribe(TOPIC, it => received.push(it), it => reached.push(it));
        await new Relay('https://ntfy.sh', { fetch: relay.fetch }).publish(TOPIC, 'one');
        await sleep(100);
        await new Relay('https://ntfy.sh', { fetch: relay.fetch }).publish(TOPIC, 'two');
        await sleep(100);
        subscription.stop();
        deepEqual(received, ['one', 'two']);
        deepEqual(reached, [true]);
        // stopped: its timer cleared, it reads the topic no longer
        const reads = relay.reads();
        await sleep(100);
        equal(relay.reads(), reads);
    });

    it('should read the topic no longer while paused, and again once resumed', async function () {
        const relay = fakeRelay();
        const subscription = new Relay('https://ntfy.sh', { fetch: relay.fetch, every: 20 }).subscribe(TOPIC, () => {});
        await sleep(50);
        subscription.pause();
        await sleep(20);
        const reads = relay.reads();
        await sleep(100);
        equal(relay.reads(), reads);
        subscription.resume();
        await sleep(50);
        assert.isAbove(relay.reads(), reads);
        subscription.stop();
    });

    it('should let go a read that hangs, tell, and read again', async function () {
        let reads = 0;
        // a relay that never answers: only the signal of the read ends it
        const hanging: Fetch = (_, init) => {
            reads++;
            return new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)));
        };
        const reached: boolean[] = [];
        const subscription = new Relay('https://ntfy.sh', { fetch: hanging, timeout: 50, every: 20 }).subscribe(TOPIC, () => {}, it => reached.push(it));
        await sleep(200);
        deepEqual(reached, [false]);
        assert.isAbove(reads, 1);
        subscription.stop();
        // stopped, a read going on is aborted: none comes after it
        const before = reads;
        await sleep(150);
        equal(reads, before);
    });

    it('should not wait for ever for a relay to take a message', async function () {
        const hanging: Fetch = (_, init) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)));
        const started = Date.now();
        await new Relay('https://ntfy.sh', { fetch: hanging, timeout: 50 }).publish(TOPIC, 'one').then(
            () => assert.fail('published'),
            error => equal(error.name, 'TimeoutError'),
        );
        assert.isBelow(Date.now() - started, 1000);
    });
});
