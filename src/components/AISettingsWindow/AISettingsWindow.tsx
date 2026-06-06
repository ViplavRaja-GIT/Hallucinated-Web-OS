import { useState } from "react";
import "./AISettingsWindow.css";
import { AIValidatorService } from "../../services/aiValidatorService";
import { saveAISettings } from "../../storage/aiSettings";

export type AIProvider = "gemini" | "openai" | "anthropic";

export interface AISettings {
    provider: AIProvider;
    apiKey: string;
    model: string;
}

interface AISettingsWindowProps {
    onSave: (success: boolean) => void;
}

export default function AISettingsWindow({ onSave }: AISettingsWindowProps) {
    const [provider, setProvider] = useState<AIProvider>("gemini");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("gemini-2.5-flash");
    const [testing, setTesting] = useState(false);

    const [status, setStatus] = useState<{ success: boolean; text: string; } | null>(null);

    const handleProviderChange = (
        value: AIProvider
    ) => {
        setProvider(value);

        switch (value) {
            case "gemini":
                setModel("gemini-2.5-flash");
                break;

            case "openai":
                setModel("gpt-5-mini");
                break;

            case "anthropic":
                setModel("claude-sonnet-4");
                break;
        }
    };

    const handleTest = async () => {
        if (!apiKey.trim()) {
            setStatus({ success: false, text: "API key is required" });
            return;
        }

        try {
            setTesting(true);
            const aiValidator = new AIValidatorService();
            const ok = await aiValidator.validateProvider(provider, apiKey, model);
            setStatus({ success: ok, text: ok ? "Connection successful" : "Connection failed" });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            setStatus({ success: false, text: "API key is required" });
            return;
        }

        try {
            setTesting(true);
            const aiValidator = new AIValidatorService();
            const ok = await aiValidator.validateProvider(provider, apiKey, model);
            setStatus({ success: ok, text: ok ? "Connection successful." : "Connection failed." });
            if (!ok)
                return;
        } finally {
            setTesting(false);
        }

        const settings = { provider, apiKey, model };
        saveAISettings(settings);
        setStatus({ success: true, text: "Configuration saved." });
        onSave(true);
    };

    return (
        <div className="ai-settings-backdrop">
            <div className="ai-settings-card">
                <div className="ai-settings-header">
                    <h1>Hallucinated Web OS</h1>
                    <p>
                        Configure your AI provider to start
                        generating applications.
                    </p>
                </div>

                <div className="ai-settings-form">
                    <div className="field">
                        <label>Provider</label>
                        <select name="provider" value={provider}
                            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}>
                            <option value="gemini"> Google Gemini </option>
                            <option value="openai"> OpenAI </option>
                            <option value="anthropic"> Claude </option>
                        </select>
                    </div>

                    <div className="field">
                        <label>API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            placeholder="Paste your API key..."
                            onChange={(e) => setApiKey(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Model</label>

                        <input
                            value={model}
                            placeholder="Model Name"
                            onChange={(e) => setModel(e.target.value)} />
                    </div>

                    {status && (
                        <div
                            className={`status ${status.success ? "success" : "error"}`}>
                            {status.text}
                        </div>
                    )}
                </div>

                <div className="ai-settings-actions">
                    <button
                        className="win-btn"
                        onClick={handleTest}
                        disabled={testing}>
                        {testing ? "Testing..." : "Test Connection"}
                    </button>

                    <button
                        className="win-btn win-btn-primary"
                        onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}