import { cn } from "@/lib/cn";

const ICON_SIZES = {
  sm: 18,
  md: 20,
  lg: 24,
} as const;

type IconProps = {
  name: string;
  className?: string;
  size?: keyof typeof ICON_SIZES | number;
  filled?: boolean;
  label?: string;
};

export function Icon({
  name,
  className,
  size = "md",
  filled = false,
  label,
}: IconProps) {
  const fontSize = typeof size === "number" ? size : ICON_SIZES[size];

  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        fontSize,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
