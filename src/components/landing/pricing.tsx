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
import { Icon } from "@/components/landing/icon";
import { SectionHeading } from "@/components/landing/section-heading";
import { buildWhatsAppUrl } from "@/lib/landing/whatsapp";

const EASE = [0.22, 1, 0.36, 1] as const;

type Plan = (typeof landingPage.pricing.plans)[number];

export function Pricing() {
  const { pricing } = landingPage;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  return (
    <section
      id={pricing.id}
      className="relative w-full overflow-hidden border-y border-outline-variant bg-white py-16 sm:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 55%, rgba(134,187,81,0.13), transparent 38%), radial-gradient(circle at 5% 10%, rgba(45,52,120,0.07), transparent 28%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          description={pricing.description}
          align="center"
          className="mx-auto mb-12 max-w-3xl text-center"
        />

        <div
          ref={ref}
          className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-7"
        >
          {pricing.plans.map((plan, index) => (
            <PlanCard key={plan.name} plan={plan} index={index} active={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  index,
  active,
}: {
  plan: Plan;
  index: number;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const featured = plan.featured;
  const delay = index * 0.12;

  // Cursor-following glow inside the card.
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const glow = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgba(134,187,81,0.16), transparent 70%)`;

  return (
    <motion.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-300);
        my.set(-300);
      }}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      className={`group relative flex rounded-2xl ${
        featured
          ? "overflow-hidden bg-primary/30 p-[2px] shadow-[0_30px_60px_-30px_rgba(101,147,58,0.7)] lg:-my-3"
          : "border border-outline-variant bg-surface-container-low"
      }`}
    >
      {/* Light that travels around the featured border */}
      {featured ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-[100%]"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(134,187,81,0) 0deg, rgb(134,187,81) 70deg, rgba(45,52,120,0.9) 150deg, rgba(134,187,81,0) 220deg, rgba(134,187,81,0) 360deg)",
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      <div
        className={`relative flex w-full flex-col justify-between overflow-hidden p-6 sm:p-7 ${
          featured ? "rounded-[14px] bg-white" : "rounded-2xl"
        }`}
      >
        <motion.div
          aria-hidden
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        <div className="relative">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="mb-1 block font-mono text-[11px] text-on-surface-variant">
                {plan.category}
              </span>
              <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
            </div>
            {featured ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-xs">
                <Icon name="auto_awesome" className="text-[12px]" />
                {plan.badge}
              </span>
            ) : null}
          </div>

          <p className="mb-5 text-xs leading-relaxed text-on-surface-variant">
            {plan.description}
          </p>

          <div className="mb-5 flex items-baseline gap-1 border-b border-outline-variant pb-5">
            <span className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              {plan.price}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              {plan.period}
            </span>
          </div>

          <ul className="mb-5 space-y-2.5 text-[13px] text-on-surface">
            {plan.features.map((feature, i) => (
              <motion.li
                key={feature}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={active ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.4, ease: EASE, delay: 0.35 + delay + i * 0.06 }}
                className="flex items-start gap-2.5"
              >
                <span className="mt-px flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-dark">
                  <Icon name="check" className="text-[13px]" />
                </span>
                {feature}
              </motion.li>
            ))}
          </ul>

          <div className="mb-6 flex items-center justify-between rounded-lg border border-outline-variant bg-white px-3 py-2.5">
            <span className="font-mono text-[11px] text-on-surface-variant">
              Setup fee
            </span>
            <span className="text-sm font-bold text-on-surface">{plan.setupFee}</span>
          </div>
        </div>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={buildWhatsAppUrl(plan.waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={`group/cta relative flex items-center justify-center gap-1.5 overflow-hidden rounded-lg py-2.5 text-center text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            featured
              ? "bg-primary text-white shadow-xs hover:bg-primary-dark"
              : "border border-outline-variant bg-white text-on-surface hover:bg-surface-container"
          }`}
        >
          {featured && !reduce ? (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-[20deg] bg-white/30 blur-[2px]"
              initial={{ x: "-150%" }}
              animate={{ x: "450%" }}
              transition={{
                duration: 1.4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2.6,
              }}
            />
          ) : null}
          <span className="relative">{plan.cta}</span>
          <Icon
            name="arrow_forward"
            className="relative text-[15px] transition-transform duration-200 group-hover/cta:translate-x-0.5"
          />
        </motion.a>
      </div>
    </motion.div>
  );
}