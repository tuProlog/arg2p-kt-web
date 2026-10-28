import cytoscape, { type Core, type StylesheetJson } from 'cytoscape';

// What the components draw on: a Cytoscape instance in their container. Where nothing can be drawn (no canvas, as in
// a simulated DOM), it is headless: it keeps the elements, their positions and their events alike, and draws nothing.

// The font the nodes are written in, and how their size follows from what they say
export const NODE_FONT = { family: 'arial, sans-serif', size: 14 };
const LINE_HEIGHT = 20;
const PADDING_X = 24;
const PADDING_Y = 14;
const CHARACTER_WIDTH = 8;

let measure: CanvasRenderingContext2D | null | undefined;

function canvas(): CanvasRenderingContext2D | null {
    if (measure === undefined) {
        try {
            measure = document.createElement('canvas').getContext('2d');
        } catch {
            measure = null;
        }
        if (measure) measure.font = `${NODE_FONT.size}px ${NODE_FONT.family}`;
    }
    return measure;
}

/** A Cytoscape instance drawing in [container], or a headless one where nothing can be drawn */
export function drawing(container: HTMLElement, style: StylesheetJson): Core {
    const headless = canvas() === null;
    return cytoscape({
        ...(headless ? { headless: true, styleEnabled: true } : { container }),
        style,
        minZoom: 0.1,
        maxZoom: 4,
    });
}

// A small drawing fitted to its area is not blown up past this zoom
const FIT_ZOOM = 1.25;

/** [cy] fitted to its area, no closer than FIT_ZOOM */
export function fit(cy: Core): void {
    cy.fit(undefined, 30);
    if (cy.zoom() > FIT_ZOOM) {
        cy.zoom(FIT_ZOOM);
        cy.center();
    }
}

/** The size of an ellipse that holds [label] (lines split at \n) */
export function nodeSize(label: string): { width: number; height: number } {
    const lines = label.split('\n');
    const context = canvas();
    const text = Math.max(...lines.map(it => context?.measureText(it).width ?? it.length * CHARACTER_WIDTH));
    const height = lines.length * LINE_HEIGHT + PADDING_Y * 2;
    return { width: Math.max(height, text + PADDING_X * 2), height };
}

/** The whole drawing as a PNG picture, as a data URL, on [background] */
export function png(cy: Core, background: string): string {
    if (cy.container() === null) return '';
    return cy.png({ full: true, bg: background, scale: 2, output: 'base64uri' });
}

/**
 * Keeps [cy] the size of [container] (a page may hide it, or lay it out again), fitting the drawing once it is shown
 * after being hidden. Gives what stops it.
 */
export function followSize(cy: Core, container: HTMLElement): () => void {
    if (typeof ResizeObserver === 'undefined' || cy.container() === null) return () => {};
    let hidden = container.clientWidth === 0 || container.clientHeight === 0;
    const observer = new ResizeObserver(() => {
        const nowHidden = container.clientWidth === 0 || container.clientHeight === 0;
        cy.resize();
        if (hidden && !nowHidden && cy.elements().nonempty()) fit(cy);
        hidden = nowHidden;
    });
    observer.observe(container);
    return () => observer.disconnect();
}
