import * as store from './documents.js';
import type { Content, Doc, Storage, Workspace } from './documents.js';

// The working memory as one page uses it (see documents.ts): autosaved shortly after every change, and kept in step
// with the other pages that use it at the same time (browser tabs, windows).
//
// Every change starts from the memory as stored right then, rather than from this page's copy, and each page keeps
// its own active document. The browser tells the other pages about every change: their tabs follow, and so does the
// document they show, unless they are editing it. When the same document is edited in two pages at once, the last
// save wins and the version it replaces is kept among the closed ones, so nothing is lost.

const AUTOSAVE_DELAY = 400;
const CONFLICT = 'other window';

export interface SessionListener {
    /** A document to show in the editors (another one, or the same changed by another page) */
    show(doc: Doc): void;
    /** The tabs (or the closed documents) changed */
    changed(workspace: Workspace, active: string | null): void;
}

export class Session {
    private workspace: Workspace;
    private active: string | null = null;
    // the version of the active document last loaded or saved here: a newer one was saved by another page
    private seen = 0;
    // the content edited here and not saved yet
    private pending: Content | null = null;
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly storage: Storage,
        private readonly listener: SessionListener,
    ) {
        this.workspace = this.stored();
    }

    /** Keeps in step with the other pages of [target] (a window), and saves before the page goes away */
    attach(target: Window): void {
        target.addEventListener('pagehide', () => this.flush());
        target.document.addEventListener('visibilitychange', () => {
            if (target.document.hidden) this.flush();
        });
        target.addEventListener('storage', event => {
            if (event.key === store.KEY) this.changedElsewhere();
        });
    }

    get current(): Workspace {
        return this.workspace;
    }

    get activeDocument(): Doc | null {
        return this.workspace.tabs.find(it => it.id === this.active) ?? null;
    }

    /** Starts from the document active last time, or a new one with [initial] */
    restore(initial: () => Content, name: string): void {
        this.transact(ws => (store.activeDocument(ws) === null ? store.create(ws, initial(), name) : ws));
        this.load(this.activeDocument!);
    }

    /** Opens [content] in a new tab, after the active one */
    open(content: Content, name: string | null): void {
        this.transact(ws => store.create(ws, content, name));
        this.load(this.activeDocument!);
    }

    /** The active document as edited: saved once the editing settles */
    edit(content: Partial<Content>): void {
        const doc = this.activeDocument;
        if (doc === null) return;
        this.pending = { theory: doc.theory, query: doc.query, flags: doc.flags, ...this.pending, ...content };
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), AUTOSAVE_DELAY);
    }

    /** The active document as it is now, with what is being edited */
    content(): Content | null {
        const doc = this.activeDocument;
        if (doc === null) return null;
        return { theory: doc.theory, query: doc.query, flags: doc.flags, ...this.pending };
    }

    select(id: string): void {
        if (id === this.active) return;
        this.transact(ws => store.activate(ws, id));
        this.load(this.activeDocument!);
    }

    close(id: string): void {
        const wasActive = id === this.active;
        this.transact(ws => store.close(ws, id));
        if (wasActive) this.load(this.activeDocument!);
    }

    reopen(id: string): void {
        this.transact(ws => store.reopen(ws, id));
        this.load(this.activeDocument!);
    }

    rename(id: string, name: string): void {
        this.transact(ws => store.rename(ws, id, name));
    }

    clearClosed(): void {
        this.transact(store.clearClosed);
    }

    /** Saves what is being edited now */
    flush(): void {
        clearTimeout(this.timer);
        const pending = this.pending;
        if (pending === null || this.active === null) return;
        this.pending = null;
        let ws = this.stored();
        const mine = this.activeDocument ?? { ...pending, id: this.active, name: 'Recovered', updated: Date.now() };
        const theirs = ws.tabs.find(it => it.id === this.active);
        // saved meanwhile by another page: that version is kept aside
        if (theirs !== undefined && theirs.updated > this.seen) ws = store.stash(ws, theirs, CONFLICT);
        // closed by another page while edited here: it comes back
        ws = store.recover(ws, mine);
        ws = store.update(ws, this.active, pending);
        store.save(this.storage, { ...ws, active: this.active });
        this.workspace = ws;
        this.seen = this.activeDocument!.updated;
        this.listener.changed(this.workspace, this.active);
    }

    private stored(): Workspace {
        return store.load(this.storage) ?? store.emptyWorkspace();
    }

    // A change applied to the memory as stored right now (with this page's pending edits), saved and shown
    private transact(change: (workspace: Workspace) => Workspace): void {
        this.flush();
        const stored = this.stored();
        const next = change({ ...stored, active: this.active ?? stored.active });
        store.save(this.storage, next);
        this.workspace = next;
        this.active = next.active;
        this.listener.changed(this.workspace, this.active);
    }

    private load(doc: Doc): void {
        this.active = doc.id;
        this.seen = doc.updated;
        this.pending = null;
        this.listener.show(doc);
    }

    // Another page changed the memory
    private changedElsewhere(): void {
        if (this.pending !== null) {
            // this page's edits go in first: they are newer
            this.flush();
            return;
        }
        this.workspace = this.stored();
        const doc = this.activeDocument;
        if (doc === null) {
            // closed elsewhere: this page moves to another one
            const next = this.workspace.tabs[0];
            if (next === undefined) return this.restore(store.blank, 'Untitled');
            this.load(next);
        } else if (doc.updated > this.seen) {
            this.load(doc);
        }
        this.listener.changed(this.workspace, this.active);
    }
}

/** localStorage, or a memory that lasts the visit alone when it cannot be used (private mode, storage disabled) */
export function browserStorage(): Storage {
    try {
        const probe = 'arg2p.probe';
        window.localStorage.setItem(probe, probe);
        window.localStorage.removeItem(probe);
        return window.localStorage;
    } catch {
        const items = new Map<string, string>();
        return { getItem: key => items.get(key) ?? null, setItem: (key, value) => void items.set(key, `${value}`) };
    }
}
