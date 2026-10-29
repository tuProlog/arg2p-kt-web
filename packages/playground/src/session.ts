import * as store from './documents.js';
import type { Content, Doc, Storage, Workspace } from './documents.js';

// The working memory as one page uses it (see documents.ts): autosaved shortly after every change, and kept in step
// with the other pages that use it at the same time (browser tabs, windows).
//
// Every change starts from the memory as stored right then, rather than from this page's copy, and each page keeps
// its own active document. The browser tells the other pages about every change: their tabs follow, and so does the
// document they show, unless they are editing it. When the same document is edited in two pages at once, the last
// save wins and the version it replaces is kept among the closed ones, so nothing is lost.
//
// What the browser does not keep (its storage full, say) stays in the page and is saved again at the next change; the
// page is told, and meanwhile shows no other document, which would let go the edits not saved of this one.

const AUTOSAVE_DELAY = 400;
const CONFLICT = 'other window';

export interface SessionListener {
    /** A document to show in the editors (another one, or the same changed by another page) */
    show(doc: Doc): void;
    /** The tabs (or the closed documents) changed */
    changed(workspace: Workspace, active: string | null): void;
    /** The browser did not keep what changed: it is kept in the page, and saved again at the next change */
    unsaved(): void;
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
        if (this.transact(ws => store.create(ws, content, name), true)) this.load(this.activeDocument!);
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
        if (this.transact(ws => store.activate(ws, id), true)) this.load(this.activeDocument!);
    }

    close(id: string): void {
        const wasActive = id === this.active;
        if (this.transact(ws => store.close(ws, id), wasActive) && wasActive) this.load(this.activeDocument!);
    }

    reopen(id: string): void {
        if (this.transact(ws => store.reopen(ws, id), true)) this.load(this.activeDocument!);
    }

    rename(id: string, name: string): void {
        this.transact(ws => store.rename(ws, id, name));
    }

    clearClosed(): void {
        this.transact(store.clearClosed);
    }

    /** Saves what is being edited now: whether the browser kept it (else it is kept here, to be saved again) */
    flush(): boolean {
        clearTimeout(this.timer);
        const pending = this.pending;
        if (pending === null || this.active === null) return true;
        let ws = this.stored();
        const mine = this.activeDocument ?? { ...pending, id: this.active, name: 'Recovered', updated: Date.now() };
        const theirs = ws.tabs.find(it => it.id === this.active);
        // saved meanwhile by another page: that version is kept aside
        if (theirs !== undefined && theirs.updated > this.seen) ws = store.stash(ws, theirs, CONFLICT);
        // closed by another page while edited here: it comes back
        ws = store.recover(ws, mine);
        ws = store.update(ws, this.active, pending);
        if (!store.save(this.storage, { ...ws, active: this.active })) {
            this.listener.unsaved();
            return false;
        }
        this.pending = null;
        this.workspace = ws;
        this.seen = this.activeDocument!.updated;
        this.listener.changed(this.workspace, this.active);
        return true;
    }

    private stored(): Workspace {
        return store.load(this.storage) ?? store.emptyWorkspace();
    }

    // A change applied to the memory as stored right now (with this page's pending edits), saved and shown (in the
    // page, should the browser not keep it): whether it was made. One that [shows another] document waits for the edits
    // of this one to be saved; any other may make room for them, and they are saved again after it.
    private transact(change: (workspace: Workspace) => Workspace, showsAnother = false): boolean {
        const saved = this.flush();
        if (!saved && showsAnother) return false;
        const stored = this.stored();
        const next = change({ ...stored, active: this.active ?? stored.active });
        if (!store.save(this.storage, next)) this.listener.unsaved();
        this.workspace = next;
        this.active = next.active;
        this.listener.changed(this.workspace, this.active);
        if (!saved) this.flush();
        return true;
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
