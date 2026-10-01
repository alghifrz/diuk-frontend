"use client";

import { useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";
import { CountUp } from "@/components/landing/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// How far each bar fills. Purely visual, one value per stat.
const FILL = [0.78, 0.92, 0.64];

type Stat = (typeof landingPage.impact.stats)[number];

export function Impact() {
  const { impact } = landingPage;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [hovered, setHovered] = useState<number | null>(null);

  // Soft spotlight that follows the cursor.
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spot = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, rgba(134,187,81,0.14), transparent 70%)`;

  return (
    <section className="w-full border-y border-outline-variant bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={impact.eyebrow}
          title={impact.title}
          align="center"
          className="mx-auto mb-10 max-w-3xl text-center"
        />

        <motion.div
          ref={ref}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
          onPointerLeave={() => {
            setHovered(null);
            mx.set(-400);
            my.set(-400);
          }}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden rounded-3xl border border-outline-variant bg-linear-to-br from-primary/8 via-white to-secondary/8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(40,60,30,0.09)_1px,transparent_1px)] bg-[length:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]"
          />
          <motion.div
            aria-hidden
            style={{ background: spot }}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative grid grid-cols-1 divide-y divide-outline-variant md:grid-cols-3 md:divide-x md:divide-y-0">
            {impact.stats.map((stat, i) => (
              <StatColumn
                key={stat.title}
                stat={stat}
                index={i}
                active={inView}
                dimmed={hovered !== null && hovered !== i}
                onHover={() => setHovered(i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatColumn({
  stat,
  index,
  active,
  dimmed,
  onHover,
}: {
  stat: Stat;
  index: number;
  active: boolean;
  dimmed: boolean;
  onHover: () => void;
}) {
  const reduce = useReducedMotion();
  const delay = 0.2 + index * 0.12;

  return (
    <motion.div
      onPointerEnter={onHover}
      animate={{ opacity: dimmed ? 0.55 : 1 }}
      transition={{ duration: 0.3 }}
      className="flex cursor-default flex-col p-6 sm:p-8"
    >
      <div className="mb-3 text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl">
        <CountUp value={stat.value} />
      </div>

      {/* thin bar that fills once */}
      {/* <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-outline-variant/60">
        <motion.div
          className="h-full origin-left rounded-full bg-linear-to-r from-primary to-primary-dark"
          style={{ width: `${FILL[index % FILL.length] * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={active ? { scaleX: 1 } : undefined}
          transition={{ duration: 1.2, ease: EASE, delay }}
        />
      </div> */}

      <h3 className="mb-1.5 text-base font-bold text-on-surface sm:text-lg">
        {stat.title}
      </h3>
      <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">
        {stat.description}
      </p>
    </motion.div>
  );
}