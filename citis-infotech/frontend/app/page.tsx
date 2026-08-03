import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Cloud, Code2, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatsCounter } from "@/components/shared/StatsCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const capabilities = [
  { icon: Code2, title: "Digital Engineering", description: "Design and build resilient products, platforms and connected customer experiences.", href: "/engagements/digital-engineering" },
  { icon: Cloud, title: "Cloud & DevOps", description: "Modernize infrastructure and delivery with secure, observable cloud foundations.", href: "/engagements/cloud-devops" },
  { icon: Bot, title: "Data & AI", description: "Create trusted data products and practical AI that improve everyday decisions.", href: "/engagements/data-ai" },
  { icon: ShieldCheck, title: "Cybersecurity", description: "Embed security into systems and operations without slowing innovation.", href: "/engagements/cybersecurity" },
];

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_58%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#10233e_58%,#0f172a_100%)]" />
        <div className="absolute top-[-14rem] right-[-8rem] -z-10 size-[38rem] rounded-full bg-blue-400/15 blur-3xl" />
        <div className="container-site grid min-h-[calc(100vh-var(--header-height))] items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <AnimatedSection>
            <Badge variant="secondary" className="mb-6"><Sparkles className="size-3" />Technology with measurable impact</Badge>
            <h1 className="max-w-4xl font-heading text-5xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl">
              Ambition, engineered by <span className="text-gradient">CITIS InfoTech.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              We partner with ambitious organizations to design, build and scale secure digital products, cloud platforms and intelligent operations.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg"><Link href="/contact">Start a conversation<ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/case-studies">See our work</Link></Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["Outcome-led delivery", "Enterprise-grade security", "Global delivery teams"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" />{item}</span>)}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.15} className="relative hidden lg:block">
            <div className="surface relative mx-auto aspect-square max-w-lg overflow-hidden rounded-3xl bg-card/80 p-8 backdrop-blur">
              <div className="brand-gradient absolute inset-10 rounded-[2rem] opacity-95" />
              <div className="absolute inset-0 [background-image:linear-gradient(rgba(37,99,235,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="relative flex h-full flex-col justify-between rounded-2xl border border-white/15 bg-slate-950/15 p-8 text-white backdrop-blur-sm">
                <div className="flex items-center justify-between"><span className="font-heading text-xl font-semibold">CITIS / Forward</span><span className="size-3 rounded-full bg-orange-400 shadow-[0_0_0_8px_rgba(255,122,0,.18)]" /></div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-blue-100 uppercase">Think. Build. Transform.</p>
                  <p className="mt-4 font-heading text-4xl leading-tight font-semibold">Technology that keeps your business moving.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">{["Cloud", "AI", "Digital"].map((item) => <div key={item} className="rounded-lg border border-white/20 bg-white/10 px-3 py-4 text-center text-xs font-semibold">{item}</div>)}</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-28">
        <AnimatedSection><SectionHeading eyebrow="Capabilities" title="One partner from strategic intent to scaled impact" description="Multidisciplinary teams bring product thinking, deep engineering and accountable delivery to every engagement." /></AnimatedSection>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={index * 0.07}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <CardHeader><span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><CardTitle>{item.title}</CardTitle><CardDescription>{item.description}</CardDescription></CardHeader>
                  <CardContent><Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Learn more<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-20 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading align="center" eyebrow="Built on trust" title="A proven team for consequential work" description="We measure our progress by the lasting value our clients create." /></AnimatedSection>
          <AnimatedSection delay={0.1} className="mt-12"><StatsCounter /></AnimatedSection>
        </div>
      </section>
      <CTASection />
    </>
  );
}
