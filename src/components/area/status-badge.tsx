import { cn } from "@/lib/cn";
import type { AreaStatus, TableStatus } from "@/types/area";

export function EntityStatusBadge({
  status,
  className,
}: {
  status: AreaStatus | TableStatus | string;
  className?: string;
}) {
  const active = status === "ACTIVE";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        active
          ? "bg-success/12 text-success"
          : "bg-surface-container-low text-on-surface-variant",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-success" : "bg-outline",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
