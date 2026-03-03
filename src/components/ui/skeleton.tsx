import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-bg-secondary rounded-md",
        className
      )}
    />
  );
}

export { Skeleton };
