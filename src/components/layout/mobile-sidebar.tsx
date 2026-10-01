"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/cn";
import type { CurrentUser } from "@/types/user";

type MobileSidebarProps = {
  open: boolean;
  user: CurrentUser;
  workspaceName?: string | null;
  unreadCount?: number;
  onClose: () => void;
};

export function MobileSidebar({
  open,
  user,
  workspaceName,
  unreadCount,
  onClose,
}: MobileSidebarProps) {
  return (
    <div className="lg:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-on-surface/40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-outline-variant shadow-sm transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
      >
        <Sidebar
          user={user}
          workspaceName={workspaceName}
          unreadCount={unreadCount}
          onNavigate={onClose}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
