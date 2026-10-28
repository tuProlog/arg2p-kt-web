import { DEFAULT_FLAGS, toTheory, type Framework } from '@tuprolog/arg2p-ui/data';

// The working memory of the playground, like the tabs of a text editor: every theory worked on is a document (its
// theory, query and flags), kept in the browser and restored on the next visit. Closed documents are kept for a while
// too, so that they can be reopened.
//
// Plain data and pure functions: every change returns a new workspace, and `save`/`load` go through a storage with
// the interface of localStorage.
//
// Several pages may share it (browser tabs or windows): each change is made on the workspace as stored just before
// (see session.ts), so documents get ids no other page can pick too, and `active` is only the document the last page
// worked on, for the next page to start from.

export const KEY = 'arg2p.workspace';
const VERSION = 2;
/** How many closed documents are kept, newest first */
export const MAX_CLOSED = 30;
const UNTITLED = 'Untitled';

/** The query a new document starts with: the labelling of the statements */
export const DEFAULT_QUERY = 'buildLabelSets(In, Out, Und)';

export interface Content {
    readonly theory: string;
    readonly query: string;
    readonly flags: string;
}

export interface Doc extends Content {
    readonly id: string;
    readonly name: string;
    readonly updated: number;
}

export interface ClosedDoc extends Doc {
    readonly closedAt: number;
}

export interface Workspace {
    readonly version: typeof VERSION;
    readonly active: string | null;
    readonly tabs: readonly Doc[];
    readonly closed: readonly ClosedDoc[];
}

export interface Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export function blank(): Content {
    return { theory: '', query: DEFAULT_QUERY, flags: DEFAULT_FLAGS };
}

export function emptyWorkspace(): Workspace {
    return { version: VERSION, active: null, tabs: [], closed: [] };
}

/** The workspace [storage] keeps (one of version 1 brought up to date), or null when there is none it can read */
export function load(storage: Storage): Workspace | null {
    try {
        const data = JSON.parse(storage.getItem(KEY) ?? 'null') as { version?: number; tabs?: unknown; closed?: unknown } | null;
        if (data === null || !Array.isArray(data.tabs) || !Array.isArray(data.closed)) return null;
        if (data.version === VERSION) return data as Workspace;
        if (data.version === 1) return migrated(data as unknown as LegacyWorkspace);
    } catch {
        // unreadable, or no storage: start afresh
    }
    return null;
}

/** Whether [workspace] made it to [storage] (it may be full, or disabled) */
export function save(storage: Storage, workspace: Workspace): boolean {
    try {
        storage.setItem(KEY, JSON.stringify(workspace));
        return true;
    } catch {
        return false;
    }
}

export function activeDocument(workspace: Workspace): Doc | null {
    return workspace.tabs.find(it => it.id === workspace.active) ?? null;
}

// "Untitled 1", "Untitled 2"... the first free one; any other name as it is, or with a number when a tab has it
function freeName(workspace: Workspace, wanted: string | null | undefined): string {
    const base = (wanted ?? UNTITLED).trim() || UNTITLED;
    const taken = new Set(workspace.tabs.map(it => it.name));
    if (base !== UNTITLED && !taken.has(base)) return base;
    for (let n = base === UNTITLED ? 1 : 2; ; n++) {
        const name = `${base} ${n}`;
        if (!taken.has(name)) return name;
    }
}

/** An id no other page working at the same time picks: time and randomness */
export function newId(now = Date.now()): string {
    return `d${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** [workspace] with a new document after the active one, active */
export function create(workspace: Workspace, content: Content, name?: string | null, now = Date.now()): Workspace {
    const id = newId(now);
    const doc: Doc = { theory: content.theory, query: content.query, flags: content.flags, id, name: freeName(workspace, name), updated: now };
    const at = workspace.tabs.findIndex(it => it.id === workspace.active);
    const tabs = workspace.tabs.slice();
    tabs.splice(at === -1 ? tabs.length : at + 1, 0, doc);
    return { ...workspace, active: id, tabs };
}

export function update(workspace: Workspace, id: string, content: Partial<Content>, now = Date.now()): Workspace {
    return { ...workspace, tabs: workspace.tabs.map(it => (it.id === id ? { ...it, ...content, id, updated: now } : it)) };
}

export function rename(workspace: Workspace, id: string, name: string): Workspace {
    const trimmed = name.trim();
    if (trimmed === '') return workspace;
    const others = { ...workspace, tabs: workspace.tabs.filter(it => it.id !== id) };
    return { ...workspace, tabs: workspace.tabs.map(it => (it.id === id ? { ...it, name: freeName(others, trimmed) } : it)) };
}

export function activate(workspace: Workspace, id: string): Workspace {
    return workspace.tabs.some(it => it.id === id) ? { ...workspace, active: id } : workspace;
}

/**
 * [workspace] with the document [id] among the closed ones (unless it is blank), its neighbour active. The last one is
 * replaced by a blank document, as there is always one open.
 */
export function close(workspace: Workspace, id: string, now = Date.now()): Workspace {
    const at = workspace.tabs.findIndex(it => it.id === id);
    if (at === -1) return workspace;
    const doc = workspace.tabs[at];
    const closed = isBlank(doc) ? workspace.closed : [{ ...doc, closedAt: now }, ...workspace.closed].slice(0, MAX_CLOSED);
    const tabs = workspace.tabs.filter(it => it.id !== id);
    const next = { ...workspace, tabs, closed };
    if (tabs.length === 0) return create({ ...next, active: null }, blank(), UNTITLED, now);
    return workspace.active === id ? { ...next, active: tabs[Math.min(at, tabs.length - 1)].id } : next;
}

/** [workspace] with the closed document [id] open again, after the active one, with the date of its last change */
export function reopen(workspace: Workspace, id: string, now = Date.now()): Workspace {
    const doc = workspace.closed.find(it => it.id === id);
    if (doc === undefined) return workspace;
    const reopened = create({ ...workspace, closed: workspace.closed.filter(it => it.id !== id) }, doc, doc.name, now);
    return update(reopened, reopened.active!, {}, doc.updated);
}

/**
 * [workspace] with [doc], being edited, among the open documents again, when another page closed it meanwhile (or it is
 * gone): it keeps its id, so the edits go on
 */
export function recover(workspace: Workspace, doc: Doc, now = Date.now()): Workspace {
    if (workspace.tabs.some(it => it.id === doc.id)) return workspace;
    const { closedAt: _, ...fields } = workspace.closed.find(it => it.id === doc.id) ?? { ...doc, closedAt: 0 };
    return { ...workspace, tabs: [...workspace.tabs, { ...fields, updated: now }], closed: workspace.closed.filter(it => it.id !== doc.id) };
}

/** [workspace] keeping a version of [doc] among the closed ones under another name: the one another page saved */
export function stash(workspace: Workspace, doc: Doc, suffix: string, now = Date.now()): Workspace {
    const copy: ClosedDoc = { ...doc, id: newId(now), name: `${doc.name} (${suffix})`, closedAt: now };
    return { ...workspace, closed: [copy, ...workspace.closed].slice(0, MAX_CLOSED) };
}

export function clearClosed(workspace: Workspace): Workspace {
    return { ...workspace, closed: [] };
}

/** Whether [doc] has nothing worth keeping once closed: no theory */
export function isBlank(doc: Content): boolean {
    return doc.theory.trim() === '';
}

// --- version 1 -------------------------------------------------------------------------------------------------------

// Version 1 had two modes: a structured theory, or an abstract framework drawn (with no theory), solved in the only
// profile there was then, standard_af
interface LegacyDoc {
    id: string;
    name: string;
    updated: number;
    closedAt?: number;
    mode?: string;
    theory?: string;
    query?: string;
    flags?: string;
    abstractGraph?: Framework | null;
}

interface LegacyWorkspace {
    active: string | null;
    tabs: LegacyDoc[];
    closed: LegacyDoc[];
}

/** The content of a document of version 1: a framework drawn becomes a theory of the profile abstract */
export function migratedContent(doc: Omit<LegacyDoc, 'id' | 'name' | 'updated'>): Content {
    const abstract = doc.mode === 'abstract';
    return {
        theory: abstract ? (doc.abstractGraph && doc.abstractGraph.arguments.length > 0 ? toTheory(doc.abstractGraph) : '') : (doc.theory ?? ''),
        query: abstract || !doc.query ? DEFAULT_QUERY : doc.query,
        flags: migratedFlags(doc.flags ?? DEFAULT_FLAGS),
    };
}

/** Flags of version 1: standard_af, the only graphBuildMode then, is no profile, and its flag goes */
export function migratedFlags(flags: string): string {
    return flags.replace(/^[ \t]*graphBuildMode\(\s*standard_af\s*\)\s*\.[ \t]*(%.*)?\r?\n?/gm, '');
}

function migrated(legacy: LegacyWorkspace): Workspace {
    const doc = (it: LegacyDoc): Doc => ({ id: it.id, name: it.name, updated: it.updated, ...migratedContent(it) });
    return {
        version: VERSION,
        active: legacy.active,
        tabs: legacy.tabs.map(doc),
        closed: legacy.closed.map(it => ({ ...doc(it), closedAt: it.closedAt ?? it.updated })),
    };
}
