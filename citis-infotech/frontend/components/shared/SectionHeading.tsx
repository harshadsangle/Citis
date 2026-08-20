import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-3 text-xs font-bold tracking-[0.2em] text-secondary uppercase">{eyebrow}</p>}
      <h2 className="font-heading text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}
