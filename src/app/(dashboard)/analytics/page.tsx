import { Suspense } from "react";
import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";

export const metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="h-64" aria-hidden />}>
      <AnalyticsWorkspace />
    </Suspense>
  );
}
