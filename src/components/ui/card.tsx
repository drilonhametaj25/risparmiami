import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

function Card({ className, hover, padding = "md", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border-light bg-white rounded-md shadow-sm",
        hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-300",
        {
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
          "": padding === "none",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, type CardProps };
