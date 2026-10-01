"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/ui/icon";
import { easeOut } from "@/components/landing/motion";

export function Header() {
  const { header } = landingPage;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    const ids = header.navItems.map((item) => item.href.replace(/^#/, ""));

    const syncActive = () => {
      if (window.scrollY < 80) {
        setActiveHref("");
        return;
      }

      const marker = 96;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) {
          current = `#${id}`;
        }
      }
      setActiveHref(current);
    };

    syncActive();
    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("hashchange", syncActive);
    return () => {
      window.removeEventListener("scroll", syncActive);
      window.removeEventListener("hashchange", syncActive);
    };
  }, [header.navItems]);

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <div className="pointer-events-auto mx-auto max-w-5xl">
        <motion.div
          className="rounded-2xl border border-white/60 backdrop-blur-xl md:rounded-full"
          animate={{
            backgroundColor: scrolled
              ? "rgba(255,255,255,0.78)"
              : "rgba(255,255,255,0.5)",
            boxShadow: scrolled
              ? "0 12px 40px -12px rgba(30,36,48,0.38)"
              : "0 8px 32px -12px rgba(30,36,48,0.22)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4">
            <motion.a
              href={header.logo.href}
              className="flex shrink-0 items-center gap-2"
              onClick={() => setActiveHref("")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Image
                src={header.logo.src}
                alt={header.logo.alt}
                width={320}
                height={104}
                className="h-8 w-auto object-contain sm:h-9"
                priority
              />
            </motion.a>

            <nav className="hidden items-center gap-0.5 md:flex">
              {header.navItems.map((item, index) => {
                const isActive = activeHref === item.href;

                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveHref(item.href)}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.25 + index * 0.06,
                      ease: easeOut,
                    }}
                    className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/70 ${
                      isActive
                        ? "text-on-surface"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                    {isActive ? (
                      <motion.span
                        aria-hidden
                        layoutId="landing-nav-indicator"
                        className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    ) : null}
                  </motion.a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <a
                href={header.login.href}
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-white/70 hover:text-on-surface sm:inline"
              >
                {header.login.label}
              </a>
              <motion.a
                href={header.cta.href}
                className="group flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:px-4"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>{header.cta.label}</span>
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </motion.a>
              <motion.button
                type="button"
                className="rounded-full p-2 text-on-surface transition-colors hover:bg-white/70 md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "close" : "menu"}
                    className="flex"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                  >
                    <Icon name={open ? "close" : "menu"} size={24} />
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.nav
                key="mobile-menu"
                className="overflow-hidden md:hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                <div className="flex flex-col gap-0.5 border-t border-outline-variant/60 px-3 py-3">
                  {header.navItems.map((item, index) => {
                    const isActive = activeHref === item.href;

                    return (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "true" : undefined}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.05 + index * 0.05,
                          ease: easeOut,
                        }}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/70 ${
                          isActive
                            ? "bg-white/60 text-on-surface underline decoration-primary decoration-2 underline-offset-4"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                        onClick={() => {
                          setActiveHref(item.href);
                          setOpen(false);
                        }}
                      >
                        {item.label}
                      </motion.a>
                    );
                  })}
                  <motion.a
                    href={header.login.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.05 + header.navItems.length * 0.05,
                      ease: easeOut,
                    }}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-white/70 hover:text-on-surface sm:hidden"
                    onClick={() => setOpen(false)}
                  >
                    {header.login.label}
                  </motion.a>
                </div>
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.header>
  );
}
