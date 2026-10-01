"use client";

import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { HandlingState } from "@/types/chat";

type ComposerMode = "reply" | "note";

type MessageComposerProps = {
  handlingState: HandlingState;
  disabled?: boolean;
  sending?: boolean;
  error?: string;
  onSend: (mode: ComposerMode, content: string) => Promise<boolean>;
};

export function MessageComposer({
  handlingState,
  disabled = false,
  sending = false,
  error,
  onSend,
}: MessageComposerProps) {
  const [mode, setMode] = useState<ComposerMode>("reply");
  const [value, setValue] = useState("");
  const canReply = handlingState === "HUMAN_REQUESTED" || handlingState === "HUMAN_ACTIVE";
  const replyBlocked = mode === "reply" && !canReply;
  const isDisabled = disabled || sending || replyBlocked;

  async function submit() {
    const content = value.trim();
    if (!content || isDisabled) {
      return;
    }

    const ok = await onSend(mode, content);
    if (ok) {
      setValue("");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="border-t border-outline-variant bg-surface px-4 py-3">
      <div className="mb-2 inline-flex rounded-lg bg-background p-0.5">
        <button
          type="button"
          onClick={() => setMode("reply")}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium",
            mode === "reply"
              ? "bg-secondary text-white"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          Reply
        </button>
        <button
          type="button"
          onClick={() => setMode("note")}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium",
            mode === "note"
              ? "bg-warning/20 text-warning"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          Internal note
        </button>
      </div>

      {replyBlocked ? (
        <p className="mb-2 text-xs text-on-surface-variant">
          Take over this conversation before sending a customer reply.
        </p>
      ) : null}

      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-background px-3 py-2",
          mode === "note" ? "border-warning/40" : "border-outline-variant",
        )}
      >
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={2}
          placeholder={mode === "note" ? "Write an internal note..." : "Type a message..."}
          className="min-h-12 flex-1 resize-none bg-transparent py-1.5 text-sm text-on-surface outline-none placeholder:text-outline disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={isDisabled || !value.trim()}
          aria-label="Send"
          className={cn(
            "mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:opacity-50",
            mode === "note" ? "bg-warning hover:bg-[#c9922e]" : "bg-primary hover:bg-primary-dark",
          )}
        >
          {sending ? <Spinner className="text-white" /> : <Icon name="send" size={18} />}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
