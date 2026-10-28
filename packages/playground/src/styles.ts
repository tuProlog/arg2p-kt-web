import { css } from 'lit';

// The layout of the playground: the theory on the left, the query and its results on the right; one column on small
// screens. The colours are the custom properties of the page (index.html), which the components read too.
export const styles = css`
    :host {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        color: var(--arg2p-text);
        background: var(--page);
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

    /* the bar on top */
    .top {
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
        background: color-mix(in srgb, var(--arg2p-error) 12%, transparent);
    }

    /* menus: a summary and a list under it */
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
    details.history > summary::after {
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

    /* the tabs of the working memory */
    .tabs {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 8px 0 8px;
        border-bottom: 1px solid var(--arg2p-border);
    }
    .tab-list {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: thin;
        align-self: stretch;
    }
    .tab {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        max-width: 220px;
        padding: 4px 6px 4px 12px;
        border: 1px solid transparent;
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        cursor: pointer;
        white-space: nowrap;
        color: var(--arg2p-muted);
    }
    .tab.active {
        color: var(--arg2p-text);
        background: var(--arg2p-surface);
        border-color: var(--arg2p-border);
        margin-bottom: -1px;
        padding-bottom: 5px;
    }
    .tab .name {
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .tab .close {
        border: none;
        background: none;
        padding: 0 4px;
        color: var(--arg2p-muted);
    }
    .tab .rename {
        font: inherit;
        width: 12em;
    }
    .tabs .new,
    .tabs summary {
        border: none;
        background: none;
        padding: 2px 8px;
        display: inline-flex;
    }

    /* the theory, and the query with its results */
    main {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(240px, var(--theory)) auto minmax(320px, 1fr);
        padding: 10px;
    }
    /* what resizes two columns: a strip between them, dragged or moved with the arrows */
    .divider {
        width: 10px;
        cursor: col-resize;
        touch-action: none;
        position: relative;
        outline: none;
    }
    .divider::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 4px;
        width: 2px;
        border-radius: 1px;
        background: transparent;
        transition: background 0.15s;
    }
    .divider:hover::after,
    .divider:focus-visible::after,
    .divider.dragging::after {
        background: var(--arg2p-accent);
    }
    .theory,
    .work {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0;
        min-width: 0;
    }
    .bar {
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
    .profile {
        font-size: 12px;
        padding: 1px 8px;
        border-radius: 10px;
        color: var(--arg2p-accent);
        border: 1px solid var(--arg2p-accent);
    }
    #theory {
        flex: 1;
    }
    .query {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .prompt {
        font-family: var(--arg2p-mono);
        color: var(--arg2p-muted);
    }
    #query {
        flex: 1;
    }
    .run,
    .stop {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        padding: 6px 18px;
    }
    .run {
        color: #ffffff;
        background: var(--arg2p-accent);
        border-color: var(--arg2p-accent);
    }
    .run:hover:not(:disabled) {
        background: color-mix(in srgb, var(--arg2p-accent) 85%, black);
    }
    .stop {
        color: var(--arg2p-error);
        border-color: var(--arg2p-error);
    }
    .spinner {
        width: 12px;
        height: 12px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    @media (prefers-reduced-motion: reduce) {
        .spinner {
            animation: none;
        }
    }
    .panel-tabs {
        display: flex;
        align-items: center;
        gap: 4px;
        border-bottom: 1px solid var(--arg2p-border);
    }
    .panel-tabs > button {
        border: none;
        border-bottom: 2px solid transparent;
        border-radius: 0;
        background: none;
        color: var(--arg2p-muted);
    }
    .panel-tabs > button.active {
        color: var(--arg2p-text);
        border-bottom-color: var(--arg2p-accent);
    }
    .panel {
        flex: 1;
        min-height: 0;
    }
    .results {
        display: grid;
        grid-template-columns: minmax(180px, var(--solutions)) auto minmax(240px, 1fr);
    }
    arg2p-solutions {
        overflow: auto;
        min-height: 0;
    }
    .view {
        display: flex;
        min-height: 0;
    }
    .view > * {
        flex: 1;
        min-width: 0;
        border: 1px solid var(--arg2p-border);
        border-radius: 6px;
        overflow: hidden;
    }
    /* nothing to draw and no stages (a plain Prolog query): the solutions take the room */
    .results:has(arg2p-graph[empty]:not([hidden])) {
        grid-template-columns: 1fr;
    }
    .results:has(arg2p-graph[empty]:not([hidden])) .view,
    .results:has(arg2p-graph[empty]:not([hidden])) .divider {
        display: none;
    }
    .flags,
    .console {
        overflow: auto;
    }
    .flags-text summary {
        cursor: pointer;
        border: none;
        background: none;
        padding: 8px 0;
        color: var(--arg2p-muted);
    }
    #flags {
        height: 200px;
    }
    .console pre {
        margin: 0;
        padding: 8px;
        font-family: var(--arg2p-mono);
        font-size: 13px;
        white-space: pre-wrap;
    }

    /* the dialog of a shared link */
    dialog.share {
        color: var(--arg2p-text);
        background: var(--arg2p-surface);
        border: 1px solid var(--arg2p-border);
        border-radius: 10px;
        width: min(560px, calc(100vw - 32px));
        padding: 16px 20px;
    }
    dialog.share::backdrop {
        background: rgba(0, 0, 0, 0.4);
    }
    dialog.share h2 {
        margin: 0 0 4px 0;
        font-size: 18px;
    }
    .share-link {
        display: flex;
        gap: 8px;
    }
    .share-link input {
        flex: 1;
        min-width: 0;
        font: 13px var(--arg2p-mono);
        color: var(--arg2p-text);
        background: var(--arg2p-surface-2);
        border: 1px solid var(--arg2p-border);
        border-radius: 6px;
        padding: 6px 8px;
    }
    .share-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
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
        .divider {
            display: none;
        }
        #theory {
            height: 45vh;
        }
        .results {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        .view {
            height: 60vh;
        }
        .wide {
            display: none;
        }
    }

    /* phones: the bar on top on one line, and the menus as wide as the screen, under the bar they open from */
    @media (max-width: 600px) {
        .top {
            gap: 8px;
        }
        .top .version {
            display: none;
        }
        details.menu > summary {
            white-space: nowrap;
        }
        .top,
        .tabs,
        .bar {
            position: relative;
        }
        details.menu {
            position: static;
        }
        .menu-list,
        .menu-list.right {
            left: 8px;
            right: 8px;
            min-width: 0;
        }
    }
`;
