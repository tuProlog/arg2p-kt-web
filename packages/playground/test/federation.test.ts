import jsQR from 'jsqr';
import { encode } from 'uqr';
import { assert, describe, it } from 'vitest';
import { readArgument } from '../src/federation/arguments.js';
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

describe('The arguments of a federation', function () {
    it('should tell what an argument concludes, and its rules', function () {
        deepEqual(readArgument('[[d3(jack), d1(jack), f2], d1(jack), [flies(jack)], [bird(jack)], [[d1(jack)], [d3(jack), d1(jack)], [f2]]]'), {
            conclusion: 'flies(jack)',
            rules: ['d3(jack)', 'd1(jack)', 'f2'],
        });
        deepEqual(readArgument("[[f1], f1, [says('a, b')], [], []]"), { conclusion: "says('a, b')", rules: ['f1'] });
        equal(readArgument('flies(jack)'), null);
        equal(readArgument('[[a], b]'), null);
    });
});
