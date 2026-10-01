"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UnreadBadge } from "@/components/chat/unread-badge";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import {
  isNavItemActive,
  navigation,
  navigationSections,
} from "@/lib/navigation";
import type { CurrentUser } from "@/types/user";

type SidebarProps = {
  user: CurrentUser;
  workspaceName?: string | null;
  unreadCount?: number;
  onNavigate?: () => void;
  onClose?: () => void;
};

function getInitial(user: CurrentUser) {
  const source = user.name ?? user.email ?? "?";
  return source.charAt(0).toUpperCase();
}

export function Sidebar({
  user,
  workspaceName,
  unreadCount = 0,
  onNavigate,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const displayName = user.name ?? user.email ?? "Signed in";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setSignOutError("");

    if (!getPublicSupabaseConfig()) {
      setSignOutError("Sign-out is not configured yet.");
      return;
    }

    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setSignOutError("Could not sign out. Please try again.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="flex items-center justify-center gap-3 border-b border-outline-variant px-4 py-4">
        <Link href="/dashboard" onClick={onNavigate} aria-label="DIUK home">
          <Logo size="sm" />
        </Link>
        {/* {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            <Icon name="close" size={20} />
          </button>
        ) : null} */}
      </div>

      <div className="px-3 pt-3">
        <WorkspaceSwitcher name={workspaceName} />
      </div>

      <nav aria-label="Application" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {navigationSections.map((section) => {
          const items = navigation.filter((item) => item.section === section);

          return (
            <div key={section} className="mb-5 last:mb-0">
              <p className="px-2.5 pb-2 font-mono text-[10px] tracking-[0.16em] text-on-surface-variant uppercase">
                {section}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isNavItemActive(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          active
                            ? "bg-primary/12 font-semibold text-on-surface"
                            : "font-medium text-on-surface-variant hover:bg-background hover:text-on-surface",
                        )}
                      >
                        <Icon
                          name={item.icon}
                          size={20}
                          filled={active}
                          className={active ? "text-primary-dark" : "text-on-surface-variant"}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.href === "/chat" ? (
                          <UnreadBadge count={unreadCount} />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-outline-variant p-3" ref={menuRef}>
        {menuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute inset-x-3 bottom-full mb-2 rounded-xl border border-outline-variant bg-surface py-1 shadow-sm"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            >
              <Icon name="logout" size={18} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : null}

        {signOutError ? (
          <p role="alert" className="mb-2 px-1 text-xs text-error">
            {signOutError}
          </p>
        ) : null}

        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white"
          >
            {getInitial(user)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">{displayName}</p>
            {user.name && user.email ? (
              <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-background hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="more_vert" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
