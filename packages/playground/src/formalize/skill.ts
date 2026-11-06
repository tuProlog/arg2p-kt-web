// The method a model formalizes a text with: the skill arg2p-formalize of Arg2P, with its references (the syntax and
// the flags), taken from the repository of Arg2P at the version the playground solves with, so that the method always
// matches the engine. Downloaded once per version and kept in the browser.

/** What reads a URL: fetch, or a fake of it */
export type Fetch = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** What keeps a downloaded skill: the browser's storage, or a fake */
export interface SkillCache {
    get(key: string): string | null;
    set(key: string, value: string): void;
}

/** The skill: its instructions, and its references by name */
export interface Skill {
    readonly version: string;
    readonly instructions: string;
    readonly references: Readonly<Record<string, string>>;
}

const REPOSITORY = 'https://raw.githubusercontent.com/tuProlog/arg2p-kt';
const PATH = 'plugins/arg2p/skills/arg2p-formalize';
const REFERENCES = ['syntax', 'flags'] as const;
// Where the skill is when the version has none (it came with 0.25.0): the latest one
const LATEST = 'master';

/** The skill of Arg2P [version] (a release tag), downloaded or as kept; the latest one when the version has none */
export async function loadSkill(version: string, fetch: Fetch, cache: SkillCache, signal?: AbortSignal): Promise<Skill> {
    const key = `arg2p.skill.${version}`;
    const kept = read(cache.get(key));
    if (kept !== null) return kept;
    const skill = (await download(version, fetch, signal)) ?? (await download(LATEST, fetch, signal));
    if (skill === null) throw new Error('The formalization method (the arg2p-formalize skill) could not be downloaded from GitHub.');
    // the latest one is no version: kept for the visit only, as it changes
    if (skill.version !== LATEST) cache.set(key, JSON.stringify(skill));
    return skill;
}

// The skill at [ref], or null when it has none there
async function download(ref: string, fetch: Fetch, signal?: AbortSignal): Promise<Skill | null> {
    const get = async (file: string) => {
        const response = await fetch(`${REPOSITORY}/${ref}/${PATH}/${file}`, { signal });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`GitHub answered ${response.status} for the formalization method.`);
        return response.text();
    };
    const instructions = await get('SKILL.md');
    if (instructions === null) return null;
    const references: Record<string, string> = {};
    for (const name of REFERENCES) {
        const text = await get(`references/${name}.md`);
        if (text !== null) references[name] = text;
    }
    return { version: ref, instructions: withoutFrontMatter(instructions), references };
}

function read(text: string | null): Skill | null {
    try {
        const skill = JSON.parse(text ?? 'null') as Skill | null;
        return skill !== null && typeof skill.instructions === 'string' ? skill : null;
    } catch {
        return null;
    }
}

// The YAML at the head of a skill (its name, description, licence): for the agents that load skills, not the model
function withoutFrontMatter(text: string): string {
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}
