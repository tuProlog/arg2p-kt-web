// A compact layered drawing of an argument graph: every argument on the row of
// its level (facts at the bottom), each one close to the arguments it is linked
// to, and never closer than `spacing` to its neighbours on the row.
//
// `levels` maps every id to its row, `links` are the supports ({ from, to },
// from a sub-argument to the argument built on it) and `attacks` the attacks.
// Supports decide the rows and pull hardest; attacks pull too, more lightly,
// so that attackers sit near what they attack. Returns id -> { x, y }.
//
// Options:
//  - spacing, levelSeparation: the room per node and between rows;
//  - sizes: id -> { width, height } of the drawn nodes. With it, neighbours are
//    kept `gap` apart edge to edge and rows make room for tall nodes; without
//    it every node takes `spacing`;
//  - aspect: height / width of the area the drawing is shown in. Rows are moved
//    apart so the drawing fills it instead of being a thin strip;
//  - staggerFrom: rows with more nodes than this are drawn zig-zag (every other
//    node a bit lower), which lets them pack about twice as tight.

const SWEEPS = 4;
const ATTACK_WEIGHT = 0.4;
const STAGGER_SQUEEZE = 0.55;
const STAGGER_DROP = 0.4;
const MAX_STRETCH = 2.4;
// Free room left above and below a row, for the edges.
const ROW_GAP = 40;

function layeredLayout(levels, links, options = {}) {
    const {
        spacing = 110,
        levelSeparation = 110,
        attacks = [],
        aspect = null,
        staggerFrom = 8,
        sizes = null,
        gap = 18
    } = options;
    const size = id => (sizes && sizes.get(id)) || { width: 0, height: 0 };
    const metrics = { spacing, levelSeparation, staggerFrom, size, sized: sizes !== null, gap };

    // Separate parts of the graph are laid out on their own and then put side
    // by side, largest first, so that none of them drifts away from the others.
    const positions = new Map();
    let offset = 0;
    components(levels, [...links, ...attacks]).forEach(ids => {
        const part = layoutComponent(ids, levels, links, attacks, metrics);
        const left = Math.min(...ids.map(id => part.get(id).x - size(id).width / 2));
        const right = Math.max(...ids.map(id => part.get(id).x + size(id).width / 2));
        part.forEach((point, id) => positions.set(id, { x: point.x - left + offset, y: point.y }));
        offset += right - left + (sizes ? gap * 2 : spacing);
    });

    if (aspect !== null && positions.size > 1) stretchRows(positions, aspect);
    return positions;
}

function layoutComponent(ids, levels, links, attacks, metrics) {
    const { spacing, levelSeparation, staggerFrom, size, sized, gap } = metrics;
    const inside = new Set(ids);
    const rows = [];
    ids.forEach(id => {
        const level = levels.get(id);
        (rows[level] = rows[level] || []).push(id);
    });
    for (let i = 0; i < rows.length; i++) rows[i] = (rows[i] || []).sort(byNumber);
    const staggered = rows.map(row => row.length > staggerFrom);
    // The least distance between the centres of two neighbours on a row: by
    // their widths when known. On a zig-zag row, next neighbours sit at
    // different heights and may come closer; the ones after them may not.
    const apart = (a, b) => sized ? (size(a).width + size(b).width) / 2 + gap : spacing;
    const rowDistances = rows.map((row, level) => staggered[level]
        ? { next: (a, b) => apart(a, b) * STAGGER_SQUEEZE, second: apart }
        : { next: apart, second: null });

    const own = list => list.filter(it => inside.has(it.from) && inside.has(it.to));
    const supportsBelow = neighbours(own(links), "to", "from");
    const supportsAbove = neighbours(own(links), "from", "to");
    // Attacks pull both ways, whatever row their ends are on.
    const attacked = [...neighbours(own(attacks), "from", "to"), ...neighbours(own(attacks), "to", "from")]
        .reduce((map, [id, list]) => map.set(id, [...(map.get(id) || []), ...list]), new Map());

    // Start from evenly spaced rows, then alternately place every row by the
    // one below (sub-arguments) and the one above (what it supports).
    const x = new Map();
    rows.forEach(row => row.forEach((id, i) => x.set(id, i * spacing)));
    for (let sweep = 0; sweep < SWEEPS; sweep++) {
        for (let level = 1; level < rows.length; level++) placeRow(rows[level], supportsBelow, attacked, x, rowDistances[level]);
        for (let level = rows.length - 2; level >= 0; level--) placeRow(rows[level], supportsAbove, attacked, x, rowDistances[level]);
    }
    for (let level = 1; level < rows.length; level++) placeRow(rows[level], supportsBelow, attacked, x, rowDistances[level]);

    // Rows from the bottom up: a zig-zag row drops every other node by enough
    // for the two halves not to overlap, and rows are kept apart by their
    // heights (and at least levelSeparation).
    const tallest = row => Math.max(0, ...row.map(id => size(id).height));
    const drops = rows.map((row, level) => staggered[level]
        ? Math.max(levelSeparation * STAGGER_DROP, sized ? tallest(row) + gap / 2 : 0)
        : 0);
    const positions = new Map();
    let y = 0;
    rows.forEach((row, level) => {
        if (level > 0) {
            const below = tallest(rows[level - 1]) / 2 + drops[level - 1];
            const above = tallest(row) / 2;
            y -= Math.max(levelSeparation, below + above + (sized ? ROW_GAP : 0) + drops[level]);
        }
        row.slice().sort((a, b) => x.get(a) - x.get(b)).forEach((id, i) => positions.set(id, {
            x: x.get(id),
            y: y + (staggered[level] && i % 2 === 1 ? drops[level] : 0)
        }));
    });
    return positions;
}

// Moves the rows apart (never closer) until the drawing has the proportions of
// the area it is shown in, up to MAX_STRETCH times the normal separation.
function stretchRows(positions, aspect) {
    const xs = [...positions.values()].map(it => it.x);
    const ys = [...positions.values()].map(it => it.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    if (height === 0 || width === 0) return;
    const stretch = Math.min(MAX_STRETCH, Math.max(1, (aspect * width) / height));
    positions.forEach(point => { point.y *= stretch; });
}

// Connected parts of the graph, largest first (ties: lowest argument first).
function components(levels, edges) {
    const parent = new Map([...levels.keys()].map(id => [id, id]));
    const find = id => parent.get(id) === id ? id : (parent.set(id, find(parent.get(id))), parent.get(id));
    edges.forEach(it => {
        if (parent.has(it.from) && parent.has(it.to)) parent.set(find(it.from), find(it.to));
    });
    const groups = new Map();
    [...levels.keys()].sort(byNumber).forEach(id => {
        const root = find(id);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(id);
    });
    return [...groups.values()].sort((a, b) => b.length - a.length || byNumber(a[0], b[0]));
}

function neighbours(links, key, value) {
    const map = new Map();
    links.forEach(link => {
        if (!map.has(link[key])) map.set(link[key], []);
        map.get(link[key]).push(link[value]);
    });
    return map;
}

// Orders a row by where its nodes would like to be (the weighted mean x of the
// nodes they are linked to, or where they are when they have none), then
// places them left to right no closer than `distances` allow, and shifts the
// row back so that, on average, nodes are where they wanted to be.
function placeRow(row, supports, attacks, x, distances) {
    if (row.length === 0) return;
    const wanted = new Map(row.map(id => {
        const pulls = [
            ...(supports.get(id) || []).filter(it => x.has(it)).map(it => [x.get(it), 1]),
            ...(attacks.get(id) || []).filter(it => x.has(it)).map(it => [x.get(it), ATTACK_WEIGHT])
        ];
        const weight = pulls.reduce((sum, [, w]) => sum + w, 0);
        return [id, weight > 0 ? pulls.reduce((sum, [at, w]) => sum + at * w, 0) / weight : x.get(id)];
    }));
    row.sort((a, b) => wanted.get(a) - wanted.get(b) || byNumber(a, b));
    const placed = [];
    row.forEach((id, i) => {
        let at = wanted.get(id);
        if (i > 0) at = Math.max(at, placed[i - 1] + distances.next(row[i - 1], id));
        if (i > 1 && distances.second) at = Math.max(at, placed[i - 2] + distances.second(row[i - 2], id));
        placed.push(at);
    });
    const shift = mean(row.map((id, i) => wanted.get(id) - placed[i]));
    row.forEach((id, i) => x.set(id, placed[i] + shift));
}

function mean(values) {
    return values.reduce((sum, it) => sum + it, 0) / values.length;
}

// A2 before A10.
function byNumber(a, b) {
    return parseInt(a.substring(1)) - parseInt(b.substring(1)) || a.localeCompare(b);
}

export { layeredLayout }
