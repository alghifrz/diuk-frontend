import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardPadding = "none" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
};

const paddingClassName: Record<CardPadding, string> = {
  none: "",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className, padding = "lg" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant bg-surface",
        paddingClassName[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
