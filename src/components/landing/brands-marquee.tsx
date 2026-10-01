"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { landingPage } from "@/data/landing-page";
import { easeOut } from "@/components/landing/motion";

// The track is shifted by -50%, so the duplicated half must be wider than the
// viewport for the loop to look seamless.
const COPIES = 8;

export function BrandsMarquee() {
  const { brands } = landingPage;
  const track = Array.from({ length: COPIES }, () => brands.logos).flat();

  return (
    <section className="relative z-20 w-full overflow-hidden bg-background pt-10 pb-24">
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="flex items-center gap-4"
        >
          <span
            aria-hidden
            className="hidden h-px flex-1 bg-linear-to-r from-transparent to-outline-variant sm:block"
          />
          <p className="max-w-xl text-center text-sm font-semibold text-on-surface sm:text-base">
            {brands.label}
          </p>
          <span
            aria-hidden
            className="hidden h-px flex-1 bg-linear-to-l from-transparent to-outline-variant sm:block"
          />
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-brands-marquee items-center gap-10 group-hover:[animation-play-state:paused] sm:gap-14">
            {track.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex h-12 w-28 shrink-0 items-center justify-center opacity-70 transition-opacity duration-300 hover:opacity-100 hover:transition-none sm:w-32"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={128}
                  height={48}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-white"
      />
    </section>
  );
}
