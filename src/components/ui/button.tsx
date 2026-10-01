import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark disabled:hover:bg-primary",
  secondary:
    "bg-secondary text-white hover:bg-[#242a63] disabled:hover:bg-secondary",
  ghost:
    "bg-surface text-on-surface border border-outline-variant hover:bg-background",
  destructive: "bg-error text-white hover:bg-[#a81f1f] disabled:hover:bg-error",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClassName[variant],
        className,
      )}
    >
      {loading ? (
        <Icon name="progress_activity" size="sm" className="animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
