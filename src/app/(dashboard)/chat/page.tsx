import { Suspense } from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export const metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full bg-background" aria-hidden />}>
      <ChatWorkspace />
    </Suspense>
  );
}
