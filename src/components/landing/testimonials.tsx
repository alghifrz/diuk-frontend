"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { SectionHeading } from "@/components/landing/section-heading";

const EASE = [0.22, 1, 0.36, 1] as const;

const avatarTones = {
  teal: "bg-primary/15 text-primary-dark ring-primary/25",
  blue: "bg-secondary/10 text-secondary ring-secondary/20",
  emerald: "bg-success/15 text-success ring-success/25",
};

type Item = (typeof landingPage.testimonials.items)[number];

export function Testimonials() {
  const { testimonials } = landingPage;

  return (
    <section className="relative w-full overflow-hidden bg-background py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(134,187,81,0.12), transparent 28%), radial-gradient(circle at 92% 80%, rgba(45,52,120,0.09), transparent 28%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={testimonials.eyebrow}
          title={testimonials.title}
          className="mb-10"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {testimonials.items.map((item, index) => (
            <TestimonialCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item, index }: { item: Item; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  // Cursor-following glow inside the card.
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(134,187,81,0.16), transparent 70%)`;

  const delay = index * 0.12;

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-300);
        my.set(-300);
      }}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className="group relative flex cursor-default flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant bg-white p-6 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-[0_24px_50px_-30px_rgba(32,38,92,0.4)]"
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">
        <span
          aria-hidden
          className="mb-1 block h-8 select-none font-serif text-6xl leading-[0.8] text-primary/30"
        >
          &ldquo;
        </span>
        <p className="mb-6 text-[15px] leading-relaxed text-on-surface">
          {item.quoteBefore}
          <motion.strong
            className="rounded-sm px-0.5 font-semibold text-primary-dark [box-decoration-break:clone]"
            style={{
              backgroundImage:
                "linear-gradient(transparent 58%, rgba(134,187,81,0.38) 58%)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left",
            }}
            initial={reduce ? false : { backgroundSize: "0% 100%" }}
            animate={inView ? { backgroundSize: "100% 100%" } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: 0.5 + delay }}
          >
            {item.quoteHighlight}
          </motion.strong>
          {item.quoteAfter}
        </p>
      </div>

      <div className="relative flex items-center gap-3 border-t border-outline-variant pt-4">
        <motion.div
          initial={reduce ? false : { scale: 0 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.3 + delay }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-offset-2 ring-offset-white ${avatarTones[item.tone as keyof typeof avatarTones]}`}
        >
          {item.initials}
        </motion.div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-on-surface">{item.name}</p>
          <p className="truncate text-xs text-on-surface-variant">{item.role}</p>
        </div>
      </div>
    </motion.article>
  );
}