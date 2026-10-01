"use client";

import { Reveal } from "@/components/landing/motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  eyebrowClassName?: string;
  className?: string;
  inverted?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  eyebrowClassName = "text-primary-dark",
  className,
  inverted = false,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className ?? "mb-12"}`}
    >
      <span
        className={`mb-2 block font-mono text-xs font-bold uppercase tracking-wider ${eyebrowClassName}`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-3xl font-bold tracking-tight sm:text-4xl ${
          inverted ? "text-white" : "text-on-surface"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-2 text-base ${
            inverted ? "text-white/70" : "text-on-surface-variant"
          }`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
