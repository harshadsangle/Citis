import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { CTASection } from "@/components/shared/CTASection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CASE_STUDIES } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  return study ? generatePageMetadata({ title: study.title, description: study.excerpt, path: `/highlights/case-studies/${study.slug}` }) : generatePageMetadata({ title: "Case study not found", noIndex: true });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) notFound();
  const related = CASE_STUDIES.filter((item) => item.slug !== study.slug).slice(0, 3);
  return (
    <>
      <article>
        <header className="brand-gradient relative overflow-hidden py-16 text-white sm:py-24">
          <div className="absolute -top-32 -right-24 size-96 rounded-full border border-white/10" />
          <div className="container-site relative"><Link href="/highlights/case-studies" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100"><ArrowLeft className="size-4" />All case studies</Link><div className="mt-8 max-w-4xl"><Badge className="border-white/20 bg-white/10 text-white">{study.sector}</Badge><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold text-balance sm:text-5xl lg:text-6xl">{study.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">{study.excerpt}</p><p className="mt-7 text-sm font-semibold text-orange-300">{study.client}</p></div></div>
        </header>
        <section className="container-site -mt-1 py-12 sm:py-16"><div className="grid gap-4 sm:grid-cols-3">{study.outcomes.map((outcome) => <Card key={outcome.label}><CardContent className="p-6 text-center"><p className="font-heading text-4xl font-semibold text-primary">{outcome.value}</p><p className="mt-2 text-sm text-muted-foreground">{outcome.label}</p></CardContent></Card>)}</div></section>
        <section className="container-site grid gap-12 pb-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 sm:pb-24"><div><p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">The challenge</p><h2 className="mt-3 font-heading text-3xl font-semibold">A priority requiring system-level change</h2><p className="mt-5 leading-8 text-muted-foreground">{study.challenge}</p><div className="mt-7 flex flex-wrap gap-2">{study.services.map((service) => <Badge key={service} variant="secondary">{service}</Badge>)}</div></div><div><p className="text-xs font-bold tracking-[0.18em] text-accent uppercase">The partnership</p><h2 className="mt-3 font-heading text-3xl font-semibold">Co-designed for adoption and evidence</h2><div className="mt-6 space-y-4">{study.solution.map((item) => <div key={item} className="flex gap-3 rounded-xl border border-border bg-card p-5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><p className="text-sm leading-7">{item}</p></div>)}</div></div></section>
        <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60"><div className="container-site"><div className="mx-auto max-w-3xl text-center"><Quote className="mx-auto size-10 text-primary/30" /><blockquote className="mt-5 font-heading text-2xl leading-10 font-medium">&ldquo;The programme gave our teams a shared way to discuss capability, observe progress, and improve learning without losing sight of our institutional purpose.&rdquo;</blockquote><p className="mt-5 text-sm font-semibold text-primary">Programme Sponsor · {study.client}</p></div></div></section>
      </article>
      <section className="container-site py-16 sm:py-24"><h2 className="font-heading text-3xl font-semibold">More impact stories</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <Card key={item.slug} className="group"><CardContent className="p-6"><Badge variant="outline">{item.sector}</Badge><h3 className="mt-4 font-heading text-lg font-semibold">{item.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt}</p><Link href={`/highlights/case-studies/${item.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read case study<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card>)}</div></section>
      <CTASection title="Let’s define the progress that matters to you" description="CITIS InfoTech can help turn your education priority into a co-designed, measurable programme." />
    </>
  );
}
