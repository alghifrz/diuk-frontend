"use client";

import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { CurrentUser } from "@/types/user";

type HeaderProps = {
  user: CurrentUser;
  menuOpen: boolean;
  onMenuToggle: () => void;
};

function getInitial(user: CurrentUser) {
  const source = user.name ?? user.email ?? "?";
  return source.charAt(0).toUpperCase();
}

export function Header({ user, menuOpen, onMenuToggle }: HeaderProps) {
  const page = usePageMeta();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-outline-variant bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="inline-flex size-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
        >
          <Icon name={menuOpen ? "close" : "menu"} size={22} />
        </button>

        <div className="min-w-0 lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="hidden min-w-0 lg:block">
          <h1 className="truncate text-base font-semibold text-on-surface">
            {page.title}
          </h1>
          {page.description ? (
            <p className="truncate text-xs text-on-surface-variant">
              {page.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex size-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="notifications" size={22} />
        </button>

        <span
          aria-hidden
          className="hidden size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white sm:inline-flex"
          title={user.name ?? user.email ?? "Signed in"}
        >
          {getInitial(user)}
        </span>
      </div>
    </header>
  );
}
