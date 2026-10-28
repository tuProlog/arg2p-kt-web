import { equal, deepEqual, ok } from 'assert';

import store from '../app/service/workspaceStore.mjs';

const doc = (theory, extra = {}) => ({
  mode: 'structured', theory, query: 'arg2p::solve', flags: 'queryMode.',
  abstractGraph: { arguments: [], attacks: [] }, ...extra
});
const blank = () => doc('');

// A storage with the interface of localStorage.
function memoryStorage() {
  const items = new Map();
  return { getItem: key => items.has(key) ? items.get(key) : null, setItem: (key, value) => items.set(key, `${value}`) };
}

describe('Workspace', function () {

  it('should open documents after the active one, and activate them', function () {
    let ws = store.create(store.emptyWorkspace(), doc('a.'), 'First');
    ws = store.create(ws, doc('b.'), 'Second');
    ws = store.activate(ws, ws.tabs[0].id);
    ws = store.create(ws, doc('c.'), 'Third');
    deepEqual(ws.tabs.map(it => it.name), ['First', 'Third', 'Second']);
    equal(store.activeDocument(ws).name, 'Third');
  });

  it('should give untitled documents a free number, and number taken names', function () {
    let ws = store.emptyWorkspace();
    ws = store.create(ws, blank());
    ws = store.create(ws, blank());
    ws = store.create(ws, doc('t.'), 'Tweety');
    ws = store.create(ws, doc('t.'), 'Tweety');
    deepEqual(ws.tabs.map(it => it.name), ['Untitled 1', 'Untitled 2', 'Tweety', 'Tweety 2']);
  });

  it('should update and rename a document', function () {
    let ws = store.create(store.emptyWorkspace(), doc('a.'), 'First', 1);
    const id = ws.active;
    ws = store.update(ws, id, { theory: 'b.' }, 5);
    equal(store.activeDocument(ws).theory, 'b.');
    equal(store.activeDocument(ws).updated, 5);
    ws = store.rename(ws, id, '  Renamed ');
    equal(store.activeDocument(ws).name, 'Renamed');
    equal(store.rename(ws, id, '  ').tabs[0].name, 'Renamed');
  });

  it('should keep closed documents, newest first, and reopen them', function () {
    let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
    ws = store.create(ws, doc('b.'), 'B');
    ws = store.create(ws, doc('c.'), 'C');
    ws = store.close(ws, ws.tabs[0].id, blank, 10);
    ws = store.close(ws, ws.tabs[0].id, blank, 20);
    deepEqual(ws.tabs.map(it => it.name), ['C']);
    deepEqual(ws.closed.map(it => it.name), ['B', 'A']);
    ws = store.reopen(ws, ws.closed[1].id);
    deepEqual(ws.tabs.map(it => it.name), ['C', 'A']);
    equal(store.activeDocument(ws).theory, 'a.');
    deepEqual(ws.closed.map(it => it.name), ['B']);
  });

  it('should activate a neighbour when the active document closes', function () {
    let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
    ws = store.create(ws, doc('b.'), 'B');
    ws = store.create(ws, doc('c.'), 'C');
    ws = store.activate(ws, ws.tabs[1].id);
    ws = store.close(ws, ws.active, blank);
    equal(store.activeDocument(ws).name, 'C');
  });

  it('should always keep a document open, and forget blank ones', function () {
    let ws = store.create(store.emptyWorkspace(), blank());
    ws = store.close(ws, ws.active, blank);
    equal(ws.tabs.length, 1);
    equal(ws.closed.length, 0);
    ws = store.update(ws, ws.active, { theory: 'kept.' });
    ws = store.close(ws, ws.active, blank);
    equal(ws.tabs.length, 1);
    equal(ws.closed[0].theory, 'kept.');
  });

  it('should keep an abstract graph as content', function () {
    const graph = { arguments: ['a'], attacks: [] };
    ok(!store.isBlank(doc('', { mode: 'abstract', abstractGraph: graph })));
  });

  it('should keep only the most recent closed documents', function () {
    let ws = store.create(store.emptyWorkspace(), doc('x.'));
    for (let i = 0; i < store.MAX_CLOSED + 5; i++) {
      ws = store.create(ws, doc(`t${i}.`), `T${i}`);
      ws = store.close(ws, ws.active, blank);
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
    equal(store.load({ getItem: () => { throw new Error('denied'); } }), null);
    equal(store.save({ setItem: () => { throw new Error('full'); } }, ws), false);
  });

  it('should give documents ids no other page picks', function () {
    const ids = new Set(Array.from({ length: 500 }, () => store.newId(1000)));
    equal(ids.size, 500);
  });

  it('should recover a document another page closed while it is edited here', function () {
    let ws = store.create(store.emptyWorkspace(), doc('a.'), 'A');
    ws = store.create(ws, doc('b.'), 'B');
    const edited = store.activeDocument(ws);
    ws = store.close(ws, edited.id, blank);
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
    ws = store.stash(ws, store.activeDocument(ws), 'other window', 7);
    equal(ws.closed[0].name, 'Shared (other window)');
    equal(ws.closed[0].theory, 'theirs.');
    ok(ws.closed[0].id !== ws.tabs[0].id);
  });
});
