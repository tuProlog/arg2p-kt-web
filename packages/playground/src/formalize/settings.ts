import { keepSetting, setting } from '../storage.js';
import type { ModelSettings } from './openrouter.js';

// The settings of the formalization: the OpenRouter key of the user (kept in this browser only, sent to OpenRouter
// alone), the model and how much it reasons.

const KEY = 'arg2p.formalize';

/** A model that formalizes well, and costs little: as much as gpt-oss-120b on its fastest providers, or less */
export const DEFAULT_MODEL = 'anthropic/claude-haiku-5.5';

/** Models offered in the settings, the default first; any other of OpenRouter answering in a JSON schema can be written in */
export const SUGGESTED_MODELS = ['anthropic/claude-haiku-5.5', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export function loadSettings(): ModelSettings {
    try {
        const kept = JSON.parse(setting(KEY) ?? 'null') as Partial<ModelSettings> | null;
        return {
            key: typeof kept?.key === 'string' ? kept.key : '',
            model: typeof kept?.model === 'string' && kept.model.trim() !== '' ? kept.model : DEFAULT_MODEL,
            effort: kept?.effort === 'low' || kept?.effort === 'high' ? kept.effort : 'medium',
        };
    } catch {
        return { key: '', model: DEFAULT_MODEL, effort: 'medium' };
    }
}

export function saveSettings(settings: ModelSettings): void {
    keepSetting(KEY, JSON.stringify({ ...settings, key: settings.key.trim(), model: settings.model.trim() || DEFAULT_MODEL }));
}

/** Forgets the key (the model and effort stay) */
export function forgetKey(): void {
    saveSettings({ ...loadSettings(), key: '' });
}
