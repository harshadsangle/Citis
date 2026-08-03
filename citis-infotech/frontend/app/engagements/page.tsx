import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, GraduationCap, Landmark, School, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Education Engagements", path: "/engagements", description: "Explore CITIS InfoTech collaborations for universities, schools, vocational education, centres of excellence, and student placements." });

const engagements = [
  { icon: GraduationCap, title: "University engagement", description: "Curriculum co-design, faculty capability, industry projects, innovation labs, and learner progression.", href: "/engagements/university" },
  { icon: School, title: "School engagement", description: "ICT integration, STEM learning, teacher enablement, and future-ready school ecosystems.", href: "/engagements/school" },
  { icon: Wrench, title: "Vocational education", description: "Stackable pathways, practical labs, assessment, apprenticeships, and workforce mobility.", href: "/engagements/vocational" },
  { icon: Landmark, title: "Centres of Excellence", description: "Strategy, infrastructure, curriculum, operations, and impact frameworks for institutional CoEs.", href: "/engagements/centre-of-excellence" },
  { icon: BriefcaseBusiness, title: "Placements & careers", description: "Role discovery, readiness diagnostics, portfolio evidence, coaching, and employer partnerships.", href: "/engagements/placements" },
  { icon: Building2, title: "Industry collaboration", description: "Academies, talent pipelines, employee upskilling, sponsored labs, and applied research partnerships.", href: "/partner" },
];

export default function EngagementsPage() {
  return (
    <>
      <PageHeader eyebrow="Engagements" title="Education and industry, moving forward together" description="CITIS InfoTech designs partnerships around each institution’s purpose, learners, context, and evidence of success." breadcrumbs={[{ label: "Engagements" }]} />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection><SectionHeading eyebrow="Ways we collaborate" title="One ecosystem. Multiple pathways to impact." description="Choose a starting point or bring us a cross-institutional challenge. Our teams connect learning design, technology, educator capability, and employer relevance." /></AnimatedSection>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engagements.map((item, index) => {
            const Icon = item.icon;
            return <AnimatedSection key={item.title} delay={index * 0.06}><Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"><CardHeader><span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-6" /></span><CardTitle>{item.title}</CardTitle><CardDescription className="leading-7">{item.description}</CardDescription></CardHeader><CardContent><Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore engagement<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card></AnimatedSection>;
          })}
        </div>
      </section>
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading align="center" eyebrow="Our approach" title="Co-design. Build capability. Prove progress." description="Every engagement follows a transparent cycle that leaves institutions stronger." /></AnimatedSection>
          <div className="mt-12 grid gap-8 md:grid-cols-4">{["Discover priorities and context", "Design outcomes and experience", "Deliver with educators and partners", "Measure, learn, and scale"].map((step, index) => <AnimatedSection key={step} delay={index * 0.07}><div className="text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-primary font-heading font-bold text-primary-foreground">{index + 1}</span><p className="mt-4 font-heading text-sm font-semibold">{step}</p></div></AnimatedSection>)}</div>
        </div>
      </section>
      <CTASection title="Start with the outcome that matters most" description="Tell us what learners, educators, or employers should be able to do differently. We will help map the path." secondaryLabel="Explore our academies" secondaryHref="/products" />
    </>
  );
}
