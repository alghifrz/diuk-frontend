import { cn } from "@/lib/cn";
import type { HandlingState } from "@/types/chat";

const LABELS: Record<HandlingState, string> = {
  AI_ACTIVE: "AI Active",
  HUMAN_REQUESTED: "Human Requested",
  HUMAN_ACTIVE: "Human Active",
  RESOLVED: "Resolved",
};

type HandlingBadgeProps = {
  state: HandlingState;
  className?: string;
};

export function HandlingBadge({ state, className }: HandlingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        state === "AI_ACTIVE" && "bg-primary/15 text-primary-dark",
        state === "HUMAN_REQUESTED" && "bg-warning/15 text-warning",
        state === "HUMAN_ACTIVE" && "bg-secondary/10 text-secondary",
        state === "RESOLVED" && "bg-surface-container-low text-on-surface-variant",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          state === "AI_ACTIVE" && "bg-primary-dark",
          state === "HUMAN_REQUESTED" && "bg-warning",
          state === "HUMAN_ACTIVE" && "bg-secondary",
          state === "RESOLVED" && "bg-outline",
        )}
      />
      {LABELS[state]}
    </span>
  );
}
