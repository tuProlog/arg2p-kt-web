// The working memory of the playground, like the tabs of a text editor: every
// theory the user works on is a document (its mode, theory, query, flags and
// abstract graph), kept in the browser and restored on the next visit. Closed
// documents are kept for a while too, so that they can be reopened.
//
// Plain data and pure functions: every change returns a new workspace, and
// `save`/`load` go through a storage with the interface of localStorage.
//
// Several pages may share it (browser tabs or windows): each change is made on
// the workspace as stored just before (see workspaceModule), so documents get
// ids no other page can pick too, and `active` is only the document the last
// page worked on, for the next page to start from.

const KEY = "arg2p.workspace";
const VERSION = 1;
// How many closed documents are kept, newest first.
const MAX_CLOSED = 30;
const UNTITLED = "Untitled";

function emptyWorkspace() {
    return { version: VERSION, active: null, tabs: [], closed: [] };
}

function load(storage) {
    try {
        const data = JSON.parse(storage.getItem(KEY));
        if (data && data.version === VERSION && Array.isArray(data.tabs) && Array.isArray(data.closed)) return data;
    } catch (error) {
        // Unreadable or no storage: start afresh.
    }
    return null;
}

// Whether it made it to the storage (it may be full, or disabled).
function save(storage, workspace) {
    try {
        storage.setItem(KEY, JSON.stringify(workspace));
        return true;
    } catch (error) {
        return false;
    }
}

function activeDocument(workspace) {
    return workspace.tabs.find(it => it.id === workspace.active) || null;
}

// "Untitled 1", "Untitled 2"... the first free one; any other name as it is,
// or with a number when a tab already has it.
function freeName(workspace, wanted) {
    const base = (wanted || UNTITLED).trim() || UNTITLED;
    const taken = new Set(workspace.tabs.map(it => it.name));
    if (base !== UNTITLED && !taken.has(base)) return base;
    for (let n = base === UNTITLED ? 1 : 2; ; n++) {
        const name = `${base} ${n}`;
        if (!taken.has(name)) return name;
    }
}

// Unique among pages working at the same time: time and randomness.
function newId(now = Date.now()) {
    return `d${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Opens a new document after the active one, and makes it active.
function create(workspace, fields, name, now = Date.now()) {
    const id = newId(now);
    const doc = { ...fields, id, name: freeName(workspace, name), updated: now };
    const at = workspace.tabs.findIndex(it => it.id === workspace.active);
    const tabs = workspace.tabs.slice();
    tabs.splice(at === -1 ? tabs.length : at + 1, 0, doc);
    return { ...workspace, active: id, tabs };
}

function update(workspace, id, fields, now = Date.now()) {
    return {
        ...workspace,
        tabs: workspace.tabs.map(it => it.id === id ? { ...it, ...fields, id, updated: now } : it)
    };
}

function rename(workspace, id, name) {
    const others = { ...workspace, tabs: workspace.tabs.filter(it => it.id !== id) };
    const trimmed = (name || "").trim();
    if (trimmed === "") return workspace;
    return {
        ...workspace,
        tabs: workspace.tabs.map(it => it.id === id ? { ...it, name: freeName(others, trimmed) } : it)
    };
}

function activate(workspace, id) {
    return workspace.tabs.some(it => it.id === id) ? { ...workspace, active: id } : workspace;
}

// Moves a document to the closed ones (unless it is empty), and activates its
// neighbour. The last one is replaced by an empty document made by `blank`,
// as there is always one open.
function close(workspace, id, blank, now = Date.now()) {
    const at = workspace.tabs.findIndex(it => it.id === id);
    if (at === -1) return workspace;
    const doc = workspace.tabs[at];
    const keep = !isBlank(doc);
    const closed = keep ? [{ ...doc, closedAt: now }, ...workspace.closed].slice(0, MAX_CLOSED) : workspace.closed;
    const tabs = workspace.tabs.filter(it => it.id !== id);
    let next = { ...workspace, tabs, closed };
    if (tabs.length === 0) return create({ ...next, active: null }, blank(), UNTITLED, now);
    if (workspace.active === id) next = { ...next, active: tabs[Math.min(at, tabs.length - 1)].id };
    return next;
}

// Brings a closed document back as an open one, after the active one.
function reopen(workspace, id, now = Date.now()) {
    const doc = workspace.closed.find(it => it.id === id);
    if (!doc) return workspace;
    const { closedAt, id: _, name, updated, ...fields } = doc;
    const reopened = create({ ...workspace, closed: workspace.closed.filter(it => it.id !== id) }, fields, name, now);
    // It keeps the date of its last change.
    return update(reopened, reopened.active, {}, updated);
}

// Puts a document being edited back among the open ones, when another page
// closed it meanwhile (or it is gone): it keeps its id, so the edits go on.
function recover(workspace, doc, now = Date.now()) {
    if (workspace.tabs.some(it => it.id === doc.id)) return workspace;
    const { closedAt, ...fields } = workspace.closed.find(it => it.id === doc.id) || doc;
    return {
        ...workspace,
        tabs: [...workspace.tabs, { ...fields, updated: now }],
        closed: workspace.closed.filter(it => it.id !== doc.id)
    };
}

// Keeps a version of a document among the closed ones under another name: the
// one another page saved, when this page overwrites it.
function stash(workspace, doc, suffix, now = Date.now()) {
    const copy = { ...doc, id: newId(now), name: `${doc.name} (${suffix})`, closedAt: now };
    return { ...workspace, closed: [copy, ...workspace.closed].slice(0, MAX_CLOSED) };
}

function clearClosed(workspace) {
    return { ...workspace, closed: [] };
}

// Nothing worth keeping once closed: no theory and no graph.
function isBlank(doc) {
    const graph = doc.abstractGraph;
    return (doc.theory || "").trim() === "" && (!graph || graph.arguments.length === 0);
}

export default {
    KEY, MAX_CLOSED, emptyWorkspace, load, save, activeDocument, create, update, rename, activate, close, reopen,
    recover, stash, clearClosed, isBlank, newId
}
