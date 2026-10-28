import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest';
import * as store from '../src/documents.js';
import type { Doc, Storage } from '../src/documents.js';
import { Session } from '../src/session.js';

const { deepEqual, equal } = assert;

function memoryStorage(): Storage {
    const items = new Map<string, string>();
    return { getItem: key => items.get(key) ?? null, setItem: (key, value) => void items.set(key, `${value}`) };
}

// A session, and what it showed and told
function session(storage = memoryStorage()) {
    const shown: Doc[] = [];
    const created = new Session(storage, { show: doc => shown.push(doc), changed: () => {} });
    return { session: created, shown, storage };
}

describe('Session', function () {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should start from the document of last time, or a new one', function () {
        const { session: first, storage } = session();
        first.restore(() => ({ ...store.blank(), theory: 'a.' }), 'Start');
        first.open({ ...store.blank(), theory: 'b.' }, 'Second');
        const { session: second, shown } = session(storage);
        second.restore(() => store.blank(), 'Ignored');
        equal(shown.at(-1)!.name, 'Second');
        deepEqual(second.current.tabs.map(it => it.name), ['Start', 'Second']);
    });

    it('should save the edits once they settle', function () {
        const { session: editing, storage } = session();
        editing.restore(() => store.blank(), 'Mine');
        editing.edit({ theory: 'a.' });
        editing.edit({ query: 'a' });
        equal(store.activeDocument(store.load(storage)!)!.theory, '');
        vi.advanceTimersByTime(500);
        const saved = store.activeDocument(store.load(storage)!)!;
        deepEqual([saved.theory, saved.query], ['a.', 'a']);
    });

    it('should keep aside the version another page saved meanwhile', function () {
        const { session: mine, storage } = session();
        mine.restore(() => store.blank(), 'Shared');
        const id = mine.activeDocument!.id;
        // another page saves the same document
        store.save(storage, store.update(store.load(storage)!, id, { theory: 'theirs.' }, Date.now() + 1000));
        mine.edit({ theory: 'mine.' });
        mine.flush();
        const ws = store.load(storage)!;
        equal(store.activeDocument(ws)!.theory, 'mine.');
        deepEqual(
            ws.closed.map(it => [it.name, it.theory]),
            [['Shared (other window)', 'theirs.']],
        );
    });

    it('should open, close and reopen documents, showing the active one', function () {
        const { session: tabs, shown } = session();
        tabs.restore(() => ({ ...store.blank(), theory: 'a.' }), 'A');
        tabs.open({ ...store.blank(), theory: 'b.' }, 'B');
        const b = tabs.activeDocument!.id;
        tabs.close(b);
        equal(shown.at(-1)!.name, 'A');
        tabs.reopen(tabs.current.closed[0].id);
        equal(shown.at(-1)!.name, 'B');
        tabs.rename(tabs.activeDocument!.id, 'Bee');
        deepEqual(tabs.current.tabs.map(it => it.name), ['A', 'Bee']);
    });
});
