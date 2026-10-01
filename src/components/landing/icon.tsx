import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  className?: string;
};

/**
 * Landing-page icon. Size is driven by Tailwind classes (e.g. `text-xl`),
 * unlike the dashboard `Icon`, which sets an inline font size.
 */
export function Icon({ name, className }: IconProps) {
  return (
    <span className={cn("material-symbols-outlined", className)} aria-hidden>
      {name}
    </span>
  );
}
