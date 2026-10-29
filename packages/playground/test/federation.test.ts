import jsQR from 'jsqr';
import { encode } from 'uqr';
import { assert, describe, it } from 'vitest';
import { deviceName, devicesOf, type FederationStats } from '../src/federation/federation.js';
import { codeIn, pairingLink, readPairing } from '../src/federation/links.js';

const { deepEqual, equal } = assert;

// a code as WebWorkerCluster makes them: z, then base64 (with + and /), some 600 characters
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const CODE = 'z' + Array.from({ length: 600 }, (_, i) => ALPHABET[(i * 37 + 11) % 64]).join('') + '==';
const BASE = 'https://tuprolog.github.io/arg2p-kt-web/?s=abc';

describe('The links of a pairing', function () {
    it('should carry a code in their fragment, and give it back', function () {
        const link = pairingLink(BASE, { kind: 'join', code: CODE });
        const url = new URL(link);
        equal(url.search, '');
        equal(url.pathname, '/arg2p-kt-web/');
        deepEqual(readPairing(url.hash), { kind: 'join', code: CODE });
        deepEqual(readPairing(new URL(pairingLink(BASE, { kind: 'reply', code: CODE })).hash), { kind: 'reply', code: CODE });
    });

    it('should tell the code of a kind in what was scanned or pasted', function () {
        const reply = pairingLink(BASE, { kind: 'reply', code: CODE });
        equal(codeIn(reply, 'reply'), CODE);
        equal(codeIn(` ${CODE}\n`, 'reply'), CODE);
        // an invitation scanned where a reply is expected
        equal(codeIn(pairingLink(BASE, { kind: 'join', code: CODE }), 'reply'), null);
        equal(codeIn('', 'join'), null);
        equal(readPairing('#s=abc'), null);
        equal(readPairing(''), null);
    });

    it('should fit a QR code that reads back the same', function () {
        const link = pairingLink('https://tuprolog.github.io/arg2p-kt-web/', { kind: 'join', code: CODE });
        const qr = encode(link, { ecc: 'M', border: 2 });
        // as a camera would see it: four pixels a module
        const scale = 4;
        const size = qr.size * scale;
        const pixels = new Uint8ClampedArray(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dark = qr.data[Math.floor(y / scale)]![Math.floor(x / scale)]!;
                pixels.fill(dark ? 0 : 255, (y * size + x) * 4, (y * size + x) * 4 + 3);
                pixels[(y * size + x) * 4 + 3] = 255;
            }
        }
        equal(jsQR(pixels, size, size)?.data, link);
        // some 100 modules a side, which a phone reads off a screen
        assert.isAtMost(qr.version, 21, `version ${qr.version}`);
        assert.notInclude(link, '%', 'the code as it is in the link');
    });
});

describe('The devices of a federation', function () {
    // as a cluster paired with another tells them: its own site, its Web Workers, the other device, and one beyond it
    const stats: FederationStats = {
        site: 'site-a',
        sites: [
            { id: 'site-a', workers: 0, delegate: false, via: null },
            { id: 'site-a1', workers: 1, delegate: true, via: null },
            { id: 'site-a2', workers: 1, delegate: true, via: null },
            { id: 'site-b', workers: 4, delegate: false, via: null },
            { id: 'site-c', workers: null, delegate: false, via: 'site-b' },
        ],
        evaluation: null,
    };

    it('should tell this device first, with the workers of its Web Workers, then the others', function () {
        deepEqual(devicesOf(stats), [
            { id: 'site-a', name: 'This device', workers: 2, via: null },
            { id: 'site-b', name: 'Device 1', workers: 4, via: null },
            { id: 'site-c', name: 'Device 2', workers: null, via: 'Device 1' },
        ]);
    });

    it('should tell the device a worker ran on', function () {
        equal(deviceName(stats, 'site-a2'), 'This device');
        equal(deviceName(stats, 'site-b'), 'Device 1');
        equal(deviceName(stats, 'site-x'), 'site-x');
    });
});
