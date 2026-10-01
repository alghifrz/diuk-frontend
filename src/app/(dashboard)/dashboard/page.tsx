import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardWorkspace user={user} />;
}
