"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { aiErrorMessage } from "@/lib/ai-errors";
import { AI_PROVIDERS } from "@/types/ai";
import type { AISettings, UpdateAISettingsInput } from "@/types/ai";

type AISettingsPanelProps = {
  settings: AISettings | null;
  loading: boolean;
  saving: boolean;
  error: string;
  onSave: (input: UpdateAISettingsInput) => Promise<void>;
  onRetry: () => void;
};

export function AISettingsPanel({
  settings,
  loading,
  saving,
  error,
  onSave,
  onRetry,
}: AISettingsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading AI settings">
        <div className="h-10 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-10 animate-pulse rounded-xl bg-surface-container-low" />
        <div className="h-10 animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="rounded-xl bg-error/10 px-3 py-3 text-sm text-error">
        <p>{error || "Couldn't load AI settings."}</p>
        <Button variant="ghost" className="mt-2 w-auto" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return <AISettingsForm key={settings.updated_at} settings={settings} saving={saving} onSave={onSave} />;
}

function AISettingsForm({
  settings,
  saving,
  onSave,
}: {
  settings: AISettings;
  saving: boolean;
  onSave: (input: UpdateAISettingsInput) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(settings.enabled);
  const [provider, setProvider] = useState(settings.provider);
  const [model, setModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(
    settings.temperature == null ? "0.3" : String(settings.temperature),
  );
  const [maxTokens, setMaxTokens] = useState(
    settings.max_output_tokens == null
      ? "1024"
      : String(settings.max_output_tokens),
  );
  const [localError, setLocalError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const temp = Number(temperature);
    const tokens = Number(maxTokens);
    if (!model.trim()) {
      setLocalError("Model is required.");
      return;
    }
    if (Number.isNaN(temp) || temp < 0 || temp > 2) {
      setLocalError("Temperature must be between 0 and 2.");
      return;
    }
    if (!Number.isInteger(tokens) || tokens < 1 || tokens > 8192) {
      setLocalError("Max output tokens must be between 1 and 8192.");
      return;
    }
    setLocalError("");
    setSavedFlash(false);
    try {
      await onSave({
        enabled,
        provider,
        model: model.trim(),
        temperature: temp,
        max_output_tokens: tokens,
      });
      setSavedFlash(true);
    } catch (err) {
      setLocalError(aiErrorMessage(err, "Couldn't save AI settings."));
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {!enabled ? (
        <div className="rounded-xl border border-outline-variant bg-background px-3 py-2.5 text-sm text-on-surface">
          <p className="font-medium">AI Assistant is off</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Customer messages will not receive automated AI responses while this
            is disabled.
          </p>
        </div>
      ) : null}

      {localError ? (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {localError}
        </p>
      ) : null}
      {savedFlash ? (
        <p role="status" className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
          Settings saved.
        </p>
      ) : null}

      <label className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant px-3 py-3">
        <span>
          <span className="block text-sm font-medium text-on-surface">
            AI enabled
          </span>
          <span className="block text-xs text-on-surface-variant">
            Allow automated replies for this business
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="size-5 accent-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-on-surface">Provider</span>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          {AI_PROVIDERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-on-surface-variant">
          Provider credentials stay on the server. Anthropic may be stored but is
          not implemented by the backend yet.
        </span>
      </label>

      <Input
        label="Model"
        value={model}
        onChange={(event) => setModel(event.target.value)}
        placeholder="gpt-4o-mini"
        maxLength={100}
        required
      />

      <div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface">
            Temperature ({temperature})
          </span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
            className="w-full accent-primary"
          />
        </label>
        <div className="mt-1 flex justify-between text-[11px] text-on-surface-variant">
          <span>More consistent</span>
          <span>More varied</span>
        </div>
      </div>

      <Input
        label="Max output tokens"
        type="number"
        min={1}
        max={8192}
        value={maxTokens}
        onChange={(event) => setMaxTokens(event.target.value)}
      />

      <Button type="submit" loading={saving} className="sm:w-auto">
        <Icon name="save" size={18} />
        Save settings
      </Button>
    </form>
  );
}
