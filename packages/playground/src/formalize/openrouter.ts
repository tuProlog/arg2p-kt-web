import type { Fetch } from './skill.js';

// A model asked through OpenRouter, from the browser: the key is the user's own, kept in this browser (see
// settings.ts), and goes to OpenRouter alone.

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface Message {
    readonly role: 'system' | 'user' | 'assistant';
    readonly content: string;
}

export interface ModelSettings {
    readonly key: string;
    readonly model: string;
    readonly effort: 'low' | 'medium' | 'high';
}

/** The tokens of a request: those read, and those written (the reasoning among them) */
export interface Tokens {
    readonly prompt: number;
    readonly completion: number;
    readonly reasoning: number;
}

/**
 * What a model answered: its text, the model and the provider that answered, what it cost (in US dollars) and its
 * tokens, when told
 */
export interface Completion {
    readonly content: string;
    readonly model: string;
    readonly cost: number | null;
    readonly provider?: string;
    readonly tokens?: Tokens;
}

/** What reads a URL with a body: fetch, or a fake of it */
export type Post = (
    url: string,
    init: { method: 'POST'; headers: Record<string, string>; body: string; signal?: AbortSignal },
) => ReturnType<Fetch>;

/** A failure of OpenRouter, said so that the user knows what to do */
export class ModelError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'ModelError';
    }
}

/**
 * The answer of the model of [settings] to [messages], as a JSON object of [schema]: asked of the providers that hold
 * to a schema only, so that the answer is one
 */
export async function complete(settings: ModelSettings, messages: readonly Message[], schema: object, post: Post, signal?: AbortSignal): Promise<Completion> {
    const response = await post(ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${settings.key}`,
            'Content-Type': 'application/json',
            // who asks, for the dashboards of OpenRouter
            'HTTP-Referer': typeof location === 'undefined' ? 'https://tuprolog.github.io/arg2p-kt-web/' : location.origin,
            'X-Title': 'Arg2P Playground',
        },
        body: JSON.stringify({
            model: settings.model,
            messages,
            response_format: { type: 'json_schema', json_schema: { name: 'formalization', strict: true, schema } },
            // the providers holding to the schema, the fastest first (the cheapest are slow, and every one costs little)
            provider: { require_parameters: true, sort: 'throughput' },
            reasoning: { effort: settings.effort },
            usage: { include: true },
        }),
        signal,
    });
    const text = await response.text();
    if (!response.ok) throw new ModelError(failure(response.status, text, settings.model), response.status);
    let body: {
        choices?: { message?: { content?: string | null } }[];
        model?: string;
        provider?: string;
        usage?: { cost?: number; prompt_tokens?: number; completion_tokens?: number; completion_tokens_details?: { reasoning_tokens?: number } };
        error?: { message?: string };
    };
    try {
        body = JSON.parse(text);
    } catch {
        throw new ModelError('OpenRouter answered something that is not JSON.', response.status);
    }
    if (body.error?.message) throw new ModelError(body.error.message, response.status);
    const content = body.choices?.[0]?.message?.content ?? '';
    if (content.trim() === '') throw new ModelError('The model gave no answer (it may have run out of tokens): try again, or another model.', response.status);
    const usage = body.usage;
    return {
        content,
        model: body.model ?? settings.model,
        cost: typeof usage?.cost === 'number' ? usage.cost : null,
        ...(typeof body.provider === 'string' ? { provider: body.provider } : {}),
        ...(typeof usage?.prompt_tokens === 'number'
            ? { tokens: { prompt: usage.prompt_tokens, completion: usage.completion_tokens ?? 0, reasoning: usage.completion_tokens_details?.reasoning_tokens ?? 0 } }
            : {}),
    };
}

// What went wrong, and what to do about it
function failure(status: number, text: string, model: string): string {
    let said = '';
    try {
        said = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? '';
    } catch {
        said = text.slice(0, 200);
    }
    switch (status) {
        case 401:
            return 'OpenRouter refused the key: check it in the settings of the formalization.';
        case 402:
            return 'The OpenRouter account has no credit left for this request.';
        case 404:
            return `OpenRouter has no model "${model}" that answers in a JSON schema${said ? `: ${said}` : '.'}`;
        case 429:
            return 'OpenRouter limits the requests for now: try again in a moment.';
        default:
            return `OpenRouter answered ${status}${said ? `: ${said}` : '.'}`;
    }
}
