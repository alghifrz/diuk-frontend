"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useAutomations } from "@/hooks/use-automations";

const TRIGGER_LABEL: Record<string, string> = {
  CUSTOMER_CREATED: "When a customer is created",
  CONVERSATION_CREATED: "When a conversation starts",
  CONVERSATION_INACTIVE: "When a conversation is inactive",
  RESERVATION_CONFIRMED: "When a reservation is confirmed",
  RESERVATION_CANCELLED: "When a reservation is cancelled",
  SCHEDULED: "On a schedule",
};

const ACTION_LABEL: Record<string, string> = {
  SEND_MESSAGE: "Sends a system message",
  AI_GENERATE_MESSAGE: "Generates an AI message",
};

export function AutomationList() {
  const { items, loading, error, busyId, setActive, archive } = useAutomations();
  const visible = items.filter((item) => item.status !== "ARCHIVED");
  const activeCount = visible.filter((item) => item.status === "ACTIVE").length;

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <Icon name="bolt" size={24} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
              Automation
            </p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-on-surface">
              Rules
            </h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Turn a rule off to stop it from sending messages.
            </p>
          </div>
        </div>
        {!loading && !error && visible.length > 0 ? (
          <span className="inline-flex shrink-0 items-center rounded-full bg-surface-container-low px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
            {activeCount} on
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3" aria-busy="true" aria-label="Loading automations">
          <div className="h-[4.5rem] animate-pulse rounded-2xl bg-surface-container-low" />
          <div className="h-[4.5rem] animate-pulse rounded-2xl bg-surface-container-low" />
        </div>
      ) : error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl bg-error/10 px-3 py-2.5 text-sm text-error"
        >
          <Icon name="error" size={18} />
          <span>{error}</span>
        </p>
      ) : visible.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-8 text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-surface text-on-surface-variant">
            <Icon name="bolt" size={20} />
          </span>
          <p className="mt-3 text-sm font-medium text-on-surface">No automations yet</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Rules created for this workspace will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visible.map((item) => {
            const active = item.status === "ACTIVE";
            const busy = busyId === item.id;
            const sendMessage = item.action_type === "SEND_MESSAGE";

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3.5"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                    sendMessage ? "bg-warning/15 text-warning" : "bg-surface text-on-surface-variant",
                  )}
                >
                  <Icon name={sendMessage ? "campaign" : "smart_toy"} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-on-surface">{item.name}</p>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                        active
                          ? "bg-primary/15 text-primary-dark"
                          : "bg-surface text-on-surface-variant",
                      )}
                    >
                      {active ? "On" : "Off"}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">
                      {item.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[11px] text-on-surface-variant">
                      {TRIGGER_LABEL[item.trigger_type] ?? item.trigger_type}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[11px] text-on-surface-variant">
                      {ACTION_LABEL[item.action_type] ?? item.action_type}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    disabled={busy}
                    onClick={() => void archive(item.id)}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-lg text-on-surface-variant",
                      "hover:bg-surface hover:text-error",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      busy && "opacity-60",
                    )}
                  >
                    <Icon name="delete" size={18} />
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    aria-busy={busy || undefined}
                    aria-label={active ? `Turn off ${item.name}` : `Turn on ${item.name}`}
                    disabled={busy}
                    onClick={() => void setActive(item.id, !active)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active ? "bg-primary" : "bg-outline-variant",
                      busy && "opacity-60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                        active && "translate-x-5",
                      )}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
