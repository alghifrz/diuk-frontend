import { WhatsAppBrandIcon } from "@/components/chat/whatsapp-brand-icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { CHANNEL_LABEL, customerInitial } from "@/lib/chat-display";
import type { ConversationChannel } from "@/types/chat";

type CustomerAvatarProps = {
  name: string;
  channel: ConversationChannel;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: {
    root: "size-11 text-sm",
    badge: "size-5",
    brand: 20,
    icon: 11,
  },
  md: {
    root: "size-10 text-sm",
    badge: "size-5",
    brand: 20,
    icon: 11,
  },
  lg: {
    root: "size-14 text-lg",
    badge: "size-6",
    brand: 24,
    icon: 13,
  },
} as const;

function ChannelBadge({
  channel,
  size,
}: {
  channel: ConversationChannel;
  size: keyof typeof SIZE;
}) {
  const tokens = SIZE[size];

  if (channel === "WHATSAPP") {
    return (
      <span
        className={cn(
          "pointer-events-none absolute -right-0.5 -bottom-0.5 overflow-hidden rounded-full bg-surface p-[1.5px] shadow-sm",
          tokens.badge,
        )}
      >
        <WhatsAppBrandIcon size={tokens.brand} className="size-full" title="WhatsApp" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "pointer-events-none absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full bg-secondary text-white ring-[1.5px] ring-surface",
        tokens.badge,
      )}
      aria-label={CHANNEL_LABEL[channel]}
      title={CHANNEL_LABEL[channel]}
    >
      <Icon
        name={channel === "INSTAGRAM" ? "photo_camera" : "language"}
        size={tokens.icon}
      />
    </span>
  );
}

export function CustomerAvatar({
  name,
  channel,
  size = "md",
  className,
}: CustomerAvatarProps) {
  const tokens = SIZE[size];

  return (
    <span className={cn("relative inline-flex shrink-0 overflow-visible", className)}>
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-full bg-secondary font-semibold text-white",
          tokens.root,
        )}
      >
        {customerInitial(name)}
      </span>
      <ChannelBadge channel={channel} size={size} />
    </span>
  );
}
