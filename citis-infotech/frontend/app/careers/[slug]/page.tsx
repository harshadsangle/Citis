import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock, MapPin } from "lucide-react";
import { JobApplicationForm } from "@/components/marketing/InteractiveForms";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { JOBS } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return JOBS.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = JOBS.find((item) => item.slug === slug);
  return job ? generatePageMetadata({ title: `${job.title} — Careers`, description: job.summary, path: `/careers/${job.slug}` }) : generatePageMetadata({ title: "Role not found", noIndex: true });
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = JOBS.find((item) => item.slug === slug);
  if (!job) notFound();
  return (
    <>
      <header className="relative overflow-hidden border-b border-border bg-slate-100/70 py-16 dark:bg-slate-900 sm:py-20">
        <div className="container-site"><Link href="/careers" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />All open roles</Link><div className="mt-8 max-w-4xl"><Badge>{job.team}</Badge><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{job.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{job.summary}</p><div className="mt-7 flex flex-wrap gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><MapPin className="size-4" />{job.location}</span><span className="flex items-center gap-2"><BriefcaseBusiness className="size-4" />{job.type}</span><span className="flex items-center gap-2"><Clock className="size-4" />{job.experience}</span></div></div></div>
      </header>
      <main className="container-site grid gap-14 py-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20 sm:py-24">
        <article className="max-w-3xl">
          <AnimatedSection><h2 className="font-heading text-3xl font-semibold">The opportunity</h2><p className="mt-5 leading-8 text-muted-foreground">You will join a cross-disciplinary team that works closely with education partners and learners. The role combines thoughtful craft, clear ownership, and a commitment to building capability—not dependency.</p></AnimatedSection>
          <AnimatedSection className="mt-12"><h2 className="font-heading text-3xl font-semibold">What you will do</h2><ul className="mt-6 space-y-4">{job.responsibilities.map((item) => <li key={item} className="flex gap-3 leading-7"><CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" />{item}</li>)}</ul></AnimatedSection>
          <AnimatedSection className="mt-12"><h2 className="font-heading text-3xl font-semibold">What will help you thrive</h2><ul className="mt-6 space-y-4">{job.requirements.map((item) => <li key={item} className="flex gap-3 leading-7"><CheckCircle2 className="mt-1 size-5 shrink-0 text-accent" />{item}</li>)}</ul></AnimatedSection>
          <AnimatedSection className="mt-12 rounded-2xl bg-primary/5 p-7"><h2 className="font-heading text-2xl font-semibold">Our commitment</h2><p className="mt-4 leading-7 text-muted-foreground">CITIS InfoTech is an equal-opportunity employer. We welcome different backgrounds and provide reasonable adjustments throughout the selection process. We assess the evidence relevant to the role, not pedigree.</p></AnimatedSection>
        </article>
        <aside id="apply" className="lg:sticky lg:top-24 lg:h-fit">
          <AnimatedSection><SectionHeading eyebrow="Apply now" title="Start a conversation" description="Share your résumé and a short note. We review every complete application against the published role." className="[&_h2]:text-2xl" /><div className="mt-6"><JobApplicationForm jobId={job.slug} jobTitle={job.title} /></div></AnimatedSection>
        </aside>
      </main>
    </>
  );
}
