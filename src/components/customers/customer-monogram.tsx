import { cn } from "@/lib/cn";

const SIZE = {
  sm: "size-10 text-sm",
  lg: "size-16 text-2xl",
} as const;

export function CustomerMonogram({
  name,
  size = "sm",
  vip = false,
  className,
}: {
  name: string;
  size?: keyof typeof SIZE;
  vip?: boolean;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        vip
          ? "bg-secondary text-white ring-2 ring-primary ring-offset-2 ring-offset-surface"
          : "bg-secondary/90 text-white",
        SIZE[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
