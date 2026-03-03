import { forwardRef, ButtonHTMLAttributes, ReactElement, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}

function getButtonClasses(variant: string, size: string, className?: string) {
  return cn(
    "inline-flex items-center justify-center font-body font-medium transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none",
    {
      "bg-accent-primary text-white hover:bg-accent-primary/90 active:bg-accent-primary/80": variant === "primary",
      "border border-border-light text-text-primary hover:bg-bg-secondary active:bg-bg-secondary/80": variant === "secondary",
      "text-accent-primary hover:underline underline-offset-4": variant === "ghost",
      "bg-accent-danger text-white hover:bg-accent-danger/90": variant === "danger",
    },
    {
      "text-sm px-4 py-2 rounded-sm": size === "sm",
      "text-base px-6 py-2.5 rounded-sm": size === "md",
      "text-lg px-8 py-3 rounded-sm": size === "lg",
    },
    className
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, asChild, children, ...props }, ref) => {
    const classes = getButtonClasses(variant, size, className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<Record<string, unknown>>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
        ref,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps };
