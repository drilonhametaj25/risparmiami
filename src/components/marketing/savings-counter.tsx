"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface SavingsCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

function SavingsCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
  className,
  decimals = 0,
}: SavingsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    let animationFrame: number;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  const formatted = decimals > 0
    ? value.toFixed(decimals).replace(".", ",")
    : Math.round(value).toLocaleString("it-IT");

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

export { SavingsCounter };
