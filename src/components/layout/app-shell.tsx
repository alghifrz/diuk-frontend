"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { cn } from "@/lib/cn";
import type { CurrentUser } from "@/types/user";

/** Split-pane workspaces that manage their own scrolling. */
const FULL_HEIGHT_ROUTES = [
  "/chat",
  "/reservations",
  "/customers",
  "/area",
  "/menu",
  "/prompt",
];

type AppShellProps = {
  user: CurrentUser;
  workspaceName?: string | null;
  children: ReactNode;
};

export function AppShell({ user, workspaceName, children }: AppShellProps) {
  const pathname = usePathname();
  const fullHeight = FULL_HEIGHT_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const unreadCount = useUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-outline-variant lg:flex">
        <Sidebar user={user} workspaceName={workspaceName} unreadCount={unreadCount} />
      </aside>

      <MobileSidebar
        open={mobileOpen}
        user={user}
        workspaceName={workspaceName}
        unreadCount={unreadCount}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          menuOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((open) => !open)}
        />
        <main
          className={cn(
            "min-h-0 flex-1",
            fullHeight ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {fullHeight ? (
            <div className="h-full min-h-0">{children}</div>
          ) : (
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
