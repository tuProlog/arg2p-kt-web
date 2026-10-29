import type { Storage } from './documents.js';

// What the browser keeps for the playground: its settings (the theme, the layout, the relay), and the working memory
// (see documents.ts). It may keep nothing (private mode, storage disabled, full): the playground works all the same,
// and forgets.

/** The setting [key] the browser keeps: null when it keeps none */
export function setting(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/** Keeps [value] as the setting [key], or forgets it (null): it applies all the same when the browser keeps nothing */
export function keepSetting(key: string, value: string | null): void {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        // not remembered
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
