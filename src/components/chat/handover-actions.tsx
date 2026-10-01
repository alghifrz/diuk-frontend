"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { HandlingState } from "@/types/chat";

type HandoverAction = "handover" | "takeover" | "resolve" | "resume";

type HandoverActionsProps = {
  state: HandlingState;
  busy?: boolean;
  onAction: (action: HandoverAction) => Promise<void>;
};

export function HandoverActions({ state, busy = false, onAction }: HandoverActionsProps) {
  const [confirm, setConfirm] = useState<HandoverAction | null>(null);

  const actions: Array<{ id: HandoverAction; label: string; confirm?: boolean; emphasis?: boolean }> =
    [];

  if (state === "AI_ACTIVE") {
    actions.push({ id: "handover", label: "Request human", emphasis: true });
  }

  if (state === "HUMAN_REQUESTED") {
    actions.push({ id: "takeover", label: "Take over", emphasis: true });
    actions.push({ id: "resolve", label: "Resolve", confirm: true });
    actions.push({ id: "resume", label: "Resume AI", confirm: true });
  }

  if (state === "HUMAN_ACTIVE") {
    actions.push({ id: "resolve", label: "Resolve", confirm: true, emphasis: true });
  }

  if (state === "RESOLVED") {
    actions.push({ id: "resume", label: "Resume AI", confirm: true, emphasis: true });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {actions.map((action) => {
        if (confirm === action.id) {
          return (
            <span key={action.id} className="flex items-center gap-1.5">
              <span className="text-xs text-on-surface-variant">
                Confirm {action.label.toLowerCase()}?
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void onAction(action.id).finally(() => setConfirm(null));
                }}
                className="rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-background"
              >
                Cancel
              </button>
            </span>
          );
        }

        return (
          <button
            key={action.id}
            type="button"
            disabled={busy}
            onClick={() => {
              if (action.confirm) {
                setConfirm(action.id);
                return;
              }
              void onAction(action.id);
            }}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
              action.emphasis
                ? "bg-secondary text-white hover:bg-secondary-dark"
                : "border border-outline-variant bg-surface text-on-surface hover:bg-background",
            )}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
