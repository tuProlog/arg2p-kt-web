// A compact layered drawing of an argument graph: every argument on the row of
// its level (facts at the bottom), each one as close as possible to the middle
// of the arguments it is linked to by supports, and never closer than
// `spacing` to its neighbours on the row.
//
// `levels` maps every id to its row, `links` are the supports ({ from, to },
// from a sub-argument to the argument built on it). Returns id -> { x, y }.

const SWEEPS = 3;

function layeredLayout(levels, links, { spacing = 110, levelSeparation = 110 } = {}) {
    const rows = [];
    levels.forEach((level, id) => {
        (rows[level] = rows[level] || []).push(id);
    });
    for (let i = 0; i < rows.length; i++) rows[i] = (rows[i] || []).sort(byNumber);

    const below = neighbours(links, "to", "from");
    const above = neighbours(links, "from", "to");

    // Start from evenly spaced rows, then alternately pull every row towards
    // the one below (sub-arguments) and the one above (what they support).
    const x = new Map();
    rows.forEach(row => row.forEach((id, i) => x.set(id, i * spacing)));
    for (let sweep = 0; sweep < SWEEPS; sweep++) {
        for (let level = 1; level < rows.length; level++) placeRow(rows[level], below, x, spacing);
        for (let level = rows.length - 2; level >= 0; level--) placeRow(rows[level], above, x, spacing);
    }
    for (let level = 1; level < rows.length; level++) placeRow(rows[level], below, x, spacing);

    const positions = new Map();
    levels.forEach((level, id) => positions.set(id, { x: x.get(id), y: -level * levelSeparation }));
    return positions;
}

function neighbours(links, key, value) {
    const map = new Map();
    links.forEach(link => {
        if (!map.has(link[key])) map.set(link[key], []);
        map.get(link[key]).push(link[value]);
    });
    return map;
}

// Orders a row by where its nodes would like to be (the mean x of their
// neighbours, or where they are when they have none), then places them left
// to right at least `spacing` apart, and shifts the row back so that, on
// average, nodes are where they wanted to be.
function placeRow(row, links, x, spacing) {
    if (row.length === 0) return;
    const wanted = new Map(row.map(id => {
        const linked = (links.get(id) || []).filter(it => x.has(it));
        return [id, linked.length > 0 ? mean(linked.map(it => x.get(it))) : x.get(id)];
    }));
    row.sort((a, b) => wanted.get(a) - wanted.get(b) || byNumber(a, b));
    let previous = -Infinity;
    const placed = row.map(id => (previous = Math.max(wanted.get(id), previous + spacing)));
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
