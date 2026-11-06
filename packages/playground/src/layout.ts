import { LitElement, css } from 'lit';
import { keepSetting, setting } from './storage.js';

// The layout of the playground as the user resizes it: the widths of its columns, kept by the browser, and the
// dividers that resize them

/**
 * The widths of the columns, in percent of their container: the theory, and the solutions beside the graph; and the
 * height of the text the theory formalizes, in percent of the column of the theory, when shown above it
 */
export interface Layout {
    readonly theory: number;
    readonly solutions: number;
    readonly text: number;
}

const SETTING = 'arg2p.layout';
const MIN = 15;
const MAX = 80;

/** The layout of last time, or the default one */
export function loadLayout(): Layout {
    const layout = { theory: 40, solutions: 30, text: 40 };
    try {
        const stored = JSON.parse(setting(SETTING) ?? '{}') as Partial<Layout>;
        if (typeof stored.theory === 'number') layout.theory = stored.theory;
        if (typeof stored.solutions === 'number') layout.solutions = stored.solutions;
        if (typeof stored.text === 'number') layout.text = stored.text;
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
 * `value` is the share of the first one, in percent; between two rows (`orientation` horizontal), it shares the height
 * of its parent. Event: `arg2p-resize` {value} as it is moved.
 */
export class Arg2pDivider extends LitElement {
    static override properties = {
        value: { type: Number },
        label: {},
        orientation: { reflect: true },
    };

    value = 50;
    /** What it resizes, for readers of the screen */
    label = '';
    /** vertical, between columns; horizontal, between rows */
    orientation: 'vertical' | 'horizontal' = 'vertical';

    override connectedCallback(): void {
        super.connectedCallback();
        this.setAttribute('role', 'separator');
        this.tabIndex = 0;
        this.title = 'Drag to resize';
        this.addEventListener('pointerdown', this.dragged);
        this.addEventListener('keydown', this.moved);
    }

    protected override willUpdate(): void {
        this.setAttribute('aria-label', this.label);
        this.setAttribute('aria-orientation', this.orientation);
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
            this.set(this.orientation === 'horizontal' ? ((event.clientY - box.top) / box.height) * 100 : ((event.clientX - box.left) / box.width) * 100);
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
        const [less, more] = this.orientation === 'horizontal' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
        if (e.key === less) this.set(this.value - 2);
        else if (e.key === more) this.set(this.value + 2);
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
        :host([orientation='horizontal']) {
            width: auto;
            height: 10px;
            cursor: row-resize;
        }
        :host([orientation='horizontal'])::after {
            top: 4px;
            bottom: auto;
            left: 0;
            right: 0;
            width: auto;
            height: 2px;
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
