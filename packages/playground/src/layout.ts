import { LitElement, css } from 'lit';
import { keepSetting, setting } from './storage.js';

// The layout of the playground as the user resizes it: the widths of its columns, kept by the browser, and the
// dividers that resize them

/** The widths of the columns, in percent of their container: the theory, and the solutions beside the graph */
export interface Layout {
    readonly theory: number;
    readonly solutions: number;
}

const SETTING = 'arg2p.layout';
const MIN = 15;
const MAX = 80;

/** The layout of last time, or the default one */
export function loadLayout(): Layout {
    const layout = { theory: 40, solutions: 30 };
    try {
        const stored = JSON.parse(setting(SETTING) ?? '{}') as Partial<Layout>;
        if (typeof stored.theory === 'number') layout.theory = stored.theory;
        if (typeof stored.solutions === 'number') layout.solutions = stored.solutions;
    } catch {
        // unreadable: the default layout
    }
    return layout;
}

export function saveLayout(layout: Layout): void {
    keepSetting(SETTING, JSON.stringify(layout));
}

/**
 * A divider between two columns, dragged (or moved with the arrows) to share the width of its parent between them:
 * `value` is the share of the first one, in percent. Event: `arg2p-resize` {value} as it is moved.
 */
export class Arg2pDivider extends LitElement {
    static override properties = {
        value: { type: Number },
        label: {},
    };

    value = 50;
    /** What it resizes, for readers of the screen */
    label = '';

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute('role', 'separator');
        this.setAttribute('aria-orientation', 'vertical');
        this.tabIndex = 0;
        this.title = 'Drag to resize';
        this.addEventListener('pointerdown', this.dragged);
        this.addEventListener('keydown', this.moved);
    }

    protected override willUpdate(): void {
        this.setAttribute('aria-label', this.label);
        this.setAttribute('aria-valuenow', `${Math.round(this.value)}`);
    }

    private set(value: number): void {
        const clamped = Math.min(MAX, Math.max(MIN, value));
        this.dispatchEvent(new CustomEvent('arg2p-resize', { detail: { value: clamped }, bubbles: true, composed: true }));
    }

    private readonly dragged = (e: PointerEvent): void => {
        this.setPointerCapture(e.pointerId);
        this.toggleAttribute('dragging', true);
        const move = (event: PointerEvent) => {
            const box = this.parentElement!.getBoundingClientRect();
            this.set(((event.clientX - box.left) / box.width) * 100);
        };
        const done = () => {
            this.toggleAttribute('dragging', false);
            this.removeEventListener('pointermove', move);
            this.removeEventListener('pointerup', done);
            this.removeEventListener('pointercancel', done);
        };
        this.addEventListener('pointermove', move);
        this.addEventListener('pointerup', done);
        this.addEventListener('pointercancel', done);
        e.preventDefault();
    };

    private readonly moved = (e: KeyboardEvent): void => {
        if (e.key === 'ArrowLeft') this.set(this.value - 2);
        else if (e.key === 'ArrowRight') this.set(this.value + 2);
    };

    static override styles = css`
        /* a strip between the columns, its line shown as it is pointed at, focused or dragged */
        :host {
            display: block;
            width: 10px;
            cursor: col-resize;
            touch-action: none;
            position: relative;
            outline: none;
        }
        :host::after {
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
        :host(:hover)::after,
        :host(:focus-visible)::after,
        :host([dragging])::after {
            background: var(--arg2p-accent);
        }
    `;
}

customElements.define('arg2p-divider', Arg2pDivider);

declare global {
    interface HTMLElementTagNameMap {
        'arg2p-divider': Arg2pDivider;
    }
}
