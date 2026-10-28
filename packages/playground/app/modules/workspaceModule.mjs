import store from '../service/workspaceStore.mjs';

// The tabs above the editors: one per document of the working memory (see
// workspaceStore), autosaved in the browser shortly after every change, plus
// the menu of the recently closed ones.
//
// The page owns the editors: `read()` gives the state of the active document
// as they show it, `show(doc)` puts a document in them.
//
// Other pages (browser tabs, windows) may work on the same memory at the same
// time. So every change starts from the memory as stored right then, rather
// than from this page's copy, and each page keeps its own active document.
// The browser tells the other pages about every change: their tabs follow,
// and so does the document they show, unless they are editing it. When the
// same document is edited in two pages at once, the last save wins and the
// version it replaces is kept among the closed ones, so nothing is lost.

const AUTOSAVE_DELAY = 400;
const CONFLICT = "other window";

function WorkspaceModule() {

    let workspace;
    let storage;
    let read;
    let show;
    let blank;
    let tabsBox;
    let historyMenu;
    let timer = null;
    // This page's document, and the version of it last loaded or saved here:
    // a newer one in the storage was saved by another page.
    let active = null;
    let seen = 0;
    // Edits not saved yet.
    let dirty = false;
    // While a document is put in the editors, their changes are not edits.
    let loading = false;

    function init(options) {
        ({ read, show, blank } = options);
        storage = safeStorage();
        tabsBox = options.bar.querySelector(".doc-tabs");
        historyMenu = options.bar.querySelector(".doc-history-menu");
        options.bar.querySelector(".doc-new").addEventListener("click", () => open(blank(), null));
        workspace = stored();
        // Saved before the page goes away, even within the autosave delay.
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
        window.addEventListener("storage", event => { if (event.key === store.KEY) changedElsewhere(); });
        return { open, changed, active: activeDocument, restore };
    }

    function stored() {
        return store.load(storage) || store.emptyWorkspace();
    }

    function activeDocument() {
        return workspace.tabs.find(it => it.id === active) || null;
    }

    // The document to start with: the one active last time, or a new one.
    function restore(initial, name) {
        transact(ws => store.activeDocument(ws) === null ? store.create(ws, initial(), name) : ws);
        load(activeDocument());
    }

    // Applies a change to the memory as stored right now (with this page's
    // pending edits), saves it and shows the tabs.
    function transact(change) {
        flush();
        const next = change({ ...stored(), active: active ?? stored().active });
        store.save(storage, next);
        workspace = next;
        active = next.active;
        render();
    }

    // Opens a document in a new tab, after the current one.
    function open(fields, name) {
        transact(ws => store.create(ws, fields, name));
        load(activeDocument());
    }

    // Called on every change in the editors: saved once they settle.
    function changed() {
        if (loading) return;
        dirty = true;
        clearTimeout(timer);
        timer = setTimeout(flush, AUTOSAVE_DELAY);
    }

    function flush() {
        clearTimeout(timer);
        timer = null;
        if (!dirty || active === null) return;
        dirty = false;
        let ws = stored();
        const mine = activeDocument() || { id: active, name: "Recovered" };
        const theirs = ws.tabs.find(it => it.id === active);
        // Saved meanwhile by another page: that version is kept aside.
        if (theirs && theirs.updated > seen) ws = store.stash(ws, theirs, CONFLICT);
        // Closed by another page while edited here: it comes back.
        ws = store.recover(ws, mine);
        ws = store.update(ws, active, read());
        store.save(storage, { ...ws, active });
        workspace = ws;
        seen = activeDocument().updated;
        render();
    }

    // Another page changed the memory.
    function changedElsewhere() {
        if (dirty) {
            // This page's edits go in first; they are newer.
            flush();
            return;
        }
        workspace = stored();
        const doc = activeDocument();
        if (doc === null) {
            // Closed elsewhere: this page moves to another one.
            active = workspace.tabs.length > 0 ? workspace.tabs[0].id : null;
            if (active === null) return restore(blank, null);
            load(activeDocument());
        } else if (doc.updated > seen) {
            load(doc);
        }
        render();
    }

    function select(id) {
        if (id === active) return;
        transact(ws => store.activate(ws, id));
        load(activeDocument());
    }

    function close(id) {
        const wasActive = id === active;
        transact(ws => store.close(ws, id, blank));
        if (wasActive) load(activeDocument());
    }

    function reopen(id) {
        transact(ws => store.reopen(ws, id));
        load(activeDocument());
    }

    function renameActive(name) {
        transact(ws => store.rename(ws, active, name));
    }

    function load(doc) {
        loading = true;
        try {
            show(doc);
        } finally {
            loading = false;
        }
        active = doc.id;
        seen = doc.updated;
    }

    // --- tabs and history -----------------------------------------------------

    function render() {
        tabsBox.replaceChildren(...workspace.tabs.map(tab));
        const current = tabsBox.querySelector(".doc-tab.active");
        if (current) current.scrollIntoView({ block: "nearest", inline: "nearest" });
        renderHistory();
    }

    function tab(doc) {
        const element = document.createElement("div");
        element.className = `doc-tab${doc.id === active ? " active" : ""}${doc.mode === "abstract" ? " abstract" : ""}`;
        element.setAttribute("role", "tab");
        element.setAttribute("aria-selected", `${doc.id === active}`);
        element.tabIndex = 0;
        element.title = `${doc.name}${doc.mode === "abstract" ? " (abstract)" : ""} — double click to rename`;
        const name = document.createElement("span");
        name.className = "doc-name";
        name.innerText = doc.name;
        const closer = document.createElement("button");
        closer.type = "button";
        closer.className = "doc-close";
        closer.title = "Close (it stays in the recently closed)";
        closer.setAttribute("aria-label", `Close ${doc.name}`);
        closer.innerText = "×";
        closer.addEventListener("click", event => {
            event.stopPropagation();
            close(doc.id);
        });
        element.append(name, closer);
        element.addEventListener("click", () => select(doc.id));
        element.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") select(doc.id);
        });
        // Middle click closes, as in the browsers' own tabs.
        element.addEventListener("auxclick", event => {
            if (event.button === 1) close(doc.id);
        });
        element.addEventListener("dblclick", () => startRename(element, doc));
        return element;
    }

    function startRename(element, doc) {
        select(doc.id);
        const target = [...tabsBox.children][workspace.tabs.findIndex(it => it.id === doc.id)];
        const name = target.querySelector(".doc-name");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "doc-rename";
        input.value = doc.name;
        input.setAttribute("aria-label", "Name of the theory");
        name.replaceWith(input);
        input.focus();
        input.select();
        let done = false;
        const finish = keep => {
            if (done) return;
            done = true;
            if (keep) renameActive(input.value);
            else render();
        };
        input.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") finish(true);
            if (event.key === "Escape") finish(false);
        });
        input.addEventListener("click", event => event.stopPropagation());
        input.addEventListener("blur", () => finish(true));
    }

    function renderHistory() {
        const items = workspace.closed.map(doc => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "dropdown-item doc-history-item";
            const name = document.createElement("span");
            name.className = "doc-history-name";
            name.innerText = doc.name;
            const when = document.createElement("small");
            when.className = "doc-history-when";
            when.innerText = `${doc.mode === "abstract" ? "abstract · " : ""}closed ${ago(doc.closedAt)}`;
            item.append(name, when);
            item.addEventListener("click", () => reopen(doc.id));
            return item;
        });
        const header = document.createElement("h6");
        header.className = "dropdown-header";
        header.innerText = "Recently closed";
        if (items.length === 0) {
            const empty = document.createElement("span");
            empty.className = "dropdown-item-text doc-history-empty";
            empty.innerText = "Nothing closed yet";
            historyMenu.replaceChildren(header, empty);
            return;
        }
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "dropdown-item doc-history-clear";
        clear.innerText = "Forget closed theories";
        clear.addEventListener("click", () => transact(store.clearClosed));
        const divider = document.createElement("div");
        divider.className = "dropdown-divider";
        historyMenu.replaceChildren(header, ...items, divider, clear);
    }

    return { init }
}

function ago(time) {
    const minutes = Math.round((Date.now() - time) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return new Date(time).toLocaleDateString();
}

// localStorage, or a memory that only lasts the visit when it is not usable
// (private mode, storage disabled).
function safeStorage() {
    try {
        const probe = "arg2p.probe";
        window.localStorage.setItem(probe, probe);
        window.localStorage.removeItem(probe);
        return window.localStorage;
    } catch (error) {
        const items = new Map();
        return { getItem: key => items.has(key) ? items.get(key) : null, setItem: (key, value) => items.set(key, `${value}`) };
    }
}

export default WorkspaceModule()
