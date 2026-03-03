import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-2.5 rounded-sm border border-border-light bg-white text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20",
            "transition-colors duration-200",
            error && "border-accent-danger focus:border-accent-danger focus:ring-accent-danger/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-accent-danger">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, type InputProps };
