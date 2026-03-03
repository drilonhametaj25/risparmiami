import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

function Container({ className, size = "default", children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-6 md:px-20 lg:px-[120px]",
        {
          "max-w-content": size === "default",
          "max-w-3xl": size === "narrow",
          "max-w-7xl": size === "wide",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Container, type ContainerProps };
