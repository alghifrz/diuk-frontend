"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/landing/icon";
import { SectionHeading } from "@/components/landing/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;

const accents = {
  green: {
    glow: "from-primary/20 via-primary/5 to-transparent",
    badge: "bg-primary/10 text-primary-dark border-primary/20",
    icon: "bg-primary text-white shadow-[0_12px_28px_-12px_rgba(101,147,58,0.8)]",
    frame: "border-primary/20 bg-linear-to-br from-primary/8 via-white to-white",
    spot: "rgba(134,187,81,0.18)",
  },
  navy: {
    glow: "from-secondary/20 via-secondary/5 to-transparent",
    badge: "bg-secondary/10 text-secondary border-secondary/20",
    icon: "bg-secondary text-white shadow-[0_12px_28px_-12px_rgba(45,52,120,0.75)]",
    frame: "border-secondary/20 bg-linear-to-br from-secondary/8 via-white to-white",
    spot: "rgba(45,52,120,0.12)",
  },
  teal: {
    glow: "from-info/20 via-info/5 to-transparent",
    badge: "bg-info/10 text-info border-info/20",
    icon: "bg-info text-white shadow-[0_12px_28px_-12px_rgba(75,123,197,0.75)]",
    frame: "border-info/20 bg-linear-to-br from-info/8 via-white to-white",
    spot: "rgba(75,123,197,0.16)",
  },
};

type Module = (typeof landingPage.features.modules)[number];

export function Features() {
  const { features } = landingPage;
  const modules = features.modules;

  // Cards stack on desktop; earlier cards shrink slightly as later ones slide over.
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start start", "end end"],
  });

  return (
    // overflow-clip (not hidden): hidden would turn the section into a scroll
    // container and break position: sticky on the cards.
    <section
      id={features.id}
      className="relative w-full overflow-clip bg-white py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(134,187,81,0.12), transparent 28%), radial-gradient(circle at 90% 60%, rgba(45,52,120,0.09), transparent 30%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
          className="mb-12"
        />

        <div ref={listRef} className="space-y-6 pb-2 lg:space-y-8">
          {modules.map((module, index) => (
            <ModuleCard
              key={module.module}
              module={module}
              index={index}
              total={modules.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Module card                                                         */
/* ------------------------------------------------------------------ */

function ModuleCard({
  module,
  index,
  total,
  progress,
}: {
  module: Module;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const palette = accents[module.accent as keyof typeof accents];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [runId, setRunId] = useState(0);

  const target = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(progress, [index / total, 1], [1, reduce ? 1 : target]);

  // Cursor-following spotlight.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${palette.spot}, transparent 70%)`;

  const canReplay = module.kind === "chat" || module.kind === "calendar";

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ scale, top: 88 + index * 18 }}
      className="group relative origin-top overflow-hidden rounded-3xl border border-outline-variant bg-white shadow-[0_20px_50px_-30px_rgba(32,38,92,0.4)] lg:sticky"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${palette.glow}`}
      />
      <motion.div
        aria-hidden
        style={{ background: spot }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative grid grid-cols-1 items-stretch gap-0 lg:grid-cols-12">
        {/* Text side */}
        <div
          className={`flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10 ${
            module.reverse ? "order-1 lg:order-2" : ""
          }`}
        >
          <div className="mb-5 flex items-center gap-3">
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -20 }}
              animate={inView ? { scale: 1, rotate: 0 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette.icon}`}
            >
              <Icon name={module.icon} className="text-2xl" />
            </motion.span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${palette.badge}`}
            >
              {module.module}
            </span>
          </div>

          <h3 className="mb-3 text-2xl font-bold tracking-tight text-on-surface sm:text-[30px] sm:leading-tight">
            {module.title}
          </h3>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-on-surface-variant sm:text-[15px]">
            {module.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {module.stats.map((stat, si) => (
              <motion.span
                key={stat.label}
                initial={reduce ? false : { opacity: 0, scale: 0.8, y: 8 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.3 + si * 0.08,
                }}
                whileHover={{ y: -2 }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                  stat.accent
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <Icon name={stat.icon} className="text-sm" />
                {stat.label}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Preview side */}
        <div
          className={`relative flex min-h-[380px] flex-col overflow-hidden border-outline-variant p-5 sm:p-6 lg:col-span-7 ${
            module.reverse
              ? "order-2 border-t lg:order-1 lg:border-t-0 lg:border-r"
              : "border-t lg:border-t-0 lg:border-l"
          } ${palette.frame} ${module.kind === "pipeline" ? "overflow-x-auto" : ""}`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(40,60,30,0.10)_1px,transparent_1px)] bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_80%)]"
          />

          <div className="relative mb-4 flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Live preview
            </span>
            <span className="inline-flex items-center gap-2">
              DIUK · {module.kind}
              {canReplay ? (
                <motion.button
                  type="button"
                  onClick={() => setRunId((v) => v + 1)}
                  whileTap={{ rotate: -360 }}
                  transition={{ duration: 0.5 }}
                  aria-label="Replay preview"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant bg-white text-on-surface-variant transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Icon name="replay" className="text-[14px]" />
                </motion.button>
              ) : null}
            </span>
          </div>

          <div className="relative flex flex-1 items-center">
            <div className="w-full">
              {module.kind === "chat" ? (
                <ChatPreview active={inView} runId={runId} />
              ) : null}
              {module.kind === "calendar" ? (
                <CalendarPreview active={inView} runId={runId} />
              ) : null}
              {module.kind === "pipeline" ? (
                <PipelinePreview active={inView} runId={runId} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Timed steps that start once `active` is true and restart when `runId` changes. */
function useSequence(active: boolean, runId: number, times: number[]) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    if (!active) return;
    if (reduce) {
      setStep(times.length);
      return;
    }
    const timers = times.map((t, i) => setTimeout(() => setStep(i + 1), t));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, reduce]);

  return step;
}

/** Types text out. The full text is rendered invisibly so the bubble never resizes. */
function Typewriter({ text, speed = 22 }: { text: string; speed?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);

  useEffect(() => {
    if (reduce) {
      setN(text.length);
      return;
    }
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduce]);

  return (
    <span className="relative block">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {text.slice(0, n)}
        {n < text.length ? (
          <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-current" />
        ) : null}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Previews                                                            */
/* ------------------------------------------------------------------ */

const CUSTOMER_MSG = "“min, bisa booked besok buat facial acne ga? harganya brpan skrg?”";
const AGENT_MSG =
  "“Bisa banget kak! Untuk Facial Acne besok ada promo Rp 280.000 (diskon 20%). Slot ready jam 11:00, 14:00, dan 16:30 di Senopati. Mau disimpankan jam berapa kak?”";

function ChatPreview({ active, runId }: { active: boolean; runId: number }) {
  // 1 customer types → 2 agent typing → 3 agent replies → 4 slots
  const step = useSequence(active, runId, [300, 2300, 3300, 5900]);

  return (
    <div key={runId} className="mx-auto w-full max-w-lg space-y-3 font-sans text-xs">
      <div className="min-h-[88px]">
        {step >= 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ originX: 0 }}
            className="max-w-[84%] rounded-2xl rounded-tl-md border border-outline-variant bg-white p-3.5 shadow-xs"
          >
            <span className="mb-1 block font-mono text-[9px] text-gray-400">
              Customer · WhatsApp
            </span>
            <p className="leading-relaxed text-on-surface">
              <Typewriter text={CUSTOMER_MSG} speed={22} />
            </p>
          </motion.div>
        ) : null}
      </div>

      <div className="min-h-[170px]">
        <AnimatePresence mode="wait">
          {step === 2 ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="ml-auto flex w-fit items-center gap-2 rounded-2xl rounded-tr-md border border-primary/25 bg-primary/10 px-3.5 py-3"
            >
              <Icon name="smart_toy" className="text-[14px] text-primary-dark" />
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary-dark/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </motion.div>
          ) : null}
          {step >= 3 ? (
            <motion.div
              key="reply"
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ originX: 1 }}
              className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md border border-primary/25 bg-primary/10 p-3.5 shadow-xs"
            >
              <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] text-primary-dark">
                <span className="inline-flex items-center gap-1 font-bold">
                  <Icon name="smart_toy" className="text-[12px]" />
                  DIUK Auto-Agent
                </span>
                <span>1.2s · 14:20</span>
              </div>
              <p className="leading-relaxed text-on-surface">
                <Typewriter text={AGENT_MSG} speed={11} />
              </p>
              <div className="mt-2.5 flex min-h-[26px] flex-wrap gap-1.5 border-t border-primary/20 pt-2">
                {step >= 4
                  ? ["11:00", "14:00", "16:30"].map((slot, i) => (
                      <motion.span
                        key={slot}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                          delay: i * 0.1,
                        }}
                        className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white"
                      >
                        {slot}
                      </motion.span>
                    ))
                  : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

const TICKET_FIELDS = [
  { label: "Service", value: "Haircut + Beard Styling" },
  { label: "Barber", value: "Yoga (Chair #2)" },
  { label: "Date & Time", value: "Saturday, 12 Sept • 14:00 WIB" },
];

function CalendarPreview({ active, runId }: { active: boolean; runId: number }) {
  // 1 fields fill → 2 status stamp + syncing → 3 synced
  const step = useSequence(active, runId, [300, 1500, 2500]);

  return (
    <div
      key={runId}
      className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-outline-variant bg-white p-4 font-mono text-xs shadow-[0_20px_50px_-30px_rgba(32,38,92,0.4)]"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span className="mb-0.5 block text-[10px] text-gray-400">Reservation ticket</span>
          <span className="font-bold text-on-surface">Barber Booking Confirmed</span>
        </div>
        <div className="flex h-7 w-[116px] items-center justify-end">
          {step >= 2 ? (
            <motion.span
              initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
              animate={{ scale: 1, rotate: -4, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className="rounded-md border-2 border-success px-2 py-0.5 text-[10px] font-bold text-success"
            >
              CONFIRMED
            </motion.span>
          ) : (
            <span className="rounded-md border-2 border-dashed border-outline-variant px-2 py-0.5 text-[10px] font-bold text-gray-400">
              PENDING
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 font-sans text-[11px]">
        {TICKET_FIELDS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0.35, y: 6 }}
            animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 6 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.18 }}
            className="rounded-xl border border-outline-variant bg-surface-container-low/70 p-2.5"
          >
            <span className="mb-1 block font-mono text-[10px] text-gray-400">
              {item.label}
            </span>
            <span className="font-semibold text-on-surface">{item.value}</span>
          </motion.div>
        ))}

        <motion.div
          animate={{
            backgroundColor: step >= 3 ? "rgba(34,160,90,0.10)" : "rgba(0,0,0,0.02)",
            borderColor: step >= 3 ? "rgba(34,160,90,0.25)" : "rgba(0,0,0,0.08)",
          }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border p-2.5"
        >
          <span
            className={`mb-1 block font-mono text-[10px] ${
              step >= 3 ? "text-success/80" : "text-gray-400"
            }`}
          >
            Sync Hook
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            {step >= 3 ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  className="flex text-success"
                >
                  <Icon name="check_circle" className="text-[14px]" />
                </motion.span>
                <span className="text-success">Google Cal Synced</span>
              </>
            ) : step >= 2 ? (
              <>
                <motion.span
                  className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-on-surface-variant">Syncing…</span>
              </>
            ) : (
              <span className="text-gray-400">Waiting</span>
            )}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

const PIPELINE_COLUMNS = [
  {
    title: "New Lead",
    base: 7,
    titleClass: "text-gray-400",
    cardClass: "bg-surface-container-low border-gray-100",
    detailClass: "text-gray-500",
    other: { name: "Tika M.", detail: "Inquiry: Nails" },
  },
  {
    title: "Qualified",
    base: 5,
    titleClass: "text-info",
    cardClass: "bg-info/10 border-info/20",
    detailClass: "text-info",
    other: { name: "Rian K.", detail: "Rp 850.000" },
  },
  {
    title: "Follow-up",
    base: 3,
    titleClass: "text-warning",
    cardClass: "bg-warning/10 border-warning/20",
    detailClass: "text-warning",
    other: { name: "Sari W.", detail: "Sent QRIS" },
  },
  {
    title: "Converted",
    base: 14,
    titleClass: "text-success",
    cardClass: "bg-success/10 border-success/20",
    detailClass: "text-success font-bold",
    other: { name: "Farhan Z.", detail: "Rp 1.450.000" },
  },
];

const LEAD_DETAILS = ["Inquiry: Bridal", "Quote Rp 2.400.000", "Sent QRIS", "Rp 2.400.000 paid"];

function PipelinePreview({ active, runId }: { active: boolean; runId: number }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  // A lead (Dewi) moves through the funnel, then the loop restarts.
  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setStage(3);
      return;
    }
    let s = 0;
    let timer: ReturnType<typeof setTimeout>;
    setStage(0);
    const loop = () => {
      timer = setTimeout(
        () => {
          s = s === 3 ? 0 : s + 1;
          setStage(s);
          loop();
        },
        s === 3 ? 2600 : 1500,
      );
    };
    loop();
    return () => clearTimeout(timer);
  }, [active, runId, reduce]);

  return (
    <div className="flex min-w-[540px] gap-2.5 font-mono text-xs">
      {PIPELINE_COLUMNS.map((column, i) => {
        const count = column.base + (stage === i ? 1 : 0);
        return (
          <div
            key={column.title}
            className="flex min-h-[200px] flex-1 flex-col gap-2 rounded-xl border border-outline-variant bg-white p-2.5 shadow-xs"
          >
            <span
              className={`mb-0.5 flex items-center justify-between text-[10px] font-bold ${column.titleClass}`}
            >
              {column.title}
              <span className="relative inline-block h-3.5 min-w-4 overflow-hidden text-right">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="block"
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>

            {stage === i ? (
              <motion.div
                layoutId="pipeline-lead"
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={`rounded-lg border p-2.5 font-sans text-[11px] shadow-sm ring-2 ring-primary/30 transition-colors duration-300 ${column.cardClass}`}
              >
                <p className="font-bold text-on-surface">Dewi Lestari</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={stage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`block font-mono text-[10px] ${column.detailClass}`}
                  >
                    {LEAD_DETAILS[stage]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            ) : null}

            <motion.div
              layout="position"
              className={`rounded-lg border p-2.5 font-sans text-[11px] ${column.cardClass}`}
            >
              <p className="font-bold text-on-surface">{column.other.name}</p>
              <span className={`font-mono text-[10px] ${column.detailClass}`}>
                {column.other.detail}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}