import { cn } from "@/lib/cn";

type WhatsAppBrandIconProps = {
  className?: string;
  size?: number;
  title?: string;
};

/** Green WhatsApp disc with white bubble/phone, sized to fill its badge slot. */
export function WhatsAppBrandIcon({
  className,
  size = 16,
  title = "WhatsApp",
}: WhatsAppBrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M16.6 14.2c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.4 3.8 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z"
      />
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1 3.1c-4.9 0-8.9 4-8.9 8.9 0 1.6.4 3.1 1.2 4.4l-1.3 4.6 4.7-1.2c1.3.7 2.8 1.1 4.3 1.1h.1c4.9 0 8.9-4 8.9-8.9 0-2.4-.9-4.6-2.6-6.3-1.7-1.7-3.9-2.6-6.4-2.6zm0 16.2h-.1c-1.4 0-2.7-.4-3.9-1.1l-.3-.2-2.9.7.8-2.8-.2-.3c-.7-1.2-1.1-2.5-1.1-3.9 0-4.1 3.4-7.5 7.5-7.5 2 0 3.9.8 5.3 2.2 1.4 1.4 2.2 3.3 2.2 5.3 0 4.2-3.4 7.6-7.4 7.6z"
      />
    </svg>
  );
}
