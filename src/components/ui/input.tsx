import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  leadingIcon?: string;
  trailing?: ReactNode;
};

export function Input({
  id,
  label,
  error,
  leadingIcon,
  trailing,
  className,
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
        {label}
      </label>
      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
            <Icon name={leadingIcon} size="sm" />
          </span>
        ) : null}
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "min-h-11 w-full rounded-xl border bg-surface px-3 text-sm text-on-surface outline-none transition-colors",
            "placeholder:text-on-surface-variant",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:bg-background disabled:text-on-surface-variant",
            leadingIcon ? "pl-10" : undefined,
            trailing ? "pr-12" : undefined,
            error ? "border-error" : "border-outline-variant",
            className,
          )}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
