import { cn } from "@/lib/cn";

type UnreadBadgeProps = {
  count: number;
  className?: string;
};

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
