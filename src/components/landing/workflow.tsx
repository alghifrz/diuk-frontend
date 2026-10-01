"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/landing/icon";
import { SectionHeading } from "@/components/landing/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;
const TICK_MS = 2200;

type Step = (typeof landingPage.workflow.steps)[number];
type Status = "done" | "running" | "queued";

export function Workflow() {
  const { workflow } = landingPage;
  const steps = workflow.steps;
  const n = steps.length;

  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), TICK_MS);
    return () => clearInterval(id);
  }, [inView, paused, reduce, n]);

  const statusOf = (i: number): Status => {
    if (reduce) return "done";
    if (i < active) return "done";
    if (i === active) return "running";
    return "queued";
  };

  const progress = reduce ? 1 : active / (n - 1);
  const current = steps[reduce ? n - 1 : active];

  return (
    <section
      id={workflow.id}
      className="relative w-full overflow-hidden bg-background py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-white to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={workflow.eyebrow}
            title={workflow.title}
            description={workflow.description}
            className="mb-0 max-w-2xl"
          />

          <div className="inline-flex min-w-[260px] items-center gap-3 self-start rounded-full border border-outline-variant bg-white/90 py-2 pr-4 pl-3 shadow-xs backdrop-blur-sm lg:self-auto">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[11px] font-medium tracking-wider text-on-surface-variant">
              {reduce ? n : active + 1} / {n}
            </span>
            <span className="h-4 w-px bg-outline-variant" />
            <span className="relative h-4 flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={current.step}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="absolute inset-0 truncate text-xs font-medium text-on-surface"
                >
                  {current.label}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </div>

        <div ref={ref}>
          <div className="relative mb-6 hidden h-6 md:block" aria-hidden>
            <div className="absolute top-1/2 right-[10%] left-[10%] h-px -translate-y-1/2 bg-outline-variant" />
            <div className="absolute top-1/2 right-[10%] left-[10%] h-0">
              <motion.div
                className="absolute top-0 left-0 h-[2px] w-full origin-left -translate-y-1/2 rounded-full bg-linear-to-r from-primary/30 to-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: inView ? progress : 0 }}
                transition={{
                  duration: active === 0 ? 0.35 : 0.9,
                  ease: EASE,
                }}
              />
              <motion.div
                className="absolute top-0 -ml-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(134,187,81,0.18)]"
                initial={{ left: "0%" }}
                animate={{
                  left: `${progress * 100}%`,
                  opacity: inView ? 1 : 0,
                }}
                transition={{
                  duration: active === 0 ? 0.35 : 0.9,
                  ease: EASE,
                }}
              />
            </div>
            <div className="relative grid h-full grid-cols-5 gap-3">
              {steps.map((step, i) => {
                const status = statusOf(i);
                return (
                  <div
                    key={step.step}
                    className="flex items-center justify-center"
                  >
                    <motion.span
                      animate={{
                        scale: status === "running" ? 1.25 : 1,
                        backgroundColor:
                          status === "queued"
                            ? "#ffffff"
                            : "rgb(134,187,81)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 18,
                      }}
                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                        status === "queued"
                          ? "border-outline-variant"
                          : "border-primary"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-5"
            onPointerLeave={() => setPaused(false)}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                className="flex flex-col items-center md:block"
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    setPaused(true);
                    setActive(i);
                  }
                }}
              >
                <WorkflowCard
                  step={step}
                  index={i}
                  total={steps.length}
                  status={statusOf(i)}
                  reduce={!!reduce}
                />
                {i < steps.length - 1 ? (
                  <div className="relative my-1 h-5 w-px bg-outline-variant md:hidden">
                    <motion.span
                      className="absolute inset-x-0 top-0 w-px origin-top bg-primary"
                      animate={{
                        scaleY: statusOf(i) === "done" ? 1 : 0,
                      }}
                      style={{ height: "100%" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowCard({
  step,
  index,
  total,
  status,
  reduce,
}: {
  step: Step;
  index: number;
  total: number;
  status: Status;
  reduce: boolean;
}) {
  const running = status === "running";
  const done = status === "done";
  const last = step.highlight;

  return (
    <motion.div
      animate={{
        y: running && !reduce ? -6 : 0,
        opacity: status === "queued" ? 0.72 : 1,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`relative flex h-full min-h-[292px] w-full flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 transition-[box-shadow,border-color] duration-300 ${
        running
          ? "border-primary/45 shadow-[0_22px_44px_-28px_rgba(101,147,58,0.7)]"
          : last && done
            ? "border-primary/30 shadow-sm"
            : "border-outline-variant shadow-sm"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 -right-1 font-mono text-6xl font-bold text-on-surface/[0.045]"
      >
        {step.step}
      </span>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-on-surface-variant">
            {step.step} · {step.stage}
          </span>
          <motion.span
            animate={{ rotate: running && !reduce ? [0, -8, 8, 0] : 0 }}
            transition={{ duration: 0.55 }}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300 ${
              running
                ? "bg-primary text-white"
                : done
                  ? "bg-primary/15 text-primary-dark"
                  : "bg-surface-container-low text-on-surface-variant"
            }`}
          >
            <Icon name={step.icon} className="text-lg" />
          </motion.span>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low/80 p-3 font-mono text-[11px]">
          <div className="space-y-1.5">
            {step.lines.map((line, lineIndex) => (
              <motion.div
                key={line.text}
                initial={false}
                animate={{
                  opacity: running || done || reduce ? 1 : 0.4,
                  y: running || done || reduce ? 0 : 4,
                }}
                transition={{
                  duration: 0.3,
                  delay: running ? lineIndex * 0.08 : 0,
                  ease: EASE,
                }}
              >
                <WorkflowLine kind={line.kind} text={line.text} />
              </motion.div>
            ))}
          </div>

          {running && !reduce ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-transparent via-primary/15 to-transparent"
              initial={{ y: "-100%" }}
              animate={{ y: "340%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          ) : null}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-sm font-semibold tracking-tight text-on-surface">
          {step.label}
        </p>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-on-surface-variant">
          <StatusGlyph status={status} reduce={reduce} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {done
                ? last
                  ? "On the floor"
                  : "Done"
                : running
                  ? "In progress"
                  : "Waiting"}{" "}
              · {index + 1}/{total}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function StatusGlyph({
  status,
  reduce,
}: {
  status: Status;
  reduce: boolean;
}) {
  if (status === "done") {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white"
      >
        <Icon name="check" className="text-[11px]" />
      </motion.span>
    );
  }

  if (status === "running") {
    return (
      <motion.span
        className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  return (
    <span className="h-4 w-4 rounded-full border-2 border-dashed border-outline-variant" />
  );
}

function WorkflowLine({ kind, text }: { kind: string; text: string }) {
  if (kind === "meta") {
    return (
      <div className="font-mono text-[10px] text-on-surface-variant">{text}</div>
    );
  }

  if (kind === "success") {
    return <div className="font-semibold text-success">{text}</div>;
  }

  if (kind === "strong") {
    return <div className="font-semibold text-on-surface">{text}</div>;
  }

  if (kind === "chip") {
    return (
      <span className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary-dark">
        {text}
      </span>
    );
  }

  if (kind === "chip-success") {
    return (
      <span className="inline-block rounded-md bg-success/15 px-1.5 py-0.5 text-[10px] text-success">
        {text}
      </span>
    );
  }

  if (kind === "chip-invert") {
    return (
      <span className="inline-block rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">
        {text}
      </span>
    );
  }

  return <div className="leading-relaxed text-on-surface">{text}</div>;
}
