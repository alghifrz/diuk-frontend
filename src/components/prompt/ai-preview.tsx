"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAIPreview } from "@/hooks/use-ai-preview";
import { cn } from "@/lib/cn";

const EXAMPLE_PROMPTS = [
  "What time do you open tomorrow?",
  "Can I book a table for 4 tonight?",
  "What do you recommend?",
];

type AIPreviewProps = {
  aiEnabled: boolean;
  activeVersion: number | null;
};

export function AIPreview({ aiEnabled, activeVersion }: AIPreviewProps) {
  const preview = useAIPreview();
  const [message, setMessage] = useState("");

  async function handleSend() {
    const text = message;
    setMessage("");
    await preview.send(text);
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface">
      <div className="border-b border-outline-variant px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Try it</h3>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              Temporary test chat — not linked to WhatsApp. Uses the{" "}
              <span className="font-medium text-on-surface">
                live
                {activeVersion != null ? ` v${activeVersion}` : ""}
              </span>{" "}
              instructions. Draft changes are not tested until you make them
              live.
            </p>
            {activeVersion == null ? (
              <p className="mt-2 rounded-lg bg-warning/10 px-2.5 py-1.5 text-xs text-on-surface">
                No live version yet. Go to Instructions, save your draft, then
                click <span className="font-medium">Make live</span> before
                testing — or replies will use the system default prompt.
              </p>
            ) : null}
          </div>
          {preview.turns.length > 0 ? (
            <Button
              variant="ghost"
              className="w-auto min-h-9 px-2"
              onClick={() => void preview.clear()}
            >
              New chat
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {!aiEnabled ? (
          <p className="rounded-xl bg-warning/10 px-3 py-2 text-sm text-on-surface">
            AI is turned off for this business, so test replies will fail.
          </p>
        ) : null}

        <div className="flex min-h-[220px] flex-col rounded-xl bg-background p-3">
          {preview.turns.length === 0 && !preview.loading ? (
            <p className="m-auto max-w-xs text-center text-sm text-on-surface-variant">
              Ask a question below to see how the live AI would reply.
            </p>
          ) : (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
              {preview.turns.map((turn) => (
                <Bubble
                  key={turn.id}
                  align={turn.role === "customer" ? "end" : "start"}
                  label={turn.role === "customer" ? "You (test)" : "AI"}
                >
                  {turn.text}
                </Bubble>
              ))}
              {preview.loading ? (
                <Bubble align="start" label="AI">
                  <span className="inline-flex items-center gap-2 text-on-surface-variant">
                    <Icon
                      name="progress_activity"
                      size={16}
                      className="animate-spin"
                    />
                    Thinking…
                  </span>
                </Bubble>
              ) : null}
            </div>
          )}
        </div>

        {preview.error ? (
          <p
            role="alert"
            className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error"
          >
            {preview.error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="rounded-full border border-outline-variant bg-background px-2.5 py-1 text-[11px] text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {example}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-on-surface">
            Your test message
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder="Type a question..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!preview.loading && aiEnabled && message.trim()) {
                  void handleSend();
                }
              }
            }}
            className="w-full rounded-xl border border-outline-variant bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>

        <Button
          className="w-auto"
          loading={preview.loading}
          disabled={!aiEnabled || !message.trim()}
          onClick={() => void handleSend()}
        >
          <Icon name="play_arrow" size={18} />
          Send
        </Button>
      </div>
    </div>
  );
}

function Bubble({
  align,
  label,
  children,
}: {
  align: "start" | "end";
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "end" ? "items-end" : "items-start",
      )}
    >
      <span className="text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
        {label}
      </span>
      <div
        className={cn(
          "max-w-[95%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6",
          align === "end"
            ? "bg-secondary text-white"
            : "border border-outline-variant bg-surface text-on-surface",
        )}
      >
        {children}
      </div>
    </div>
  );
}
