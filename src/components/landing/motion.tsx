"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: easeOut }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  fast = false,
  ...props
}: HTMLMotionProps<"div"> & { fast?: boolean }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fast ? staggerFast : staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

function parseCountTarget(value: string): {
  prefix: string;
  end: number;
  decimals: number;
  suffix: string;
} | null {
  const match = value.match(/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;

  const [, prefix, num, suffix] = match;
  const cleaned = num.replace(/,/g, "");
  const decimals = cleaned.includes(".") ? cleaned.split(".")[1].length : 0;
  const end = Number.parseFloat(cleaned);
  if (Number.isNaN(end)) return null;

  return { prefix, end, decimals, suffix };
}

export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const parsed = parseCountTarget(value);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 70, damping: 22 });

  useEffect(() => {
    if (inView && parsed) {
      motionValue.set(parsed.end);
    }
  }, [inView, motionValue, parsed]);

  useEffect(() => {
    if (!parsed) return;

    const unsubscribe = spring.on("change", (latest) => {
      if (!ref.current) return;
      const formatted =
        parsed.decimals > 0
          ? latest.toFixed(parsed.decimals)
          : Math.round(latest).toLocaleString("en-US");
      ref.current.textContent = `${parsed.prefix}${formatted}${parsed.suffix}`;
    });

    return unsubscribe;
  }, [spring, parsed]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}0{parsed.suffix}
    </span>
  );
}

export function FadeWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.08 + index * 0.035,
            ease: easeOut,
          }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : null}
        </motion.span>
      ))}
    </span>
  );
}
