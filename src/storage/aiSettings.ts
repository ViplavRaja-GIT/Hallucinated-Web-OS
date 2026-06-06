import type { AISettings } from "../components/AISettingsWindow/AISettingsWindow";

const KEY = "ai_settings";

export function saveAISettings(settings: AISettings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
}

export function loadAISettings(): AISettings | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}