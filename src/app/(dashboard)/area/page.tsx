import { Suspense } from "react";
import { AreaWorkspace } from "@/components/area/area-workspace";

export const metadata = {
  title: "Area",
};

export default function AreaPage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" aria-hidden />}>
      <AreaWorkspace />
    </Suspense>
  );
}
