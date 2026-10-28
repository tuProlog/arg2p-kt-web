import { assert, describe, it } from 'vitest';
import * as store from '../src/documents.js';
import type { Content, Storage } from '../src/documents.js';

const { deepEqual, equal } = assert;
const ok: (value: unknown, message?: string) => void = assert.ok;

const doc = (theory: string): Content => ({ theory, query: store.DEFAULT_QUERY, flags: 'queryMode.' });

// A storage with the interface of localStorage
function memoryStorage(): Storage {
    const items = new Map<string, string>();
    return { getItem: key => items.get(key) ?? null, setItem: (key, value) => void items.set(key, `${value}`) };
}

describe('Documents', function () {
    it('should open documents after the active one, and activate them', function () {
        let ws = store.create(store.emptyWorkspace(), doc('a.'), 'First');
        ws = store.create(ws, doc('b.'), 'Second');
        ws = store.activate(ws, ws.tabs[0].id);
        ws = store.create(ws, doc('c.'), 'Third');
        deepEqual(ws.tabs.map(it => it.name), ['First', 'Third', 'Second']);
        equal(store.activeDocument(ws)!.name, 'Third');
    });

    it('should give untitled documents a free number, and number taken names', function () {
        let ws = store.emptyWorkspace();
        ws = store.create(ws, store.blank());
        ws = store.create(ws, store.blank());
        ws = store.create(ws, doc('t.'), 'Tweety');
        ws = store.create(ws, doc('t.'), 'Tweety');
        deepEqual(ws.tabs.map(it => it.name), ['Untitled 1', 'Untitled 2', 'Tweety', 'Tweety 2']);
    });

    it('should update and rename a document', function () {
        let ws = store.create(store.emptyWorkspace(), doc('a.'), 'First', 1);
        const id = ws.active!;
        ws = store.update(ws, id, { theory: 'b.' }, 5);
        equal(store.activeDocument(ws)!.theory, 'b.');
        equal(store.activeDocument(ws)!.updated, 5);
        ws = store.rename(ws, id, '  Renamed ');
        equal(store.activeDocument(ws)!.name, 'Renamed');
        equal(store.rename(ws, id, '  ').tabs[0].name, 'Renamed');
    });

    it('should keep closed documents, newest first, and reopen them', function () {
        let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
        ws = store.create(ws, doc('b.'), 'B');
        ws = store.create(ws, doc('c.'), 'C');
        ws = store.close(ws, ws.tabs[0].id, 10);
        ws = store.close(ws, ws.tabs[0].id, 20);
        deepEqual(ws.tabs.map(it => it.name), ['C']);
        deepEqual(ws.closed.map(it => it.name), ['B', 'A']);
        ws = store.reopen(ws, ws.closed[1].id);
        deepEqual(ws.tabs.map(it => it.name), ['C', 'A']);
        equal(store.activeDocument(ws)!.theory, 'a.');
        deepEqual(ws.closed.map(it => it.name), ['B']);
    });

    it('should activate a neighbour when the active document closes', function () {
        let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
        ws = store.create(ws, doc('b.'), 'B');
        ws = store.create(ws, doc('c.'), 'C');
        ws = store.activate(ws, ws.tabs[1].id);
        ws = store.close(ws, ws.active!);
        equal(store.activeDocument(ws)!.name, 'C');
    });

    it('should always keep a document open, and forget blank ones', function () {
        let ws = store.create(store.emptyWorkspace(), store.blank());
        ws = store.close(ws, ws.active!);
        equal(ws.tabs.length, 1);
        equal(ws.closed.length, 0);
        ws = store.update(ws, ws.active!, { theory: 'kept.' });
        ws = store.close(ws, ws.active!);
        equal(ws.tabs.length, 1);
        equal(ws.closed[0].theory, 'kept.');
    });

    it('should keep only the most recent closed documents', function () {
        let ws = store.create(store.emptyWorkspace(), doc('x.'));
        for (let i = 0; i < store.MAX_CLOSED + 5; i++) {
            ws = store.create(ws, doc(`t${i}.`), `T${i}`);
            ws = store.close(ws, ws.active!);
        }
        equal(ws.closed.length, store.MAX_CLOSED);
        equal(ws.closed[0].name, `T${store.MAX_CLOSED + 4}`);
    });

    it('should survive a save and a load, and ignore what it cannot read', function () {
        const storage = memoryStorage();
        const ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
        ok(store.save(storage, ws));
        deepEqual(store.load(storage), ws);
        storage.setItem(store.KEY, '{not json');
        equal(store.load(storage), null);
        equal(
            store.load({
                getItem: () => {
                    throw new Error('denied');
                },
                setItem: () => {},
            }),
            null,
        );
        equal(
            store.save(
                {
                    getItem: () => null,
                    setItem: () => {
                        throw new Error('full');
                    },
                },
                ws,
            ),
            false,
        );
    });

    it('should give documents ids no other page picks', function () {
        equal(new Set(Array.from({ length: 500 }, () => store.newId(1000))).size, 500);
    });

    it('should recover a document another page closed while it is edited here', function () {
        let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
        ws = store.create(ws, doc('b.'), 'B');
        const edited = store.activeDocument(ws)!;
        ws = store.close(ws, edited.id);
        ws = store.recover(ws, edited);
        deepEqual(ws.tabs.map(it => it.name), ['A', 'B']);
        equal(ws.tabs[1].id, edited.id);
        equal(ws.closed.length, 0);
        // and one that is gone altogether
        const gone = store.recover(store.create(store.emptyWorkspace(), doc('x.'), 'X'), edited);
        deepEqual(gone.tabs.map(it => it.name), ['X', 'B']);
    });

    it('should keep the version another page saved among the closed ones', function () {
        let ws = store.create(store.emptyWorkspace(), doc('theirs.'), 'Shared');
        ws = store.stash(ws, store.activeDocument(ws)!, 'other window', 7);
        equal(ws.closed[0].name, 'Shared (other window)');
        equal(ws.closed[0].theory, 'theirs.');
        ok(ws.closed[0].id !== ws.tabs[0].id);
    });

    it('should bring up to date a workspace of version 1, a framework drawn becoming a theory', function () {
        const storage = memoryStorage();
        const flags = 'graphBuildMode(standard_af).\nargumentLabellingMode(preferred).\nqueryMode.';
        storage.setItem(
            store.KEY,
            JSON.stringify({
                version: 1,
                active: 'd2',
                tabs: [
                    { id: 'd1', name: 'Tweety', updated: 1, mode: 'structured', theory: 'f1 :=> a.', query: 'arg2p::solve', flags, abstractGraph: { arguments: [], attacks: [] } },
                    { id: 'd2', name: 'Cycle', updated: 2, mode: 'abstract', theory: '', query: 'abstract::solve([a], [], In, Out, Und)', flags, abstractGraph: { arguments: ['a', 'b'], attacks: [{ from: 'a', to: 'b' }] } },
                ],
                closed: [{ id: 'd3', name: 'Old', updated: 3, closedAt: 4, mode: 'structured', theory: 'x.', query: 'x', flags }],
            }),
        );
        const ws = store.load(storage)!;
        equal(ws.version, 2);
        equal(ws.active, 'd2');
        deepEqual(ws.tabs[0], { id: 'd1', name: 'Tweety', updated: 1, theory: 'f1 :=> a.', query: 'arg2p::solve', flags: 'argumentLabellingMode(preferred).\nqueryMode.' });
        equal(ws.tabs[1].theory, 'graphBuildMode(abstract).\n\na.\nb.\na -> b.\n');
        equal(ws.tabs[1].query, store.DEFAULT_QUERY);
        deepEqual(ws.closed.map(it => [it.name, it.closedAt]), [['Old', 4]]);
    });
});
