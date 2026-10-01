import Image from "next/image";

export function BrandPanel() {
  return (
    <aside className="relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-white/10 bg-secondary-dark p-12 text-white lg:flex lg:w-[46%] xl:w-[45%] xl:p-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--color-primary)_35%,transparent)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 size-80 rounded-full bg-success/10 blur-3xl" />

      <div className="relative z-10 my-auto py-8">
        <div className="relative pt-5">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
            <div className="relative h-80 xl:h-87.5">
              <Image
                src="/images/login-clinic.jpg"
                alt="Modern clinic treatment room"
                fill
                priority
                sizes="(min-width: 1280px) 45vw, 46vw"
                className="object-cover object-center brightness-[0.88] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
            </div>

            <div className="absolute right-5 bottom-4 left-5 flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-2 font-medium tracking-wide">
                <span className="size-2 animate-pulse rounded-full bg-success" />
                GlowCare Clinic · Senopati Main
              </span>
              <span className="font-mono text-[11px] text-white/55">
                DIUK Engine v2.4 Active
              </span>
            </div>
          </div>

          <div className="animate-login-float absolute top-2 right-16 left-4 z-10 rounded-xl border border-white/40 bg-white/94 p-3 text-on-surface shadow-xl backdrop-blur-md sm:right-20">
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-white shadow-sm">
                WA
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[12px] font-semibold text-on-surface">
                    Sukarni Putri
                  </span>
                  <span className="text-[10px] text-outline">10:28 AM</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                  &quot;Halo Kak, ada slot dokter Sarah besok jam 10.30?&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="animate-login-float-delayed absolute right-4 bottom-12 left-16 z-10 rounded-xl border border-primary/30 bg-white/94 p-3.5 text-on-surface shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary-dark" />
                </span>
                <span className="text-[11px] font-bold tracking-tight text-primary-dark uppercase">
                  AI Smart Booking · 1.1s
                </span>
              </div>
              <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                Confirmed
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <div>
                <p className="font-semibold text-on-surface">
                  Dr. Sarah Sp.KK · Suite 2
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  Skin Consultation & Hydration
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded bg-surface-container-low px-2 py-0.5 font-mono text-[11px] font-bold text-on-surface">
                  Rp 450.000
                </span>
                <p className="text-[9px] font-medium text-primary-dark">
                  QRIS Deposit Locked
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-medium text-primary-light">
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Automate Service. Accelerate Growth.
          </div>
          <h2 className="text-2xl leading-snug font-bold tracking-tight xl:text-3xl">
            Turn customer conversations into business transactions.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            The autonomous conversational engine for Indonesian clinics,
            salons, dining spaces, and appointment businesses.
          </p>
        </div>
      </div>
    </aside>
  );
}
