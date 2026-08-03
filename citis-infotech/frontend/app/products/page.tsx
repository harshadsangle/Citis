import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, Code2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Learning Academies", path: "/products", description: "Explore CITIS InfoTech academies for artificial intelligence, application development, and whole-person professional capability." });

const academies = [
  { icon: Bot, name: "AI Future Academy", tagline: "Understand AI. Build responsibly. Shape what comes next.", description: "Role-based pathways in AI literacy, data, machine learning, generative AI, and responsible application.", audience: "Students • Faculty • Professionals", href: "/products/ai-future-academy", modules: ["AI foundations", "Applied labs", "Portfolio capstone"] },
  { icon: Code2, name: "AppWizz Academy", tagline: "From an idea to a product people can use.", description: "A hands-on software academy spanning problem discovery, UX, full-stack engineering, cloud delivery, and product practice.", audience: "Aspiring developers • Campus cohorts", href: "/products/appwizz-academy", modules: ["Product thinking", "Modern engineering", "Launch readiness"] },
  { icon: BrainCircuit, name: "MoxieMind", tagline: "Human capabilities for meaningful work and life.", description: "Evidence-based learning for communication, critical thinking, collaboration, wellbeing, leadership, and career agency.", audience: "Learners • Educators • Teams", href: "/products/moxiemind", modules: ["Self & purpose", "Working with others", "Leading change"] },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader eyebrow="CITIS academies" title="Learning ecosystems for the capabilities that matter now" description="Our academies combine expert instruction, active practice, mentor feedback, authentic evidence, and flexible institutional delivery." breadcrumbs={[{ label: "Products" }]} />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection><SectionHeading eyebrow="Three connected academies" title="Technical confidence. Human capability. Real progression." description="Each academy stands on its own and can also combine into multidisciplinary pathways for schools, universities, employers, and individual learners." /></AnimatedSection>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {academies.map((academy, index) => {
            const Icon = academy.icon;
            return <AnimatedSection key={academy.name} delay={index * 0.08}><Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"><div className="brand-gradient relative h-44 p-7 text-white"><div className="absolute -top-12 -right-12 size-40 rounded-full border border-white/15" /><Icon className="size-10 text-orange-300" /><p className="absolute bottom-6 text-xs font-semibold tracking-wider text-blue-100 uppercase">{academy.audience}</p></div><CardHeader><Badge className="mb-2 w-fit" variant="outline"><Sparkles className="size-3" />CITIS InfoTech</Badge><CardTitle className="text-2xl">{academy.name}</CardTitle><p className="font-heading text-sm font-semibold text-primary">{academy.tagline}</p><CardDescription className="pt-2 leading-7">{academy.description}</CardDescription></CardHeader><CardContent className="mt-auto"><div className="mb-6 flex flex-wrap gap-2">{academy.modules.map((module) => <Badge key={module} variant="secondary">{module}</Badge>)}</div><Link href={academy.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore academy<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card></AnimatedSection>;
          })}
        </div>
      </section>
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading align="center" eyebrow="Flexible by design" title="Built for individuals and institutions" description="Choose open cohorts, campus delivery, faculty-supported integration, branded academies, or custom pathways aligned to your outcomes." /></AnimatedSection>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Live mentor-led cohorts", "Blended campus delivery", "Verified digital credentials", "Learning and impact analytics"].map((item, index) => <AnimatedSection key={item} delay={index * 0.05}><div className="rounded-xl border border-border bg-card p-5 text-center font-heading text-sm font-semibold">{item}</div></AnimatedSection>)}</div>
        </div>
      </section>
      <CTASection title="Find the right academy pathway" description="Our advisors can recommend a learner journey, cohort format, and institutional model based on your goals." primaryLabel="Talk to a learning advisor" secondaryLabel="Visit Future Academy" secondaryHref="/future-academy" />
    </>
  );
}
