import type { Core, NodeSingular } from 'cytoscape';

// The places of the arguments of an abstract framework, by their names: the drawing of a framework and its graph are
// two ways of working on the same graph, so each places the arguments where the other has them.

/** Where each argument is, by its name */
export type Positions = Readonly<Record<string, { readonly x: number; readonly y: number }>>;

/**
 * The nodes of [cy] placed where [positions] has them (by [nameOf]), the others laid out around them by forces (all of
 * them anew when none is known). Whether any had to be laid out.
 */
export function placeByName(cy: Core, nameOf: (node: NodeSingular) => string, positions: Positions | null): boolean {
    const nodes = cy.nodes();
    const known = nodes.filter(it => positions?.[nameOf(it)] !== undefined);
    const unknown = nodes.not(known);
    cy.batch(() => known.forEach(it => void it.position({ ...positions![nameOf(it)] })));
    if (unknown.empty()) return false;
    if (known.empty()) {
        cy.layout({ name: 'cose', animate: false, randomize: true, fit: false }).run();
        return true;
    }
    // the new ones start next to the arguments they are linked to, and only they move
    unknown.forEach(node => {
        const around = node.neighborhood('node').intersection(known);
        const centre = around.nonempty() ? around.boundingBox() : known.boundingBox();
        node.position({ x: (centre.x1 + centre.x2) / 2 + (Math.random() - 0.5) * 60, y: (centre.y1 + centre.y2) / 2 + (Math.random() - 0.5) * 60 });
    });
    known.lock();
    cy.layout({ name: 'cose', animate: false, randomize: false, fit: false }).run();
    known.unlock();
    return true;
}

/** Where the nodes of [cy] are, by [nameOf] */
export function positionsOf(cy: Core, nameOf: (node: NodeSingular) => string): Positions {
    return Object.fromEntries(cy.nodes().map(it => [nameOf(it), { ...it.position() }]));
}

/** The edges of [cy] whose reverse is there too, as mutual attacks: they bend apart, so that both show */
export function markMutual(cy: Core): void {
    cy.batch(() =>
        cy.edges().forEach(edge => {
            const reverse = cy.getElementById(`${edge.data('target')}->${edge.data('source')}`);
            edge.toggleClass('mutual', reverse.nonempty() && !edge.hasClass('support'));
        }),
    );
}

/** The style of mutual attacks: each bends to its own side, so that they do not overlap */
export const MUTUAL_STYLE = {
    selector: 'edge.mutual',
    style: { 'curve-style': 'unbundled-bezier', 'control-point-distances': 32, 'control-point-weights': 0.5 },
} as const;
