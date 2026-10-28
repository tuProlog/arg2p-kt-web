// The arguments a federation gives, as Prolog text: [Rules, TopRule, [Conclusion], ...], the rules and premises it
// chains first, its conclusion third

/** What an argument concludes, and the rules and premises it rests on, read off its text: null if it does not read */
export function readArgument(text: string): { conclusion: string; rules: string[] } | null {
    const items = itemsOf(text);
    if (items === null || items.length < 3) return null;
    const conclusion = itemsOf(items[2]!);
    const rules = itemsOf(items[0]!);
    if (conclusion === null || conclusion.length !== 1 || rules === null) return null;
    return { conclusion: conclusion[0]!, rules };
}

// The items of the Prolog list [text], split at the commas outside brackets, parentheses and quotes
function itemsOf(text: string): string[] | null {
    const trimmed = text.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;
    const inner = trimmed.slice(1, -1).trim();
    if (inner === '') return [];
    const items: string[] = [];
    let depth = 0;
    let quote: string | null = null;
    let start = 0;
    for (let i = 0; i < inner.length; i++) {
        const char = inner[i]!;
        if (quote !== null) {
            if (char === quote) quote = null;
        } else if (char === "'" || char === '"') quote = char;
        else if (char === '(' || char === '[' || char === '{') depth++;
        else if (char === ')' || char === ']' || char === '}') depth--;
        else if (char === ',' && depth === 0) {
            items.push(inner.slice(start, i).trim());
            start = i + 1;
        }
        if (depth < 0) return null;
    }
    if (depth !== 0 || quote !== null) return null;
    items.push(inner.slice(start).trim());
    return items;
}
