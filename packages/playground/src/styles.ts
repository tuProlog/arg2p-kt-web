import { css } from 'lit';

// The look of the playground. The colours are the custom properties of the page (index.html), which the components of
// @tuprolog/arg2p-ui read too.

/** What every part of the playground shares: its buttons, fields and links, and the text said aside */
export const controls = css`
    :host {
        color: var(--arg2p-text);
        font-family: var(--arg2p-font);
        font-size: 14px;
    }
    [hidden] {
        display: none !important;
    }
    button,
    summary {
        font: inherit;
        color: var(--arg2p-text);
        background: var(--arg2p-surface);
        border: 1px solid var(--arg2p-border);
        border-radius: 6px;
        padding: 4px 10px;
        cursor: pointer;
    }
    button:hover:not(:disabled),
    summary:hover {
        background: var(--arg2p-hover);
    }
    button:disabled {
        opacity: 0.5;
        cursor: default;
    }
    button.primary {
        color: #ffffff;
        background: var(--arg2p-accent);
        border-color: var(--arg2p-accent);
    }
    button.primary:hover:not(:disabled) {
        background: color-mix(in srgb, var(--arg2p-accent) 85%, black);
    }
    button.link {
        border: none;
        background: none;
        text-decoration: underline;
        padding: 0 4px;
    }
    button.icon {
        display: inline-flex;
        padding: 5px;
        border-color: transparent;
        background: none;
    }
    button.icon svg {
        fill: currentColor;
    }
    input[type='text'] {
        min-width: 0;
        font: 13px var(--arg2p-mono);
        color: var(--arg2p-text);
        background: var(--arg2p-surface-2);
        border: 1px solid var(--arg2p-border);
        border-radius: 6px;
        padding: 6px 8px;
    }
    a {
        color: var(--arg2p-accent);
        text-decoration: none;
    }
    .spacer {
        flex: 1;
    }
    .hint {
        color: var(--arg2p-muted);
        font-size: 13px;
    }
    .error {
        color: var(--arg2p-error);
    }
`;

/**
 * The menus: a summary, and a list under it (see Menus). On phones the list is as wide as the screen, under the bar it
 * opens from (which is positioned).
 */
export const menus = css`
    details.menu {
        position: relative;
    }
    details.menu > summary {
        list-style: none;
        user-select: none;
    }
    details.menu > summary::-webkit-details-marker {
        display: none;
    }
    details.menu > summary::after {
        content: ' ▾';
        font-size: 11px;
        color: var(--arg2p-muted);
    }
    details.menu.bare > summary::after {
        content: none;
    }
    .menu-list {
        position: absolute;
        z-index: 30;
        top: calc(100% + 4px);
        left: 0;
        min-width: 220px;
        max-height: 70vh;
        overflow: auto;
        display: flex;
        flex-direction: column;
        padding: 4px 0;
        background: var(--arg2p-surface);
        border: 1px solid var(--arg2p-border);
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    }
    .menu-list.right {
        left: auto;
        right: 0;
    }
    .menu-list button {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        border: none;
        border-radius: 0;
        background: none;
        padding: 6px 14px;
    }
    .menu-list button:hover:not(:disabled) {
        background: var(--arg2p-hover);
    }
    .menu-list small,
    .menu-empty {
        color: var(--arg2p-muted);
        font-size: 12px;
    }
    .menu-empty {
        padding: 6px 14px;
    }
    .menu-header {
        padding: 6px 14px 2px 14px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--arg2p-muted);
    }
    .menu-list hr {
        border: none;
        border-top: 1px solid var(--arg2p-border);
        margin: 4px 0;
        width: 100%;
    }
    @media (max-width: 600px) {
        details.menu {
            position: static;
        }
        details.menu > summary {
            white-space: nowrap;
        }
        .menu-list,
        .menu-list.right {
            left: 8px;
            right: 8px;
            min-width: 0;
        }
    }
`;

/** The dialogs: a card over the page, dimmed */
export const dialogs = css`
    dialog {
        color: var(--arg2p-text);
        background: var(--arg2p-surface);
        border: 1px solid var(--arg2p-border);
        border-radius: 10px;
        width: min(560px, calc(100vw - 32px));
        padding: 16px 20px;
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
    }
    dialog h2 {
        margin: 0 0 4px 0;
        font-size: 18px;
    }
    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
    }
`;

// The layout of the playground: the theory on the left, its solver on the right; one column on small screens
const layout = css`
    :host {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        background: var(--page);
    }

    /* the bar on top */
    .top {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 12px;
        border-bottom: 1px solid var(--arg2p-border);
        background: var(--arg2p-surface-2);
    }
    .brand {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 16px;
        color: var(--arg2p-text);
    }
    .brand span {
        font-weight: 400;
        color: var(--arg2p-muted);
    }
    .version {
        font-size: 12px;
        color: var(--arg2p-muted);
        font-variant-numeric: tabular-nums;
    }
    .notice {
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 6px 12px;
        font-size: 13px;
        background: color-mix(in srgb, var(--arg2p-accent) 12%, transparent);
    }
    .notice.error {
        color: inherit;
        background: color-mix(in srgb, var(--arg2p-error) 12%, transparent);
    }
    .notice span {
        flex: 1;
    }

    /* the theory, and its solver */
    main {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(240px, var(--theory)) auto minmax(320px, 1fr);
        padding: 10px;
    }
    .theory {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0;
        min-width: 0;
    }
    .bar {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    .bar button,
    .bar summary {
        padding: 2px 10px;
        font-size: 13px;
    }
    .title {
        font-weight: 600;
    }
    #theory {
        flex: 1;
    }
    arg2p-solver {
        min-width: 0;
        min-height: 0;
    }

    /* the switch between the solver of the page and the parallel one, among the actions of the solver */
    .mode {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--arg2p-muted);
        cursor: pointer;
        padding: 2px 4px;
    }
    .mode input {
        accent-color: var(--arg2p-accent);
        margin: 0;
    }
    .mode.on {
        color: var(--arg2p-accent);
    }

    /* small screens: one column, the theory first */
    @media (max-width: 900px) {
        :host {
            height: auto;
            min-height: 100dvh;
        }
        main {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        main > arg2p-divider {
            display: none;
        }
        #theory {
            height: 45vh;
        }
        arg2p-solver {
            height: max(560px, 85dvh);
        }
        .wide {
            display: none;
        }
    }

    /* phones: the bar on top on one line, and the solver as tall as what it shows (its graph under the solutions) */
    @media (max-width: 600px) {
        .top {
            gap: 8px;
        }
        .top .version {
            display: none;
        }
        arg2p-solver {
            height: auto;
        }
    }
`;

/** The playground */
export const styles = [controls, menus, dialogs, layout];
