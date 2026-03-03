import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}

function Logo({ className, size = "md", light }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading tracking-tight",
        {
          "text-lg": size === "sm",
          "text-xl": size === "md",
          "text-2xl": size === "lg",
        },
        light ? "text-white" : "text-text-primary",
        className
      )}
    >
      Risparmi<span className="text-accent-primary">aMi</span>
    </Link>
  );
}

export { Logo };
