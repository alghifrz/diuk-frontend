"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const LINKS = [
  { label: "Menu", href: "/menu", icon: "restaurant_menu" },
  { label: "Reservations", href: "/reservations", icon: "event" },
  { label: "Business settings", href: "/settings", icon: "settings" },
] as const;

export function AICapabilities() {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface p-4">
      <h3 className="text-sm font-semibold text-on-surface">
        What the AI can already use
      </h3>
      <p className="mt-1 text-xs leading-5 text-on-surface-variant">
        You do not need to copy this into the instructions. The AI reads it from
        your account when customers ask.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-background px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name={item.icon} size={14} />
              {item.label}
            </Link>
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-background px-3 py-1.5 text-xs font-medium text-on-surface-variant">
          <Icon name="menu_book" size={14} />
          Knowledge documents
        </li>
        <li className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-background px-3 py-1.5 text-xs font-medium text-on-surface-variant">
          <Icon name="person" size={14} />
          Customer context
        </li>
      </ul>
    </div>
  );
}
