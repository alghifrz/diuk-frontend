"use client";

import { useRef } from "react";
import Image from "next/image";
import {
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
import { CountUp } from "@/components/landing/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const badgeTones = {
  emerald: {
    badge: "bg-success/25 text-white border-success/50",
    glow: "from-success/40",
    icon: "bg-success text-white",
  },
  teal: {
    badge: "bg-primary/30 text-white border-primary/50",
    glow: "from-primary/40",
    icon: "bg-primary text-white",
  },
  amber: {
    badge: "bg-warning/30 text-white border-warning/50",
    glow: "from-warning/40",
    icon: "bg-warning text-white",
  },
  blue: {
    badge: "bg-info/30 text-white border-info/50",
    glow: "from-info/40",
    icon: "bg-info text-white",
  },
};

type Card = (typeof landingPage.solutions.cards)[number];

// Bento rhythm: wide / narrow, narrow / wide. A lone last card spans the full row.
const SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];
function spanFor(i: number, total: number) {
  if (i === total - 1 && total % 2 === 1) return "md:col-span-6";
  return SPANS[i % 4];
}

export function Solutions() {
  const { solutions } = landingPage;
  const total = solutions.cards.length;

  return (
    <section
      id={solutions.id}
      className="relative w-full overflow-hidden border-y border-outline-variant bg-background py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(134,187,81,0.14), transparent 30%), radial-gradient(circle at 88% 72%, rgba(45,52,120,0.11), transparent 28%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(40,60,30,0.08)_1px,transparent_1px)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={solutions.eyebrow}
            title={solutions.title}
            description={solutions.description}
            className="mb-0 max-w-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 self-start rounded-full border border-secondary/20 bg-white py-1.5 pr-3.5 pl-3 font-mono text-[11px] font-semibold text-secondary shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <Icon name="domain" className="text-sm" />
            {total} industries live
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:gap-6">
          {solutions.cards.map((card, index) => {
            const span = spanFor(index, total);
            return (
              <SolutionCard
                key={card.title}
                card={card}
                index={index}
                span={span}
                wide={span !== "md:col-span-2"}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SolutionCard({
  card,
  index,
  span,
  wide,
}: {
  card: Card;
  index: number;
  span: string;
  wide: boolean;
}) {
  const reduce = useReducedMotion();
  const tone = badgeTones[card.badgeTone as keyof typeof badgeTones];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const delay = (index % 2) * 0.12;

  // Photo drifts slowly while the card scrolls through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  // Soft light that follows the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glare = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, rgba(255,255,255,0.16), transparent 65%)`;

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0% round 28px)" }}
      animate={inView ? { clipPath: "inset(-10% -10% -10% -10% round 28px)" } : undefined}
      transition={{ duration: 0.95, ease: EASE, delay }}
      className={`group relative flex h-[420px] flex-col justify-between overflow-hidden rounded-[28px] bg-secondary-dark p-5 shadow-[0_24px_60px_-34px_rgba(32,38,92,0.55)] sm:h-[460px] sm:p-7 ${span}`}
    >
      {/* Photo */}
      <motion.div
        aria-hidden
        style={{ y: imgY }}
        className="absolute inset-x-0 -inset-y-[10%]"
      >
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          unoptimized
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
        />
      </motion.div>

      {/* Light scrim: dark only where text sits */}
      <div className="absolute inset-0 bg-linear-to-t from-secondary-dark/95 via-secondary-dark/35 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${tone.glow} via-transparent to-transparent opacity-70`}
      />
      <motion.div
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/15 transition-[box-shadow] duration-500 ring-inset group-hover:ring-white/40"
      />

      {/* Top: icon + badge */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -25 }}
          animate={inView ? { scale: 1, rotate: 0 } : undefined}
          transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.5 + delay }}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg ${tone.icon}`}
        >
          <Icon name={card.icon} className="text-2xl" />
        </motion.span>
        <motion.span
          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.6 + delay }}
          className={`rounded-full border px-3 py-1 font-mono text-[11px] font-bold backdrop-blur-md ${tone.badge}`}
        >
          <CountUp value={card.badge} />
        </motion.span>
      </div>

      {/* Bottom: text sits directly on the photo */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.75, ease: EASE, delay: 0.45 + delay }}
        className="relative z-10"
      >
        <h3
          className={`mb-2 font-bold tracking-tight text-white ${
            wide ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          }`}
        >
          {card.title}
        </h3>
        <p
          className={`text-sm leading-relaxed text-white/80 ${
            wide ? "max-w-lg sm:text-[15px]" : "max-w-sm"
          }`}
        >
          {card.description}
        </p>

        <div className="relative mt-5 inline-flex max-w-full items-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/10 py-2 pr-4 pl-4 font-mono text-[11px] backdrop-blur-md">
          <motion.span
            aria-hidden
            className="absolute inset-0 origin-left bg-white/10"
            initial={reduce ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : undefined}
            transition={{ duration: 1.3, ease: EASE, delay: 0.9 + delay }}
          />
          <span className="relative truncate text-white/70">{card.metaLabel}</span>
          <span className="relative h-3 w-px bg-white/25" />
          <span className="relative inline-flex shrink-0 items-center gap-1.5 font-bold text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            {card.metaValue}
          </span>
        </div>
      </motion.div>
    </motion.article>
  );
}