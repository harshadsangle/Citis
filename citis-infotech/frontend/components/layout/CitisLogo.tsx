import Link from "next/link";
import { cn } from "@/lib/utils";

/** CITIS InfoTech wordmark matching brand logo: orange CITIS, blue InfoTech, dual underline bars. */
export function CitisLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const mark = (
    <span
      className={cn("inline-flex flex-col leading-none select-none", className)}
      aria-label="CITIS InfoTech"
    >
      <span className="relative flex items-end gap-[0.18em]">
        <span className="font-sans text-[1.35em] font-black tracking-[0.04em] text-[#FF7A00] uppercase">
          CITIS
        </span>
        <span className="relative pb-[0.08em] font-sans text-[1.2em] font-medium tracking-[0.01em] text-[#1E5AA8]">
          InfoTech
          <sup className="absolute -top-1 -right-3 text-[0.35em] font-bold tracking-normal">TM</sup>
        </span>
      </span>
      <span className="mt-[0.22em] flex gap-[0.18em]">
        <span className="h-[0.28em] w-[3.55em] bg-[#1E5AA8]" />
        <span className="h-[0.28em] w-[5.35em] bg-[#FF7A00]" />
      </span>
    </span>
  );

  if (href === null) return mark;

  return (
    <Link href={href} className="group inline-flex shrink-0 items-center" aria-label="CITIS InfoTech home">
      {mark}
    </Link>
  );
}
