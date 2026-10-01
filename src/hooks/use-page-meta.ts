"use client";

import { usePathname } from "next/navigation";
import { getPageMeta, type PageMeta } from "@/lib/navigation";

export function usePageMeta(): PageMeta {
  const pathname = usePathname();
  return getPageMeta(pathname);
}
