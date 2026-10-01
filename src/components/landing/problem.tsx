"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;

type Item = (typeof landingPage)["problem"]["items"][number];

const CONSEQUENCE: Record<Item["kind"], string> = {
  chat: "1 customer lost in 36 minutes",
  inbox: "14 messages waiting, none answered",
  sheet: "2 guests, 1 table, no warning",
};

const STAGE: Record<Item["kind"], string> = {
  chat: "bg-[#f6f1e8]",
  inbox: "bg-surface-container-low",
  sheet: "bg-[#eef3ea]",
};

export function Problem() {
  const { problem } = landingPage;

  return (
    <section className="relative z-20 -mt-1 w-full bg-white pt-8 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={problem.eyebrow}
          title={problem.title}
          description={problem.description}
          className="mb-12 max-w-4xl"
        />

        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {problem.items.map((item, index) => (
            <ProblemRow key={item.number} item={item} flip={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemRow({ item, flip }: { item: Item; flip: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const drift = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [16, -16],
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(460px circle at ${mx}px ${my}px, rgba(190,214,170,0.28), transparent 70%)`;

  const consequence = CONSEQUENCE[item.kind];

  return (
    <article
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className="group relative grid grid-cols-1 gap-6 overflow-hidden px-2 py-8 md:grid-cols-12 md:items-stretch md:gap-8 md:px-4 md:py-10"
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, x: flip ? 32 : -32 }}
        animate={inView ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.7, ease: EASE }}
        className={`relative flex flex-col justify-between gap-10 md:col-span-5 md:py-5 ${
          flip ? "md:order-2" : ""
        }`}
      >
        <div>
          <p className="mb-4 font-mono text-[11px] font-medium tracking-[0.22em] text-on-surface-variant">
            {item.number}
          </p>
          <h3 className="relative mb-3 text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-10 -left-3 font-sans text-7xl font-bold text-on-surface/[0.045] select-none sm:-top-12 sm:text-8xl"
            >
              {item.number}
            </span>
            {item.title}
          </h3>
          <p className="max-w-md text-[15px] leading-relaxed text-on-surface-variant sm:text-base">
            {item.description}
          </p>
        </div>

        {consequence ? (
          <div className="flex items-center gap-3 border-t border-outline-variant pt-4">
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inset-0 rounded-full bg-red-500"
                animate={
                  reduce ? undefined : { scale: [1, 2.6], opacity: [0.5, 0] }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <span className="relative h-2 w-2 rounded-full bg-red-500" />
            </span>
            <p className="text-sm font-medium text-on-surface">{consequence}</p>
          </div>
        ) : null}
      </motion.div>

      <motion.div
        style={{ y: drift }}
        className={`relative md:col-span-7 ${flip ? "md:order-1" : ""}`}
      >
        <motion.div
          initial={
            reduce ? false : { opacity: 0, scale: 0.94, rotate: flip ? 1.5 : -1.5 }
          }
          animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.1 }}
          className={`relative flex h-full min-h-[360px] items-center justify-center overflow-hidden rounded-[28px] px-5 py-8 sm:px-10 ${STAGE[item.kind]}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(40,60,30,0.10)_1px,transparent_1px)] bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.9),transparent_60%)]"
          />

          <div className="relative w-full max-w-md">
            <div
              aria-hidden
              className={`absolute inset-0 translate-y-3 scale-[0.96] rounded-2xl border border-outline-variant/70 bg-white/55 ${
                flip ? "-rotate-3" : "rotate-3"
              }`}
            />
            <div
              aria-hidden
              className={`absolute inset-0 translate-y-6 scale-[0.92] rounded-2xl border border-outline-variant/50 bg-white/35 ${
                flip ? "rotate-2" : "-rotate-2"
              }`}
            />
            <motion.div
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="relative"
            >
              {item.kind === "chat" ? <ChatPreview active={inView} /> : null}
              {item.kind === "inbox" ? <InboxPreview active={inView} /> : null}
              {item.kind === "sheet" ? <SheetPreview active={inView} /> : null}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </article>
  );
}

function useSequence(active: boolean, times: number[]) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active || reduce) return;
    const timers = times.map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduce]);

  if (!active) return 0;
  if (reduce) return times.length;
  return step;
}

function Counter({ to, active }: { to: number; active: boolean }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const rounded = useTransform(value, (v) => Math.round(v));

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, {
      duration: 1.6,
      ease: EASE,
      delay: 0.3,
    });
    return () => controls.stop();
  }, [active, reduce, to, value]);

  return <motion.span>{rounded}</motion.span>;
}

function ChatPreview({ active }: { active: boolean }) {
  const step = useSequence(active, [300, 1300, 2500, 3700]);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-outline-variant bg-background p-4 shadow-[0_20px_50px_-24px_rgba(20,40,10,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary-dark">
              S
            </div>
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Sinta</p>
            <p className="font-mono text-[11px] text-on-surface-variant">
              WhatsApp · 2 hours ago
            </p>
          </div>
        </div>
        <AnimatePresence>
          {step >= 3 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-red-600"
            >
              No reply
            </motion.span>
          ) : (
            <span className="font-mono text-[11px] text-on-surface-variant">
              Online
            </span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex min-h-[92px] flex-col items-start">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-1 rounded-2xl rounded-tl-md bg-white px-4 py-3.5 shadow-xs"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-on-surface-variant/60"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          ) : null}
          {step >= 2 ? (
            <motion.div
              key="msg"
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ originX: 0, originY: 0 }}
              className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-on-surface shadow-xs"
            >
              Kak, masih ada slot facial besok sore?
              <span className="mt-1.5 block text-right font-mono text-[10px] text-on-surface-variant">
                11:02
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-3 min-h-[52px] space-y-2">
        <AnimatePresence>
          {step >= 3 ? (
            <motion.p
              key="seen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant"
            >
              <span className="text-info" aria-hidden>
                ✓✓
              </span>
              Seen at 11:04
            </motion.p>
          ) : null}
          {step >= 4 ? (
            <motion.div
              key="lost"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-xs font-medium text-red-700"
            >
              She booked elsewhere at 11:40
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InboxPreview({ active }: { active: boolean }) {
  const rows = [
    {
      name: "Budi",
      initial: "B",
      text: "Mau reservasi 4 orang malam ini",
      time: "09:12",
      unread: true,
      tint: "bg-secondary/10 text-secondary",
    },
    {
      name: "Rina",
      initial: "R",
      text: "Harga treatment-nya berapa ya?",
      time: "08:41",
      unread: true,
      tint: "bg-primary/15 text-primary-dark",
    },
    {
      name: "Ayu",
      initial: "A",
      text: "Kak masih buka?",
      time: "Yesterday",
      unread: false,
      tint: "bg-surface-container text-on-surface-variant",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_20px_50px_-24px_rgba(20,40,10,0.25)]">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <p className="text-sm font-semibold text-on-surface">Inbox</p>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-medium text-primary-dark">
          <Counter to={14} active={active} /> unread
        </span>
      </div>
      <ul>
        {rows.map((row, i) => (
          <motion.li
            key={row.name}
            initial={{ opacity: 0, x: 28 }}
            animate={active ? { opacity: 1, x: 0 } : undefined}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 22,
              delay: 0.25 + i * 0.18,
            }}
            className={`flex items-start gap-3 border-b border-outline-variant/70 px-4 py-3 last:border-b-0 ${
              row.unread ? "bg-primary/[0.04]" : ""
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${row.tint}`}
            >
              {row.initial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={`truncate text-sm ${
                    row.unread
                      ? "font-semibold text-on-surface"
                      : "font-medium text-on-surface-variant"
                  }`}
                >
                  {row.name}
                </p>
                <span className="shrink-0 font-mono text-[11px] text-on-surface-variant">
                  {row.time}
                </span>
              </div>
              <p className="truncate text-sm text-on-surface-variant">
                {row.text}
              </p>
            </div>
            <span className="relative mt-2 h-2 w-2 shrink-0">
              {row.unread ? (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary"
                    animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <span className="absolute inset-0 rounded-full bg-primary" />
                </>
              ) : null}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function SheetPreview({ active }: { active: boolean }) {
  const step = useSequence(active, [900, 1900]);
  const conflict = step >= 2;

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_20px_50px_-24px_rgba(20,40,10,0.25)]">
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-on-surface">reservasi.xlsx</p>
          <p className="font-mono text-[11px] text-on-surface-variant">
            Saturday · Table 12
          </p>
        </div>
        <AnimatePresence>
          {conflict ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="rounded-full bg-red-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-red-600"
            >
              Double booked
            </motion.span>
          ) : (
            <span className="font-mono text-[11px] text-on-surface-variant">
              2 rows
            </span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-[2rem_4.5rem_1fr_auto] gap-x-3 border-b border-outline-variant bg-surface-container-low px-4 py-2 font-mono text-[10px] font-medium tracking-wider text-on-surface-variant uppercase">
        <span />
        <span>Time</span>
        <span>Name</span>
        <span>By</span>
      </div>

      <div className="grid grid-cols-[2rem_4.5rem_1fr_auto] gap-x-3 px-4 py-2.5 text-sm">
        <span className="font-mono text-[11px] text-on-surface-variant/70">1</span>
        <span className="font-mono text-on-surface-variant">14:00</span>
        <span className="text-on-surface">Sinta · 2 pax</span>
        <span className="text-on-surface-variant">Yoga</span>
      </div>

      <div className="relative min-h-[42px]">
        <AnimatePresence>
          {step >= 1 ? (
            <motion.div
              key="row2"
              initial={{ opacity: 0, y: -36 }}
              animate={
                conflict
                  ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                  : { opacity: 1, y: 0 }
              }
              transition={
                conflict
                  ? { duration: 0.45 }
                  : { type: "spring", stiffness: 300, damping: 18 }
              }
              className={`grid grid-cols-[2rem_4.5rem_1fr_auto] gap-x-3 border-l-2 px-4 py-2.5 text-sm transition-colors duration-300 ${
                conflict
                  ? "border-red-500 bg-red-500/10"
                  : "border-transparent bg-primary/10"
              }`}
            >
              <span className="font-mono text-[11px] text-on-surface-variant/70">
                2
              </span>
              <span className="font-mono text-on-surface-variant">14:00</span>
              <span className="text-on-surface">Maya · 2 pax</span>
              <span className="text-on-surface-variant">Raka</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0.4 }}
        animate={{ opacity: conflict ? 1 : 0.4 }}
        className={`px-4 py-3 font-mono text-[11px] transition-colors ${
          conflict ? "text-red-600" : "text-on-surface-variant"
        }`}
      >
        Same table. Same hour. Two hosts.
      </motion.p>
    </div>
  );
}
