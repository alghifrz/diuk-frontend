import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  variant?: "default" | "inverse";
  size?: "sm" | "md";
};

const sizeClassName = {
  sm: "w-[128px]",
  md: "w-[168px]",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.webp"
        alt="DIUK"
        width={320}
        height={104}
        className={cn("h-auto object-contain", sizeClassName[size])}
        priority
      />
    </span>
  );
}
