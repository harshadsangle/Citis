import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type MarketingItem = {
  title: string;
  description: string;
  icon?: LucideIcon;
  meta?: string;
};

export function FeatureGrid({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  items: MarketingItem[];
  columns?: 2 | 3 | 4;
}) {
  const grid = columns === 4 ? "lg:grid-cols-4" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="container-site py-16 sm:py-24">
      <AnimatedSection><SectionHeading eyebrow={eyebrow} title={title} description={description} /></AnimatedSection>
      <div className={`mt-10 grid gap-5 ${grid}`}>
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <AnimatedSection key={item.title} delay={index * 0.06}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <CardHeader>
                  {Icon && <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>}
                  {item.meta && <p className="text-xs font-bold tracking-[0.14em] text-accent uppercase">{item.meta}</p>}
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="leading-7">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}

export function SplitFeature({
  eyebrow,
  title,
  description,
  points,
  stat,
  reverse = false,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  points: string[];
  stat?: { value: string; label: string };
  reverse?: boolean;
}) {
  return (
    <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
      <div className={`container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <AnimatedSection>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {points.map((point) => <li key={point} className="flex items-start gap-2.5 text-sm leading-6"><CheckCircle2 className="mt-1 size-4 shrink-0 text-accent" />{point}</li>)}
          </ul>
        </AnimatedSection>
        <AnimatedSection delay={0.12}>
          <div className="brand-gradient relative min-h-80 overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute -top-20 -right-12 size-64 rounded-full border border-white/15" />
            <div className="absolute right-12 -bottom-32 size-64 rounded-full bg-orange-400/30 blur-3xl" />
            <div className="relative flex h-full min-h-64 flex-col justify-between">
              <p className="font-heading text-xl font-semibold">CITIS InfoTech</p>
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-blue-100 uppercase">Education • Technology • Impact</p>
                <p className="mt-4 font-heading text-3xl leading-tight font-semibold">{stat?.value ?? "Learning that moves with the world."}</p>
                {stat?.label && <p className="mt-3 text-blue-100">{stat.label}</p>}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export function ProcessTimeline({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: MarketingItem[];
}) {
  return (
    <section className="container-site py-16 sm:py-24">
      <AnimatedSection><SectionHeading align="center" eyebrow={eyebrow} title={title} description={description} /></AnimatedSection>
      <div className="relative mx-auto mt-12 max-w-5xl">
        <div className="absolute top-8 bottom-8 left-6 w-px bg-border md:top-6 md:right-8 md:bottom-auto md:left-8 md:h-px md:w-auto" />
        <div className="relative grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 0.08}>
              <div className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
                <span className="mb-5 grid size-10 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground ring-8 ring-background">{String(index + 1).padStart(2, "0")}</span>
                {step.meta && <p className="mb-2 text-xs font-bold tracking-wider text-accent uppercase">{step.meta}</p>}
                <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OutcomesList({
  eyebrow = "Learning outcomes",
  title,
  description,
  outcomes,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  outcomes: string[];
}) {
  return (
    <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <AnimatedSection><SectionHeading eyebrow={eyebrow} title={title} description={description} /></AnimatedSection>
        <div className="grid gap-4 sm:grid-cols-2">
          {outcomes.map((outcome, index) => (
            <AnimatedSection key={outcome} delay={index * 0.05}>
              <Card className="h-full"><CardContent className="flex gap-3 p-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" /><p className="text-sm leading-6">{outcome}</p></CardContent></Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
