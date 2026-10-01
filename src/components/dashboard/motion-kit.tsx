"use client";

import Link from "next/link";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, type ComponentProps } from "react";

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** `Link` that can take motion props (whileHover, variants, ...). */
export const MotionLink = motion.create(Link);

export function staggerContainer(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const slideItem: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

/** Props that fade a block up the first time it scrolls into view. */
export function revealOnView(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  } as const;
}

/** Parent that reveals its `riseItem` / `slideItem` children one after another. */
export function Stagger({
  stagger = 0.07,
  delay = 0,
  inView = false,
  ...props
}: ComponentProps<typeof motion.div> & {
  stagger?: number;
  delay?: number;
  inView?: boolean;
}) {
  const variants = staggerContainer(stagger, delay);
  return inView ? (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      {...props}
    />
  ) : (
    <motion.div variants={variants} initial="hidden" animate="show" {...props} />
  );
}

/**
 * Counts up from the previous value to `value`. Falls back to the final value
 * immediately when the user prefers reduced motion.
 */
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  duration = 1,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const text = useTransform(motionValue, (latest) => format(latest));

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [value, reduce, duration, motionValue]);

  return <motion.span className={className}>{text}</motion.span>;
}
