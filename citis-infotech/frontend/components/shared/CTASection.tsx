import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export function CTASection({
  eyebrow = "Strategy call, no obligation",
  title = "Let’s build what learners need next.",
  description = "Bring us your education, capability, or industry-collaboration priority. Our specialists will help you find a clear, practical path forward.",
  primaryLabel = "Start a conversation",
  primaryHref = "/contact",
  secondaryLabel = "Explore our impact",
  secondaryHref = "/highlights/case-studies",
  className,
}: CTASectionProps) {
  return (
    <section className={cn("container-site py-16 sm:py-24", className)}>
      <div className="brand-gradient relative overflow-hidden rounded-2xl px-6 py-12 text-white shadow-[0_24px_80px_rgba(15,76,129,.25)] sm:px-12 lg:px-16 lg:py-16">
        <div className="absolute -top-20 -right-20 size-72 rounded-full border border-white/10" />
        <div className="absolute -right-4 -bottom-32 size-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-100"><CheckCircle2 className="size-4 text-orange-300" />{eyebrow}</p>
            <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-xl leading-7 text-blue-100">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg"><Link href={primaryHref}>{primaryLabel}<ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link href={secondaryHref}>{secondaryLabel}</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
