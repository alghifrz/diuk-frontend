import { cn } from "@/lib/cn";
import {
  STAGE_LABEL,
  STAGE_STYLE,
  type CustomerStage,
} from "@/lib/customer-crm";

export function CustomerStageBadge({
  stage,
  className,
}: {
  stage: CustomerStage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        STAGE_STYLE[stage],
        className,
      )}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}
