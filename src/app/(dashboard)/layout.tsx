import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const workspace = await getWorkspace();

  return (
    <AppShell user={user} workspaceName={workspace?.name}>
      {children}
    </AppShell>
  );
}
