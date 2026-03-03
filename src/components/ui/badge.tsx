import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "certo" | "probabile" | "consiglio" | "default";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-accent-success/10 text-accent-success": variant === "certo",
          "bg-accent-warning/10 text-accent-warning": variant === "probabile",
          "bg-bg-secondary text-text-secondary": variant === "consiglio",
          "bg-bg-secondary text-text-primary": variant === "default",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps };
