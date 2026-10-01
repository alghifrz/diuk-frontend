"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { FadeWords, easeOut as ease } from "@/components/landing/motion";

export function Hero() {
  const { hero } = landingPage;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.18, 0.32], [1, 0.35, 0]);
  const copyScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.96]);
  const copyBlur = useTransform(scrollYProgress, [0, 0.32], [0, 8]);
  const copyFilter = useTransform(copyBlur, (value) => `blur(${value}px)`);
  const copyPointerEvents = useTransform(copyOpacity, (value) =>
    value < 0.15 ? "none" : "auto",
  );

  return (
    <section ref={sectionRef} className="relative w-full">
      <div className="sticky top-0 h-svh overflow-hidden bg-background">
        <HeroAtmosphere />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center px-4 pt-24 text-center sm:px-6 sm:pt-28 lg:px-8">
          <motion.div
            style={{
              opacity: copyOpacity,
              scale: copyScale,
              filter: copyFilter,
              pointerEvents: copyPointerEvents,
            }}
            className="flex w-full flex-col items-center will-change-transform"
          >
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-outline-variant/80 bg-white/80 px-3 py-1 shadow-xs backdrop-blur-sm"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-xs font-medium tracking-tight text-on-surface-variant">
                {hero.badge}
              </span>
            </motion.div>

            <motion.p
              className="mb-3 font-mono text-[11px] font-bold tracking-[0.35em] text-secondary uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease }}
            >
              {hero.brand}
            </motion.p>

            <h1 className="mb-5 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-on-surface sm:text-5xl lg:text-[60px]">
              <FadeWords text={hero.headline} />{" "}
              <motion.span
                className="relative inline-block text-primary-dark"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.32, ease }}
              >
                {hero.headlineAccent}
                <motion.span
                  aria-hidden
                  className="absolute right-0 -bottom-1 left-0 h-1 origin-left rounded-full bg-linear-to-r from-primary via-primary-light to-secondary/40"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.55, ease }}
                />
              </motion.span>
            </h1>

            <motion.p
              className="mb-7 max-w-2xl text-base text-on-surface-variant sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease }}
            >
              {hero.subtitle}
            </motion.p>

            <motion.div
              className="mb-5 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.46, ease }}
            >
              <motion.a
                href={hero.primaryCta.href}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(101,147,58,0.7)] transition-colors hover:bg-primary-dark hover:shadow-[0_14px_34px_-12px_rgba(101,147,58,0.85)] sm:w-auto"
              >
                <span>{hero.primaryCta.label}</span>
                <Icon
                  name="arrow_forward"
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </motion.a>
              <motion.a
                href={hero.secondaryCta.href}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white/90 px-5 py-3 text-sm font-semibold text-on-surface shadow-xs backdrop-blur-sm transition-colors hover:bg-surface-container-low sm:w-auto"
              >
                <Icon name="play_circle" size={20} className="text-primary-dark" />
                <span>{hero.secondaryCta.label}</span>
              </motion.a>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] text-on-surface-variant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.58 }}
            >
              {hero.signals.map((signal, index) => (
                <span
                  key={signal.label}
                  className="inline-flex items-center gap-1.5"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className="mr-2.5 hidden h-1 w-1 rounded-full bg-outline-variant sm:inline-block"
                    />
                  ) : null}
                  <Icon name={signal.icon} size={14} className="text-primary-dark" />
                  {signal.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-20 -mt-[80svh] py-12 md:-mt-[100svh]">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-[clamp(22rem,52vh,34rem)] pb-8 sm:px-6 sm:pt-[clamp(24rem,54vh,36rem)] sm:pb-10 lg:px-8">
          <HeroSimulation scrollYProgress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function HeroAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(45,52,120,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(45,52,120,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 75%)",
        }}
      />

      <motion.div
        className="absolute top-[-10%] left-[8%] h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl"
        animate={{ x: [0, 28, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[8%] right-[4%] h-[380px] w-[380px] rounded-full bg-secondary/20 blur-3xl"
        animate={{ x: [0, -22, 0], y: [0, 26, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[8%] left-1/2 h-[280px] w-[640px] -translate-x-1/2 rounded-full bg-primary-light/30 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}

function HeroSimulation({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const { simulation } = landingPage.hero;

  const scale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.45, 0.75],
    [0.9, 1.06, 1.06, 1],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.22, 0.45, 0.75],
    [40, 0, 0, -20],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.22, 0.45, 0.75],
    [8, 0, 0, -2],
  );

  return (
    <div className="relative w-full max-w-6xl perspective-[1400px]">
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[70%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-linear-to-r from-secondary/25 via-primary/30 to-primary-light/25 blur-3xl"
        animate={{ opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        style={{ scale, y, rotateX, transformPerspective: 1400 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75, delay: 0.35, ease }}
        className="relative origin-center overflow-hidden rounded-2xl border border-white/70 bg-white text-left shadow-[0_30px_80px_-28px_rgba(32,38,92,0.45)] will-change-transform"
      >
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="ml-2 font-mono text-xs font-medium text-on-surface-variant">
              {simulation.title}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-success">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              {simulation.latency}
            </span>
            <span className="hidden rounded border border-outline-variant bg-white px-2 py-0.5 sm:inline">
              {simulation.version}
            </span>
          </div>
        </div>

        <div className="relative aspect-1919/942 w-full bg-surface-container-low">
          <Image
            src="/ss.png"
            alt="DIUK platform live dispatch simulation"
            width={1919}
            height={942}
            priority
            quality={100}
            unoptimized
            className="h-full w-full object-contain object-top"
            sizes="(max-width: 1919px) 100vw, 1919px"
          />
        </div>
      </motion.div>
    </div>
  );
}
