import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

interface SectionWrapperProps {
  children: React.ReactNode;
  variant?: "light" | "muted" | "dark";
  className?: string;
  id?: string;
  noPadding?: boolean;
}

function SectionWrapper({
  children,
  variant = "light",
  className,
  id,
  noPadding,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        !noPadding && "py-20",
        {
          "bg-bg-primary": variant === "light",
          "bg-bg-secondary": variant === "muted",
          "bg-bg-dark text-white": variant === "dark",
        },
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export { SectionWrapper };
