import { equal, deepEqual, ok } from 'assert';
import { deflateSync, strToU8 } from 'fflate';

import urlParamsService from '../app/service/urlParamsService.mjs';

describe('UrlParams', function () {

  describe('read', function () {

    it('should default everything to null', function () {
      const state = urlParamsService.read("");
      equal(state.mode, null);
      equal(state.theory, null);
      equal(state.query, null);
      equal(state.flags, null);
      equal(state.abstractGraph, null);
      deepEqual(state.errors, []);
    });

    it('should read theory, query and flags', function () {
      const state = urlParamsService.read(
        "?theory=" + encodeURIComponent("f1 :=> a.\nf2 :=> -a.") +
        "&query=" + encodeURIComponent("arg2p::solve") +
        "&flags=" + encodeURIComponent("argumentLabellingMode(complete)."));
      equal(state.theory, "f1 :=> a.\nf2 :=> -a.");
      equal(state.query, "arg2p::solve");
      equal(state.flags, "argumentLabellingMode(complete).");
      deepEqual(state.errors, []);
    });

    it('should read the mode', function () {
      equal(urlParamsService.read("?mode=abstract").mode, "abstract");
      equal(urlParamsService.read("?mode=STRUCTURED").mode, "structured");
    });

    it('should report an unknown mode', function () {
      const state = urlParamsService.read("?mode=conarg");
      equal(state.mode, null);
      equal(state.errors.length, 1);
    });

    it('should read an abstract graph', function () {
      const state = urlParamsService.read("?arguments=a,b,c&attacks=a-b,b-c");
      deepEqual(state.abstractGraph, {
        arguments: ['a', 'b', 'c'],
        attacks: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]
      });
      deepEqual(state.errors, []);
    });

    it('should accept both separators', function () {
      deepEqual(
        urlParamsService.read("?arguments=a;b&attacks=a%3Eb").abstractGraph,
        { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] });
    });

    it('should infer arguments mentioned only by an attack', function () {
      deepEqual(
        urlParamsService.read("?attacks=a-b").abstractGraph,
        { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] });
    });

    it('should drop invalid argument names and report them', function () {
      const state = urlParamsService.read("?arguments=a,Bad,c");
      deepEqual(state.abstractGraph.arguments, ['a', 'c']);
      equal(state.errors.length, 1);
    });

    it('should report a damaged shared state', function () {
      const state = urlParamsService.read("?s=not-a-valid-state");
      equal(state.theory, null);
      equal(state.mode, null);
      equal(state.errors.length, 1);
    });

    it('should report a shared state from an unknown version', function () {
      const packed = deflateSync(strToU8(JSON.stringify([99, "structured", "f.", "t.", "q"])));
      const s = Buffer.from(packed).toString("base64url");
      const state = urlParamsService.read("?s=" + s);
      equal(state.theory, null);
      equal(state.errors.length, 1);
    });

    it('should ignore the plain parameters when a shared state is present', function () {
      const url = new URL(urlParamsService.shareUrl({
        mode: "structured", theory: "t.", query: "q", flags: "f.",
        abstractGraph: { arguments: [], attacks: [] }
      }, "https://example.org/?theory=other."));
      url.searchParams.set("theory", "other.");
      equal(urlParamsService.read(url.search).theory, "t.");
    });

    it('should drop malformed attacks and report them', function () {
      const state = urlParamsService.read("?arguments=a,b&attacks=a");
      deepEqual(state.abstractGraph.attacks, []);
      equal(state.errors.length, 1);
    });
  });

  describe('shareUrl', function () {

    const base = "https://tuprolog.github.io/arg2p-kt-web/?mode=abstract&stale=1";

    it('should round trip a structured state', function () {
      const url = urlParamsService.shareUrl({
        mode: "structured",
        theory: "f1 :=> a.",
        query: "arg2p::solve",
        flags: "queryMode.",
        abstractGraph: { arguments: [], attacks: [] }
      }, base);
      const state = urlParamsService.read(new URL(url).search);
      equal(state.mode, "structured");
      equal(state.theory, "f1 :=> a.");
      equal(state.query, "arg2p::solve");
      equal(state.flags, "queryMode.");
      equal(state.abstractGraph, null);
    });

    it('should round trip an abstract state', function () {
      const url = urlParamsService.shareUrl({
        mode: "abstract",
        theory: "ignored",
        query: "ignored",
        flags: "queryMode.",
        abstractGraph: { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] }
      }, base);
      const state = urlParamsService.read(new URL(url).search);
      equal(state.mode, "abstract");
      equal(state.theory, null);
      deepEqual(state.abstractGraph, {
        arguments: ['a', 'b'],
        attacks: [{ from: 'a', to: 'b' }]
      });
    });

    it('should pack the state into a single short parameter', function () {
      const theory = "d1(X) : bird(X) => flies(X).\nd2(X) : penguin(X) => bird(X).\nf1 :=> penguin(tweety).";
      const state = {
        mode: "structured",
        theory,
        query: "arg2p::solve",
        flags: "graphBuildMode(standard_af).\nargumentLabellingMode(grounded).\nqueryMode.",
        abstractGraph: { arguments: [], attacks: [] }
      };
      const url = new URL(urlParamsService.shareUrl(state, base));
      deepEqual([...url.searchParams.keys()], ["s"]);
      ok(/^[A-Za-z0-9_-]+$/.test(url.searchParams.get("s")));

      const legacy = new URL(base);
      legacy.search = new URLSearchParams({
        mode: state.mode, flags: state.flags, theory: state.theory, query: state.query
      }).toString();
      ok(url.toString().length < legacy.toString().length);
    });

    it('should keep unicode text intact', function () {
      const url = urlParamsService.shareUrl({
        mode: "structured",
        theory: "% città, naïve, ∀x\nf1 :=> a.",
        query: "arg2p::solve",
        flags: "queryMode.",
        abstractGraph: { arguments: [], attacks: [] }
      }, base);
      equal(urlParamsService.read(new URL(url).search).theory, "% città, naïve, ∀x\nf1 :=> a.");
    });

    // A link shared with format version 1. If this breaks, links already out
    // there break too: change the format by adding a new version instead.
    it('should keep reading links made with format version 1', function () {
      const state = urlParamsService.read("?s=wwgawm5CaAYqTzMEB1BBal56aWaeRkl5ampJJUhViiEwoBSsFJIyi1JALKCitJzM1GIgG6QPOYiVYgE");
      deepEqual(state.errors, []);
      equal(state.mode, "structured");
      equal(state.theory, "f1 :=> penguin(tweety).\nd1(X) : bird(X) => flies(X).");
      equal(state.query, "arg2p::solve");
      equal(state.flags, "argumentLabellingMode(grounded).\nqueryMode.");
    });

    it('should drop stale parameters', function () {
      const url = urlParamsService.shareUrl({
        mode: "structured",
        theory: "f1 :=> a.",
        query: "arg2p::solve",
        flags: "queryMode.",
        abstractGraph: { arguments: [], attacks: [] }
      }, base);
      equal(new URL(url).searchParams.get("stale"), null);
    });
  });
});
