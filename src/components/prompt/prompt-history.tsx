"use client";

import { PromptStatusBadge } from "@/components/prompt/ai-prompt-editor";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { AIPrompt } from "@/types/ai";

type PromptHistoryProps = {
  items: AIPrompt[];
  selectedId?: string | null;
  loading?: boolean;
  error?: string;
  onSelect: (prompt: AIPrompt) => void;
  onRetry?: () => void;
  onRestoreAsDraft?: (prompt: AIPrompt) => void;
  restoreBusy?: boolean;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function PromptHistory({
  items,
  selectedId,
  loading = false,
  error = "",
  onSelect,
  onRetry,
  onRestoreAsDraft,
  restoreBusy = false,
}: PromptHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-2" aria-label="Loading prompt history">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-surface-container-low"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-error/10 px-3 py-3 text-center text-sm text-error">
        <p>{error}</p>
        {onRetry ? (
          <Button variant="ghost" className="mt-2 w-auto" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-on-surface-variant">
        No prompt versions yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((prompt) => {
        const selected = prompt.id === selectedId;
        return (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => onSelect(prompt)}
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-outline-variant bg-surface hover:bg-background",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums text-on-surface">
                  v{prompt.version}
                </span>
                <PromptStatusBadge status={prompt.status} />
              </div>
              <p className="mt-1 truncate text-xs text-on-surface-variant">
                Updated {formatWhen(prompt.updated_at)}
              </p>
            </button>
            {selected &&
            prompt.status !== "DRAFT" &&
            onRestoreAsDraft ? (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  className="w-full"
                  loading={restoreBusy}
                  onClick={() => onRestoreAsDraft(prompt)}
                >
                  <Icon name="history" size={16} />
                  Use as new draft
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
