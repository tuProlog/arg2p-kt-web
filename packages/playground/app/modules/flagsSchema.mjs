// The flags of arg2p (see the Flags page of its documentation), and how to
// read and change them in the flags text. The text stays the source of truth:
// a flag is a Prolog fact, `name(value).` or a plain `name.` switch, and the
// changes below only touch the lines of the flag they are about.

// kind: "choice" (one value), "set" (the flag may appear several times),
// "switch" (the fact is there or not), "text" (a free value).
// required: the solver is given only these flags, and needs a value for it.
const FLAG_GROUPS = [
    {
        title: "Semantics",
        flags: [
            {
                name: "argumentLabellingMode", kind: "choice", required: true, label: "Argument semantics",
                // The same entries as the semantics picker of abstract mode.
                options: "semantics",
                help: "Labels the arguments in, out or und. Semantics with several labellings give one solution each: use Next."
            },
            {
                name: "statementLabellingMode", kind: "choice", required: true, label: "Statement semantics",
                options: [
                    ["statement", "Standard", "In if some in argument concludes it, otherwise out if some out argument does, otherwise und."],
                    ["statement_pass_through", "Pass-through", "Propagates the argument labels directly."],
                    ["statement_binary", "Binary", "In if some in argument concludes it, out otherwise."]
                ],
                help: "How the argument labels pass to the statements they conclude."
            }
        ]
    },
    {
        title: "Preferences",
        flags: [
            {
                name: "graphExtension", kind: "set", label: "Graph extensions",
                options: [
                    ["standardPref", "Static preferences", "Attacks that do not succeed as defeats are removed by the argument ordering."],
                    ["defeasiblePref", "Defeasible preferences", "A sup/2 concluded by a rule counts as a preference (single superiorities)."],
                    ["defeasibleAllPref", "All defeasible preferences", "Also comparisons that need several superiorities at once."],
                    ["rebutRestriction", "Restricted rebut", "An argument cannot rebut a conclusion drawn by a strict rule."],
                    ["bp", "Arguable burden of persuasion", "The burden is concluded by a rule, e.g. r : [] => bp(x)."]
                ],
                help: "Applied to the graph once it is built. None ticked: no preference handling."
            },
            {
                name: "orderingPrinciple", kind: "choice", required: true, label: "Ordering principle",
                options: [
                    ["last", "Last", "Compares the last defeasible rules of the arguments."],
                    ["weakest", "Weakest link", "Compares all the defeasible rules: an argument is as strong as its weakest."]
                ],
                help: "Which rules of two arguments are compared."
            },
            {
                name: "orderingComparator", kind: "choice", required: true, label: "Ordering comparator",
                options: [
                    ["elitist", "Elitist", "Weaker if some of its rules is weaker than all the rules of the other."],
                    ["democrat", "Democrat", "Weaker if each of its rules is weaker than some rule of the other."],
                    ["normal", "Normal", "Dung and Thang's attack relation, on the last rules (only with the Last principle)."]
                ],
                help: "How the rules picked by the principle are compared."
            }
        ]
    },
    {
        title: "Evaluation",
        flags: [
            { name: "queryMode", kind: "switch", label: "Query mode", help: "Builds only the part of the graph relevant to the query: much faster on large theories." },
            { name: "autoTransposition", kind: "switch", label: "Auto transposition", help: "Closes the theory under transposition: strict rules get their contrapositives." },
            { name: "prologStrictCompatibility", kind: "switch", label: "Prolog strict compatibility", help: "The Prolog clauses of the theory are argued too." },
            { name: "metaConflicts", kind: "switch", label: "Meta conflicts", help: "Meta-argumentation on conflicts." },
            { name: "metaRules", kind: "switch", label: "Meta rules", help: "Meta-argumentation on rules." },
            { name: "naturalTerms", kind: "switch", label: "Natural terms", help: "Normalises natural-language-like terms while parsing the rules." },
            { name: "debug", kind: "switch", label: "Debug", help: "BP partial semantics writes the steps of its labelling to the console." },
            {
                name: "graphBuildMode", kind: "choice", required: true, label: "Graph build mode",
                options: [["standard_af", "Standard (ASPIC+)", "Arguments, attacks and supports as in ASPIC+."]],
                help: "How the graph is built from the theory: standard_af is the only mode."
            },
            {
                name: "modulesPath", kind: "text", label: "Modules path", placeholder: "https://example.org/theories",
                help: "Base URL call_module/2 loads external .pl modules from. Empty: none."
            }
        ]
    }
];

const FLAGS = FLAG_GROUPS.flatMap(group => group.flags);

function escape(name) {
    return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// A line stating the flag: `name(value).` (with its value) or `name.`, and an
// optional trailing comment.
function valueLine(name) {
    return new RegExp(`^\\s*${escape(name)}\\s*\\(\\s*(.*?)\\s*\\)\\s*\\.\\s*(%.*)?$`);
}

function switchLine(name) {
    return new RegExp(`^\\s*${escape(name)}\\s*\\.\\s*(%.*)?$`);
}

function unquote(value) {
    const quoted = value.match(/^'(.*)'$/);
    return quoted ? quoted[1].replace(/''/g, "'") : value;
}

function quote(value) {
    return /^[a-z][a-zA-Z0-9_]*$/.test(value) ? value : `'${value.replace(/'/g, "''")}'`;
}

// The values stated for a flag, in order.
function valuesOf(text, name) {
    const pattern = valueLine(name);
    return text.split("\n")
        .map(line => line.match(pattern))
        .filter(match => match !== null)
        .map(match => unquote(match[1]));
}

// What the text states for every known flag: a value (or null) for choices
// and text, the list of values for sets, true or false for switches.
function readFlags(text) {
    const state = {};
    FLAGS.forEach(flag => {
        if (flag.kind === "switch") state[flag.name] = text.split("\n").some(line => switchLine(flag.name).test(line));
        else if (flag.kind === "set") state[flag.name] = valuesOf(text, flag.name);
        else state[flag.name] = valuesOf(text, flag.name)[0] ?? null;
    });
    return state;
}

// Replaces every line matching `pattern` with `replacement` (some lines, or
// none), put where the first of them was, or at the end when there was none.
function replaceLines(text, pattern, replacement) {
    const lines = text.split("\n");
    const first = lines.findIndex(line => pattern.test(line));
    const kept = lines.filter(line => !pattern.test(line));
    if (first === -1) {
        if (replacement.length === 0) return text;
        const body = text.replace(/\s*$/, "");
        return `${body === "" ? "" : body + "\n"}${replacement.join("\n")}\n`;
    }
    kept.splice(first, 0, ...replacement);
    return kept.join("\n");
}

// `name(value).`, or no line when value is empty.
function setValue(text, name, value) {
    const present = value !== null && value !== undefined && `${value}`.trim() !== "";
    return replaceLines(text, valueLine(name), present ? [`${name}(${quote(`${value}`.trim())}).`] : []);
}

// One `name(value).` line per value, in the given order.
function setValues(text, name, values) {
    return replaceLines(text, valueLine(name), values.map(value => `${name}(${quote(value)}).`));
}

// `name.` there or not.
function setSwitch(text, name, on) {
    return replaceLines(text, switchLine(name), on ? [`${name}.`] : []);
}

// Combinations the documentation warns about, as messages.
function warningsOf(state) {
    const warnings = FLAGS
        .filter(flag => flag.required && state[flag.name] === null)
        .map(flag => `${flag.label} has no value: the solver needs one.`);
    if (state.orderingComparator === "normal" && state.orderingPrinciple === "weakest") {
        warnings.push("The Normal comparator only goes with the Last principle: with Weakest link the evaluation raises a domain error.");
    }
    return warnings;
}

export { FLAG_GROUPS, FLAGS, readFlags, setValue, setValues, setSwitch, warningsOf }
