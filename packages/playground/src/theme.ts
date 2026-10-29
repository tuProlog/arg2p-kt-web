// Light or dark: the system's choice, until the toggle picks one (remembered by the browser). index.html applies it
// before the page is drawn; this keeps it up to date.

import { keepSetting, setting } from './storage.js';

const SETTING = 'arg2p.theme';
// the colour of the window of the installed app
const CHROME = { light: '#f8f9fa', dark: '#1f2125' };

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme]);
    document.dispatchEvent(new CustomEvent('arg2p-theme', { detail: { theme } }));
}

function stored(): Theme | null {
    const theme = setting(SETTING);
    return theme === 'light' || theme === 'dark' ? theme : null;
}

/** Switches to the other theme, and remembers it */
export function toggleTheme(): void {
    const theme = currentTheme() === 'dark' ? 'light' : 'dark';
    keepSetting(SETTING, theme);
    apply(theme);
}

/** Follows the system while no theme is picked */
export function followSystem(): void {
    apply(currentTheme());
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (stored() === null) apply(event.matches ? 'dark' : 'light');
    });
}
