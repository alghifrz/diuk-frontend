"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/landing/icon";
import { buildWhatsAppUrl } from "@/lib/landing/whatsapp";

const EASE = [0.22, 1, 0.36, 1] as const;

const MESSAGE =
  "“Terima kasih Kak Siti! Deposit reservasi telah diterima via QRIS.”";

export function Cta() {
  const { cta } = landingPage;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section className="relative w-full overflow-hidden bg-secondary py-16 text-white sm:py-20">
      {/* Background: aurora + dot grid */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/30 blur-[110px]"
        animate={reduce ? undefined : { x: [0, 70, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-40 h-[420px] w-[420px] rounded-full bg-secondary-light/60 blur-[120px]"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"
      />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:col-span-7"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pr-3 pl-2.5 font-mono text-xs font-semibold text-primary-light backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-light opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-light" />
              </span>
              {cta.eyebrow}
            </span>
            <h2 className="mb-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {cta.title}
            </h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/80">
              {cta.description}
            </p>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <MagneticButton
                href={buildWhatsAppUrl(cta.primaryCta.waMessage)}
                className="group/cta relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-12px_rgba(134,187,81,0.8)] transition-colors hover:bg-primary-dark sm:w-auto"
              >
                {!reduce ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-[20deg] bg-white/30 blur-[2px]"
                    initial={{ x: "-150%" }}
                    animate={{ x: "450%" }}
                    transition={{
                      duration: 1.4,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 2.8,
                    }}
                  />
                ) : null}
                <span className="relative">{cta.primaryCta.label}</span>
                <Icon
                  name="arrow_forward"
                  className="relative text-base transition-transform duration-200 group-hover/cta:translate-x-1"
                />
              </MagneticButton>

              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={buildWhatsAppUrl(cta.secondaryCta.waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                <Icon name="calendar_today" className="text-base" />
                <span>{cta.secondaryCta.label}</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Payment confirmation card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ConfirmationCard active={inView} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic button: leans toward the cursor                            */
/* ------------------------------------------------------------------ */

function MagneticButton({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      {children}
    </motion.a>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation card                                                   */
/* ------------------------------------------------------------------ */

function ConfirmationCard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  // 1 message types → 2 booking details → 3 payment locked
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setStep(3);
      return;
    }
    const timers = [600, 2500, 3500].map((t, i) =>
      setTimeout(() => setStep(i + 1), t),
    );
    return () => timers.forEach(clearTimeout);
  }, [active, reduce]);

  return (
    <div className="rounded-2xl border border-primary/30 bg-white p-5 text-on-surface shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3 font-mono text-xs">
        <span className="flex items-center gap-1.5 font-bold text-success">
          <Icon name="check_circle" className="text-base" /> Verified WhatsApp Business
        </span>
        <span className="text-text-muted">16:02 WIB</span>
      </div>

      <div className="space-y-3 font-sans text-xs">
        <p className="min-h-[2.75rem] font-medium leading-relaxed text-on-surface">
          {step >= 1 ? <Typewriter text={MESSAGE} /> : null}
        </p>

        <div className="space-y-1.5 rounded-lg border border-outline-variant bg-surface-container-low p-3 font-mono text-[11px]">
          <motion.div
            initial={reduce ? false : { opacity: 0.3, x: -8 }}
            animate={step >= 2 ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex justify-between gap-3"
          >
            <span className="text-text-muted">Booking:</span>
            <span className="font-bold text-on-surface">Acne Laser • Dr. Nadia</span>
          </motion.div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-text-muted">Status:</span>
            <span className="relative flex h-5 items-center overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {step >= 3 ? (
                  <motion.span
                    key="paid"
                    initial={{ y: 12, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className="flex items-center gap-1 font-bold text-success"
                  >
                    <Icon name="lock" className="text-[13px]" />
                    PAID & LOCKED
                  </motion.span>
                ) : (
                  <motion.span
                    key="pending"
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 font-bold text-warning"
                  >
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full border-2 border-warning border-t-transparent"
                      animate={reduce ? undefined : { rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                    {step >= 2 ? "CHECKING QRIS" : "WAITING"}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Types text out; the full text is rendered invisibly so the layout never jumps. */
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