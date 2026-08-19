import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureGrid, OutcomesList, type MarketingItem } from "@/components/marketing/MarketingBlocks";

export type AcademyConfig = {
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  primaryHref?: string;
  features: Array<MarketingItem & { icon: LucideIcon }>;
  benefits: string[];
  outcomes: string[];
  curriculum: Array<{ title: string; description: string; topics: string[] }>;
  audience: string;
};

export function AcademyPage({ config }: { config: AcademyConfig }) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#eaf4ff_60%,#fff7ed_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#10233e_60%,#26170c_100%)]" />
        <div className="absolute -top-40 -right-32 -z-10 size-[34rem] rounded-full bg-blue-400/15 blur-3xl" />
        <div className="container-site grid min-h-[36rem] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimatedSection>
            <Badge variant="secondary" className="mb-5"><Sparkles className="size-3.5" />{config.eyebrow}</Badge>
            <h1 className="max-w-4xl font-heading text-5xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">{config.name}</h1>
            <p className="mt-5 font-heading text-2xl font-medium text-primary">{config.tagline}</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{config.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg"><Link href={config.primaryHref ?? "/contact"}>Explore enrollment<ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="#curriculum">View curriculum</Link></Button>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.12}>
            <div className="brand-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl sm:p-10">
              <div className="absolute -top-16 -right-16 size-56 rounded-full border border-white/15" />
              <p className="text-sm font-bold tracking-[0.18em] text-orange-300 uppercase">Designed for</p>
              <p className="mt-4 font-heading text-3xl leading-tight font-semibold">{config.audience}</p>
              <div className="mt-10 space-y-3">
                {config.benefits.slice(0, 4).map((benefit) => <p key={benefit} className="flex gap-3 text-sm leading-6 text-blue-50"><CheckCircle2 className="mt-1 size-4 shrink-0 text-orange-300" />{benefit}</p>)}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <FeatureGrid eyebrow="Programme features" title="A complete environment for purposeful learning" description="Every element is designed to move learners from understanding to confident application." items={config.features} />

      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <AnimatedSection><SectionHeading eyebrow="Benefits" title="Value for learners and institutions" description="Flexible delivery, authentic evidence, and academic-quality support create impact that lasts beyond a course." /></AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.benefits.map((benefit, index) => (
              <AnimatedSection key={benefit} delay={index * 0.05}>
                <Card className="h-full"><CardContent className="flex gap-3 p-5"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">{index + 1}</span><p className="text-sm leading-6">{benefit}</p></CardContent></Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <OutcomesList title="Capabilities learners can demonstrate" description="Outcomes are assessed through practical work, reflection, and portfolio evidence." outcomes={config.outcomes} />

      <section id="curriculum" className="container-site scroll-mt-24 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:gap-16">
          <AnimatedSection><SectionHeading eyebrow="Curriculum" title="A progression from foundations to practice" description="Structured modules combine concise instruction, guided labs, mentor feedback, and authentic challenges." /></AnimatedSection>
          <AnimatedSection delay={0.1}>
            <Accordion type="single" collapsible defaultValue="module-0" className="rounded-xl border border-border bg-card px-6">
              {config.curriculum.map((module, index) => (
                <AccordionItem key={module.title} value={`module-${index}`}>
                  <AccordionTrigger><span><span className="mr-3 text-xs font-bold text-accent">0{index + 1}</span>{module.title}</span></AccordionTrigger>
                  <AccordionContent>
                    <p>{module.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{module.topics.map((topic) => <Badge key={topic} variant="outline">{topic}</Badge>)}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>

      <CTASection title={`Begin your journey with ${config.name}`} description="Talk to our learning advisors about cohorts, institutional delivery, curriculum alignment, and enrollment." primaryLabel="Request programme details" primaryHref="/contact" secondaryLabel="Explore all academies" secondaryHref="/products" />
    </>
  );
}
