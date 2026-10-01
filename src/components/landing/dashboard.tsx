"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/landing/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { CountUp } from "@/components/landing/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const hintTones = {
  navy: "text-secondary",
  muted: "text-on-surface-variant",
};

const weekHeights: Record<string, number> = {
  "h-14": 56,
  "h-20": 80,
  "h-24": 96,
  "h-28": 112,
};

const CHART_H = 160;
const BAR_SCALE = 1.3;

type Dash = typeof landingPage.dashboard;

export function Dashboard() {
  const { dashboard } = landingPage;
  const reduce = useReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, margin: "-20% 0px" });

  // The window tilts up into place as it scrolls into view.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "center center"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.93, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [48, 0]);

  return (
    <section className="relative w-full overflow-hidden bg-background py-24">
      {/* soft glow behind the window */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-[420px] max-w-5xl rounded-full bg-secondary/10 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 15%, rgba(134,187,81,0.12), transparent 28%), radial-gradient(circle at 92% 85%, rgba(45,52,120,0.10), transparent 28%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={dashboard.eyebrow}
          title={dashboard.title}
          description={dashboard.description}
          eyebrowClassName="text-secondary"
        />

        <div ref={stageRef} style={{ perspective: 1600 }}>
          <motion.div
            style={{ rotateX, scale, y, transformOrigin: "50% 0%" }}
            className="relative overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-[0_50px_100px_-40px_rgba(32,38,92,0.55)]"
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-secondary-dark/40 bg-secondary px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
                <span className="ml-2 font-mono text-xs font-medium text-white/80">
                  DIUK Operations Cockpit
                </span>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-secondary-light/40 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  {dashboard.badges[0]}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-secondary-dark/50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                  <Icon name="bolt" className="text-[14px] text-white" />
                  {dashboard.badges[1]}
                </span>
              </div>
            </div>

            <div className="relative p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(45,52,120,0.07)_1px,transparent_1px)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
              />

              {/* Metrics */}
              <div className="relative mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {dashboard.metrics.map((metric, i) => (
                  <MetricCard
                    key={metric.label}
                    metric={metric}
                    index={i}
                    active={inView}
                  />
                ))}
              </div>

              <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-12">
                <GmvChart gmv={dashboard.gmv} active={inView} />
                <LiveFeed items={dashboard.activity} active={inView} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Metric card with sparkline                                          */
/* ------------------------------------------------------------------ */

type Metric = Dash["metrics"][number];

function sparkPoints(seed: number) {
  // integer / exact arithmetic only, so server and client render identically
  return Array.from({ length: 12 }, (_, j) => {
    const x = (j / 11) * 100;
    const y = 26 - j * 1.5 + ((j * 5 + seed * 7) % 6) - 3;
    return { x, y: Math.max(3, Math.min(29, y)) };
  });
}

function MetricCard({
  metric,
  index,
  active,
}: {
  metric: Metric;
  index: number;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const pts = sparkPoints(index + 1);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L100,32 L0,32 Z`;
  const gid = `spark-${index}`;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: EASE, delay: 0.25 + index * 0.08 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-4"
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-secondary"
        initial={reduce ? false : { scaleX: 0 }}
        animate={active ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay: 0.5 + index * 0.08 }}
      />
      <span className="mb-1 block font-mono text-[11px] text-on-surface-variant">
        {metric.label}
      </span>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-secondary">
          <CountUp value={metric.value} />
        </p>
        <svg
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          className="h-8 w-16 shrink-0 overflow-visible sm:w-20"
          aria-hidden
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(45,52,120)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(45,52,120)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill={`url(#${gid})`}
            initial={reduce ? false : { opacity: 0 }}
            animate={active ? { opacity: 1 } : undefined}
            transition={{ duration: 0.8, delay: 1 + index * 0.08 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke="rgb(45,52,120)"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            animate={active ? { pathLength: 1 } : undefined}
            transition={{ duration: 1.2, ease: EASE, delay: 0.6 + index * 0.08 }}
          />
        </svg>
      </div>
      <span
        className={`mt-1 block font-mono text-[10px] font-semibold ${hintTones[metric.hintTone as keyof typeof hintTones]}`}
      >
        {metric.hint}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* GMV chart                                                           */
/* ------------------------------------------------------------------ */

function GmvChart({ gmv, active }: { gmv: Dash["gmv"]; active: boolean }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const n = gmv.weeks.length;

  const px = gmv.weeks.map((w) => (weekHeights[w.height] ?? 56) * BAR_SCALE);
  const linePath = px
    .map((h, i) => `${i === 0 ? "M" : "L"}${((i + 0.5) / n) * 100},${CHART_H - h}`)
    .join(" ");

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
      className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:col-span-7"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px] text-secondary">{gmv.label}</span>
          <h4 className="text-2xl font-bold text-secondary">{gmv.value}</h4>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 font-mono text-xs font-bold text-secondary">
          <Icon name="trending_up" className="text-[14px]" />
          <CountUp value={gmv.growth} />
        </span>
      </div>

      <div>
        <div className="relative" style={{ height: CHART_H }}>
          {/* gridlines */}
          {[0, 1, 2, 3].map((l) => (
            <span
              key={l}
              aria-hidden
              className="absolute inset-x-0 border-t border-dashed border-outline-variant/70"
              style={{ top: `${(l / 4) * 100}%` }}
            />
          ))}

          {/* bars */}
          <div className="absolute inset-0 flex items-end gap-3">
            {gmv.weeks.map((week, i) => (
              <div
                key={week.label}
                className="flex h-full flex-1 items-end"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <motion.div
                  className={`w-full rounded-t-md ${
                    week.active
                      ? "bg-linear-to-t from-secondary to-secondary-light"
                      : "bg-secondary-light/35"
                  }`}
                  initial={reduce ? false : { height: 0 }}
                  animate={{
                    height: active ? px[i] : 0,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                  transition={{
                    height: { duration: 0.8, delay: 0.7 + i * 0.08, ease: EASE },
                    opacity: { duration: 0.2 },
                  }}
                />
              </div>
            ))}
          </div>

     

          {/* dots on the line */}
          {px.map((h, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute -ml-1.5 -mb-1.5 h-3 w-3 rounded-full border-2 border-primary bg-white"
              style={{ left: `${((i + 0.5) / n) * 100}%`, bottom: h }}
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: active ? (hover === i ? 1.5 : 1) : 0 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 16,
                delay: hover === null ? 1.3 + i * 0.1 : 0,
              }}
            />
          ))}
        </div>

        <div className="mt-2 flex gap-3">
          {gmv.weeks.map((week, i) => (
            <span
              key={week.label}
              className={`flex-1 text-center font-mono text-[10px] transition-colors ${
                week.active || hover === i
                  ? "font-bold text-secondary"
                  : "text-text-muted"
              }`}
            >
              {week.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Live conversation feed                                              */
/* ------------------------------------------------------------------ */

type Activity = Dash["activity"][number];
type FeedItem = Activity & { id: number };

function LiveFeed({ items, active }: { items: Dash["activity"]; active: boolean }) {
  const reduce = useReducedMotion();
  const n = items.length;
  const counter = useRef(n);
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    items.map((item, i) => ({ ...item, id: i })),
  );

  // New conversations arrive at the top; the oldest drops off.
  useEffect(() => {
    if (!active || reduce || n === 0) return;
    const id = setInterval(() => {
      const next = counter.current++;
      const entry: FeedItem = { ...items[next % n], id: next };
      setFeed((prev) => [entry, ...prev].slice(0, n));
    }, 2800);
    return () => clearInterval(id);
  }, [active, reduce, n, items]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE, delay: 0.62 }}
      className="rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:col-span-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-secondary">
          Live Conversation Activity
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
      </div>

      <ul className="space-y-2 font-mono text-xs">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((item, i) => (
            <motion.li
              key={item.id}
              layout
              initial={
                item.id < n
                  ? false
                  : { opacity: 0, y: -26, scale: 0.96, backgroundColor: "rgba(45,52,120,0.14)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, backgroundColor: "#ffffff" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex items-center justify-between rounded border-l-2 border-secondary bg-white p-2.5"
            >
              <div>
                <p className="flex items-center gap-1.5 font-sans font-bold text-on-surface">
                  {item.name}
                  {i === 0 && item.id >= n ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-secondary px-1.5 py-px font-mono text-[9px] font-semibold text-white"
                    >
                      new
                    </motion.span>
                  ) : null}
                </p>
                <span className="text-[10px] text-text-muted">{item.detail}</span>
              </div>
              <span className="font-bold text-secondary">{item.value}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}