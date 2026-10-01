"use client";

import { useState } from "react";
import { EntityStatusBadge } from "@/components/area/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { PromptStatus } from "@/types/ai";

type AIPromptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  charLimit?: number;
};

export function AIPromptEditor({
  value,
  onChange,
  disabled = false,
  charLimit = 20000,
}: AIPromptEditorProps) {
  const length = [...value].length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <label className="flex min-h-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-on-surface">
          Instructions
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          spellCheck
          className={cn(
            "min-h-[320px] w-full flex-1 resize-y rounded-2xl border border-outline-variant bg-surface px-4 py-3 text-sm leading-6 text-on-surface outline-none",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-70",
          )}
          placeholder={`Example:\nYou are a friendly assistant for our restaurant.\nHelp with the menu, opening hours, and reservations.\nIf you are unsure, say so and offer to connect the customer with staff.`}
        />
        <div className="flex items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>
            {length.toLocaleString()} / {charLimit.toLocaleString()}
          </span>
          {length > charLimit ? (
            <span className="text-error">Too long</span>
          ) : null}
        </div>
      </label>
    </div>
  );
}

export function PromptStatusBadge({ status }: { status: PromptStatus }) {
  if (status === "ACTIVE") {
    return <EntityStatusBadge status="ACTIVE" />;
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-secondary uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-surface-container-low px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase">
      <span aria-hidden className="size-1.5 rounded-full bg-outline" />
      Archived
    </span>
  );
}

export function EmptyPromptState({ onStarter }: { onStarter: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
        <Icon name="psychology" size={24} />
      </span>
      <p className="mt-4 text-base font-semibold text-on-surface">
        Set up your AI assistant
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
        Write a short guide for how the AI should talk to customers. Start from
        a template, then edit it to match your business.
      </p>
      <div className="mt-6 w-full max-w-[220px]">
        <Button onClick={onStarter}>
          <Icon name="add" size={18} />
          Start with template
        </Button>
      </div>
    </div>
  );
}

export function WritingTips() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-outline-variant bg-background">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-on-surface">
          What should I write?
        </span>
        <Icon name={open ? "expand_less" : "expand_more"} size={20} />
      </button>
      {open ? (
        <div className="border-t border-outline-variant px-3 py-3 text-sm leading-6 text-on-surface-variant">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>How the AI should sound (friendly, formal, short…)</li>
            <li>What it can help with (menu, hours, bookings…)</li>
            <li>What it must never invent or guess</li>
            <li>When it should hand over to your staff</li>
          </ul>
          <p className="mt-3 text-xs">
            Do not paste your full menu or opening hours here — the AI already
            reads those from Menu and Settings.
          </p>
        </div>
      ) : null}
    </div>
  );
}
