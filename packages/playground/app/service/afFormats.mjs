// Abstract argumentation frameworks in the formats of the ICCMA competitions,
// to exchange them with other tools:
//
//   APX        arg(a).  att(a,b).
//   TGF        one argument per line, a line `#`, then one attack per line: `a b`
//   ICCMA'23   `p af N`, then attacks between the arguments 1..N: `1 2`
//
// A framework is { arguments: [names], attacks: [{ from, to }] }. Names have
// to be Prolog atoms in the playground (a lowercase letter, then letters,
// digits or underscores): others are renamed on import (`1` -> `a1`).

const ATOM = /^[a-z][a-zA-Z0-9_]*$/;

function toApx(framework) {
    return [
        ...framework.arguments.map(it => `arg(${it}).`),
        ...framework.attacks.map(it => `att(${it.from},${it.to}).`)
    ].join("\n") + "\n";
}

function toTgf(framework) {
    return [
        ...framework.arguments,
        "#",
        ...framework.attacks.map(it => `${it.from} ${it.to}`)
    ].join("\n") + "\n";
}

// Reads any of the three formats; `renamed` lists the names that changed.
function parse(text) {
    const lines = text.split(/\r?\n/).map(it => it.replace(/%.*$/, "").trim());
    const content = lines.filter(it => it !== "" && !it.startsWith("#") || it === "#");
    if (content.some(it => /^(arg|att)\s*\(/.test(it))) return named(parseApx(content));
    if (content.length > 0 && /^p\s+af\s+\d+$/.test(content[0])) return named(parseIccma23(content));
    return named(parseTgf(content));
}

function parseApx(lines) {
    const args = [];
    const attacks = [];
    lines.forEach((line, index) => {
        line.split(/(?<=\))\s*\.\s*/).filter(it => it.trim() !== "").forEach(fact => {
            const arg = fact.match(/^arg\s*\(\s*([^,()]+?)\s*\)\s*\.?$/);
            const att = fact.match(/^att\s*\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)\s*\.?$/);
            if (arg) args.push(arg[1]);
            else if (att) attacks.push({ from: att[1], to: att[2] });
            else throw new Error(`Line ${index + 1}: expected arg(a). or att(a,b)., found "${fact}"`);
        });
    });
    return { arguments: args, attacks };
}

function parseTgf(lines) {
    const separator = lines.indexOf("#");
    if (separator === -1) throw new Error("Not an APX, TGF or ICCMA'23 framework: a TGF file has a line # between arguments and attacks");
    // A TGF node line may carry a label after the id: the id is the name.
    const args = lines.slice(0, separator).map(it => it.split(/\s+/)[0]);
    const attacks = lines.slice(separator + 1).filter(it => it !== "#").map((line, index) => {
        const parts = line.split(/\s+/);
        if (parts.length < 2) throw new Error(`Attack ${index + 1}: expected two arguments, found "${line}"`);
        return { from: parts[0], to: parts[1] };
    });
    return { arguments: args, attacks };
}

function parseIccma23(lines) {
    const count = parseInt(lines[0].split(/\s+/)[2]);
    const args = Array.from({ length: count }, (_, i) => `${i + 1}`);
    const attacks = lines.slice(1).map((line, index) => {
        const parts = line.split(/\s+/);
        if (parts.length !== 2 || parts.some(it => !/^\d+$/.test(it) || +it < 1 || +it > count)) {
            throw new Error(`Attack ${index + 1}: expected two arguments between 1 and ${count}, found "${line}"`);
        }
        return { from: parts[0], to: parts[1] };
    });
    return { arguments: args, attacks };
}

// Every name made an atom, the same way everywhere it appears, and the
// arguments only mentioned by attacks added.
function named(framework) {
    const names = new Map();
    const used = new Set(framework.arguments.filter(it => ATOM.test(it)));
    const atom = raw => {
        if (names.has(raw)) return names.get(raw);
        let name = ATOM.test(raw) ? raw : candidate(raw);
        if (name !== raw) {
            const base = name;
            for (let n = 2; used.has(name); n++) name = `${base}_${n}`;
            used.add(name);
        }
        names.set(raw, name);
        return name;
    };
    const args = [];
    const add = name => { if (!args.includes(name)) args.push(name); };
    framework.arguments.forEach(it => add(atom(it)));
    const attacks = [];
    framework.attacks.forEach(it => {
        const attack = { from: atom(it.from), to: atom(it.to) };
        add(attack.from);
        add(attack.to);
        if (!attacks.some(a => a.from === attack.from && a.to === attack.to)) attacks.push(attack);
    });
    const renamed = [...names].filter(([raw, name]) => raw !== name).map(([raw, name]) => ({ from: raw, to: name }));
    return { arguments: args, attacks, renamed };
}

function candidate(raw) {
    const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, "_");
    if (/^[a-z]/.test(cleaned)) return cleaned;
    if (/^[A-Z]/.test(cleaned)) return cleaned[0].toLowerCase() + cleaned.slice(1);
    return `a${cleaned}`;
}

export default { toApx, toTgf, parse }
