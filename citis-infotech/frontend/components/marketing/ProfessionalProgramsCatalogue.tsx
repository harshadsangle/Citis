import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronDown, GraduationCap, Layers3 } from "lucide-react";
import { PROFESSIONAL_PROGRAMS, SPECIALIZATIONS, type LmsProfessionalOffering } from "@/lib/professional-programs";

function DisplayList({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-1">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center">
          {index > 0 && <span className="mr-2 text-primary/50">•</span>}
          <span>{item}</span>
        </span>
      ))}
    </span>
  );
}

function OfferingCard({ offering }: { offering: LmsProfessionalOffering }) {
  return (
    <details className="group rounded-3xl border border-border/80 bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
        <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          {offering.type === "Professional Program" ? <GraduationCap className="size-5" /> : <Layers3 className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold tracking-[0.16em] text-primary uppercase">{offering.type}</span>
          <span className="mt-1 block font-heading text-lg font-semibold leading-7 text-foreground sm:text-xl">{offering.title}</span>
          <span className="mt-3 block text-sm font-semibold text-muted-foreground">270 Hours <span className="px-1 text-primary/50">|</span> 18 Credits <span className="px-1 text-primary/50">|</span> 6 Modules</span>
        </span>
        <ChevronDown className="mt-2 size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-border/70 px-5 py-6 sm:px-7 sm:py-7">
        <div className="space-y-5 text-sm leading-7 text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">Build expertise in:</p>
            <p className="mt-1.5"><DisplayList items={offering.buildExpertise} /></p>
          </div>
          <div>
            <p className="font-semibold text-foreground">You will learn:</p>
            <p className="mt-1.5"><DisplayList items={offering.youWillLearn} /></p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Industry Opportunities:</p>
            <p className="mt-1.5"><DisplayList items={offering.industryOpportunities} /></p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Career Pathways:</p>
            <p className="mt-1.5"><DisplayList items={offering.careerPathways} /></p>
          </div>
          <div className="flex items-start gap-2 border-t border-border/70 pt-5">
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
            <p><span className="font-semibold text-foreground">Capstone:</span> {offering.capstone}</p>
          </div>
        </div>
        <Link href="/lms/login?portal=learner" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Continue to learner portal
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </details>
  );
}

function OfferingGroup({ eyebrow, title, description, offerings }: { eyebrow: string; title: string; description: string; offerings: LmsProfessionalOffering[] }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-accent/25 text-accent-foreground">
          <BriefcaseBusiness className="size-4" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
          <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {offerings.map((offering) => <OfferingCard key={offering.id} offering={offering} />)}
      </div>
    </div>
  );
}

export function ProfessionalProgramsCatalogue({ compact = false }: { compact?: boolean }) {
  return (
    <section id="professional-programs" className={compact ? "border-t border-border/70 bg-background py-16 dark:bg-slate-950/20 sm:py-24" : "py-16 sm:py-24"}>
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow"><span className="h-px w-8 bg-accent" />CITIS professional learning</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Professional Programs &amp; Specializations</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Applied, industry-oriented pathways designed around practical capabilities, career direction, and a project-led capstone.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl space-y-14">
          <OfferingGroup
            eyebrow="CITIS Professional Programs"
            title="Professional Programs"
            description="Build future-ready expertise through structured programmes spanning automation, cybersecurity, data, cloud, immersive technology, development, and digital growth."
            offerings={PROFESSIONAL_PROGRAMS}
          />
          <OfferingGroup
            eyebrow="CITIS Specializations"
            title="Specializations"
            description="Deepen a focused professional capability in marketing, entrepreneurship, innovation, operations, cybersecurity, data science, or analytics."
            offerings={SPECIALIZATIONS}
          />
        </div>
      </div>
    </section>
  );
}