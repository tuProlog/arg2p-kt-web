import { deflateSync, strToU8 } from 'fflate';
import { assert, describe, it } from 'vitest';
import { toBase64url as base64url } from '../src/base64url.js';
import { DEFAULT_QUERY } from '../src/documents.js';
import { read, shareUrl } from '../src/links.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const BASE = 'https://tuprolog.github.io/arg2p-kt-web/?stale=1#here';

describe('Links', function () {
    it('should share nothing without parameters', function () {
        deepEqual(read(''), { content: null, errors: [] });
    });

    it('should round trip a document, in a single short parameter', function () {
        const content = {
            theory: 'd1(X) : bird(X) => flies(X).\nd2(X) : penguin(X) => bird(X).\nf1 :=> penguin(tweety).',
            query: 'buildLabelSets(In, Out, Und)',
            flags: 'argumentLabellingMode(grounded).\nstatementLabellingMode(statement).\nqueryMode.\n',
        };
        const url = new URL(shareUrl(content, BASE));
        deepEqual([...url.searchParams.keys()], ['s']);
        equal(url.hash, '');
        ok(/^[A-Za-z0-9_-]+$/.test(url.searchParams.get('s')!));
        deepEqual(read(url.search), { content, errors: [] });
        const plain = new URL(BASE);
        plain.search = new URLSearchParams(content).toString();
        ok(url.toString().length < plain.toString().length / 2);
    });

    it('should keep unicode text intact', function () {
        const content = { theory: '% città, naïve, ∀x\nf1 :=> a.', query: 'a', flags: '' };
        deepEqual(read(new URL(shareUrl(content, BASE)).search).content, content);
    });

    it('should read the plain parameters, and a framework as a theory of the profile abstract', function () {
        deepEqual(read(`?theory=${encodeURIComponent('f1 :=> a.')}&query=a&flags=${encodeURIComponent('queryMode.')}`).content, {
            theory: 'f1 :=> a.',
            query: 'a',
            flags: 'queryMode.',
        });
        const framework = read('?mode=abstract&arguments=a;b&attacks=a%3Eb,b-c');
        deepEqual(framework, { content: { theory: 'graphBuildMode(abstract).\n\na.\nb.\nc.\na -> b.\nb -> c.\n' }, errors: [] });
    });

    it('should drop invalid names and malformed attacks, and tell', function () {
        const shared = read('?arguments=a,Bad&attacks=a');
        equal(shared.content!.theory, 'graphBuildMode(abstract).\n\na.\n');
        equal(shared.errors.length, 2);
        equal(read('?mode=conarg&theory=a.').errors.length, 1);
    });

    it('should tell a damaged link from one of an unknown version', function () {
        deepEqual(read('?s=not-a-valid-state').errors, ['The shared state in the link is damaged and was ignored.']);
        const future = base64url(deflateSync(strToU8(JSON.stringify([99, 'f.', 't.', 'q']))));
        deepEqual(read(`?s=${future}`).errors, ['The shared state in the link comes from an unsupported version and was ignored.']);
    });

    // Links shared with format version 1 (structured and abstract): if this breaks, links already out there break
    // too. Change the format by adding a new version instead.
    it('should keep reading links of version 1', function () {
        const structured = read('?s=wwgawm5CaAYqTzMEB1BBal56aWaeRkl5ampJJUhViiEwoBSsFJIyi1JALKCitJzM1GIgG6QPOYiVYgE');
        deepEqual(structured, {
            content: {
                theory: 'f1 :=> penguin(tweety).\nd1(X) : bird(X) => flies(X).',
                query: 'arg2p::solve',
                flags: 'argumentLabellingMode(grounded).\nqueryMode.',
            },
            errors: [],
        });
        const v1 = (state: unknown[]) => {
            const dictionary = strToU8(
                '[1,"structured","[1,"abstract","abstract::solve(arg2p::solve :=>  =>  :-  -> (X)(X, Y)graphBuildMode(standard_af).\\nstatementLabellingMode(statement).\\nargumentLabellingMode(grounded).\\norderingPrinciple(last).\\norderingComparator(elitist).\\ngraphExtension(standardPref).\\nqueryMode.',
            );
            return base64url(deflateSync(strToU8(JSON.stringify(state)), { level: 9, dictionary }));
        };
        const abstract = read(`?s=${v1([1, 'abstract', 'graphBuildMode(standard_af).\nargumentLabellingMode(preferred).\n', 'a,b', 'a-b,b-a'])}`);
        deepEqual(abstract, {
            content: {
                theory: 'graphBuildMode(abstract).\n\na.\nb.\na -> b.\nb -> a.\n',
                // a link of version 1 tells no query: the default one is solved
                query: DEFAULT_QUERY,
                flags: 'argumentLabellingMode(preferred).\n',
            },
            errors: [],
        });
    });
});
