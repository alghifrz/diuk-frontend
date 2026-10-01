import { Suspense } from "react";
import { PromptWorkspace } from "@/components/prompt/prompt-workspace";

export const metadata = {
  title: "AI Assistant",
};

export default function PromptPage() {
  return (
    <Suspense
      fallback={
        <div
          className="h-full animate-pulse rounded-2xl bg-surface"
          aria-label="Loading AI assistant"
        />
      }
    >
      <PromptWorkspace />
    </Suspense>
  );
}
