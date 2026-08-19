"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { STATISTICS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Counter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const duration = 1400;
    const started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return <span ref={ref}>{current.toLocaleString("en-IN")}{suffix}</span>;
}

export function StatsCounter({
  stats = STATISTICS,
  className,
}: {
  stats?: ReadonlyArray<{ value: number; suffix?: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card px-5 py-8 text-center sm:px-8">
          <p className="font-heading text-3xl font-semibold text-primary sm:text-4xl"><Counter value={stat.value} suffix={stat.suffix} /></p>
          <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
