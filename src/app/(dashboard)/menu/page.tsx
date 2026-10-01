import { Suspense } from "react";
import { MenuWorkspace } from "@/components/menu/menu-workspace";

export const metadata = {
  title: "Menu",
};

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" aria-hidden />}>
      <MenuWorkspace />
    </Suspense>
  );
}
