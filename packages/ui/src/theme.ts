import { css } from 'lit';

// The look of the components, as custom properties a page sets (the dark theme of the playground, the theme of VS Code
// in a webview): each falls back to the light theme. The colours of the labels (in, out, und) stay the same in every
// theme: they carry meaning.
export const tokens = css`
    :host {
        --_surface: var(--arg2p-surface, #ffffff);
        --_surface-2: var(--arg2p-surface-2, #f7f7f8);
        --_hover: var(--arg2p-hover, #f4fafa);
        --_border: var(--arg2p-border, #e3e3e3);
        --_text: var(--arg2p-text, #212529);
        --_muted: var(--arg2p-muted, #777777);
        --_accent: var(--arg2p-accent, #008080);
        --_in: var(--arg2p-in, #008080);
        --_out: var(--arg2p-out, #800000);
        --_und: var(--arg2p-und, #808080);
        --_unlabelled: var(--arg2p-unlabelled, #2b7ce9);
        --_support: var(--arg2p-support, #9a9a9a);
        --_no: var(--arg2p-no, #c9a400);
        --_error: var(--arg2p-error, #b00020);
        --_font: var(--arg2p-font, system-ui, sans-serif);
        --_mono: var(--arg2p-mono, ui-monospace, monospace);
        color: var(--_text);
        font-family: var(--_font);
    }
`;

const DEFAULTS: Record<string, string> = {
    in: '#008080',
    out: '#800000',
    und: '#808080',
    unlabelled: '#2b7ce9',
    support: '#9a9a9a',
};

/** The colour of [label] (in, out, und; any other is unlabelled) as [element] is styled, for what draws on a canvas */
export function labelColor(element: Element, label: string | null | undefined): string {
    const key = label === 'in' || label === 'out' || label === 'und' ? label : 'unlabelled';
    return cssColor(element, key);
}

/** The colour [name] of the tokens as [element] is styled (in, out, und, unlabelled, support) */
export function cssColor(element: Element, name: string): string {
    const value = getComputedStyle(element).getPropertyValue(`--arg2p-${name}`).trim();
    return value !== '' ? value : DEFAULTS[name] ?? '#000000';
}
