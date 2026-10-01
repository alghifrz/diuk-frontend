import type { ReactNode } from "react";
import Image from "next/image";
import { landingPage } from "@/data/landing-page";
import { Icon } from "@/components/landing/icon";
import { buildWhatsAppUrl } from "@/lib/landing/whatsapp";

export function Footer() {
  const { footer, header, contact } = landingPage;
  const whatsappHref = buildWhatsAppUrl(
    "Halo DIUK, saya ingin bertanya tentang DIUK Solution.",
  );

  return (
    <footer className="w-full border-t border-outline-variant bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <a href={header.logo.href} className="inline-flex">
              <Image
                src={header.logo.src}
                alt={header.logo.alt}
                width={320}
                height={104}
                className="mb-4 h-12 w-auto object-contain"
              />
            </a>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-on-surface-variant">
              {footer.description}
            </p>

            <div className="mb-5 flex items-center gap-2">
              <SocialLink href={whatsappHref} label="WhatsApp">
                <WhatsAppIcon className="size-4" />
              </SocialLink>
              <SocialLink href={contact.instagram.href} label="Instagram">
                <InstagramIcon className="size-4" />
              </SocialLink>
              <SocialLink href={contact.email.href} label="Email">
                <Icon name="mail" className="text-[18px]" />
              </SocialLink>
            </div>

            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-on-surface"
                >
                  {contact.whatsapp.display}
                </a>
              </li>
              <li>
                <a
                  href={contact.instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-on-surface"
                >
                  {contact.instagram.display}
                </a>
              </li>
              <li>
                <a
                  href={contact.email.href}
                  className="transition-colors hover:text-on-surface"
                >
                  {contact.email.display}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:pt-1">
            {footer.columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-3 font-mono text-[11px] font-medium tracking-[0.18em] text-on-surface-variant uppercase">
                  {column.title}
                </h4>
                <ul className="space-y-2.5 text-sm text-on-surface-variant">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="transition-colors hover:text-on-surface"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-outline-variant pt-6 text-xs text-on-surface-variant sm:flex-row sm:items-center">
          <p className="font-mono">{footer.copyright}</p>
          <p>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary-dark"
    >
      {children}
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 6.045L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
