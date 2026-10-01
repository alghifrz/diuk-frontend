import { cn } from "@/lib/cn";
import type { ConversationFilter } from "@/types/chat";

const FILTERS: Array<{ id: ConversationFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "ai_active", label: "AI" },
  { id: "human_requested", label: "Requested" },
  { id: "human_active", label: "Human" },
  { id: "resolved", label: "Resolved" },
];

type ConversationFiltersProps = {
  value: ConversationFilter;
  onChange: (value: ConversationFilter) => void;
};

export function ConversationFilters({ value, onChange }: ConversationFiltersProps) {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-xl bg-background p-1"
      role="tablist"
      aria-label="Conversation filters"
    >
      {FILTERS.map((filter) => {
        const active = value === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active
                ? "bg-surface text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
