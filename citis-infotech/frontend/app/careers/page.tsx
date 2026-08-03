import Link from "next/link";
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Heart, Lightbulb, MapPin, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JOBS } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Careers", path: "/careers", description: "Join CITIS InfoTech and help educators, institutions, industry, and learners build capability and opportunity through education technology." });

export default function CareersPage() {
  return (
    <>
      <PageHeader eyebrow="Careers at CITIS InfoTech" title="Do work that helps people move forward" description="Join educators, designers, engineers, programme leaders, and partnership builders creating more relevant and inclusive learning." breadcrumbs={[{ label: "Careers" }]} />
      <SplitFeature eyebrow="Our culture" title="Serious about outcomes. Generous in how we learn." description="CITIS brings together people from education, technology, and industry. We ask thoughtful questions, share unfinished work, seek evidence, and stay close to learners and educators." points={["Purpose with practical action", "High trust and clear ownership", "Respect for academic expertise", "Cross-disciplinary collaboration", "Feedback without theatre", "Progress over performative certainty"]} stat={{ value: "Build capability—including your own", label: "Every project should leave learners, partners, and our team more capable." }} />
      <FeatureGrid eyebrow="Benefits" title="Support for your work and growth" columns={4} items={[
        { icon: BookOpenCheck, title: "Learning investment", description: "Annual development budget, internal studios, mentoring, and conference participation." },
        { icon: Heart, title: "Health & wellbeing", description: "Comprehensive insurance, wellbeing support, and flexible leave for life’s realities." },
        { icon: Users, title: "Flexible collaboration", description: "Role-appropriate hybrid work, intentional team time, and inclusive ways of contributing." },
        { icon: Lightbulb, title: "Purposeful projects", description: "Work directly with education communities on consequential, visible challenges." },
      ]} />
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading eyebrow="Open positions" title="Find your place at CITIS" description="We hire for capability, learning agility, and alignment with our education mission. If a role fits, show us how you think and what you have helped others achieve." /></AnimatedSection>
          <div className="mt-10 space-y-4">
            {JOBS.map((job, index) => <AnimatedSection key={job.slug} delay={index * 0.04}><Card className="group transition-all hover:border-primary/30 hover:shadow-md"><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-3 flex flex-wrap gap-2"><Badge>{job.team}</Badge><Badge variant="outline">{job.type}</Badge></div><h3 className="font-heading text-xl font-semibold">{job.title}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />{job.location} · {job.experience}</p></div><Link href={`/careers/${job.slug}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">View role<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card></AnimatedSection>)}
          </div>
        </div>
      </section>
      <FeatureGrid eyebrow="How we hire" title="A clear, human selection process" columns={4} items={[
        { icon: BriefcaseBusiness, meta: "01", title: "Application", description: "Share relevant work, outcomes, and what draws you to the education challenge." },
        { icon: Users, meta: "02", title: "Conversation", description: "Explore the role, your experience, and the conditions where you do your best work." },
        { icon: Sparkles, meta: "03", title: "Practical discussion", description: "Work through a realistic scenario and discuss your choices—no unpaid production work." },
        { icon: Heart, meta: "04", title: "Mutual decision", description: "Meet close collaborators, clarify expectations, and decide with transparent feedback." },
      ]} />
      <CTASection title="Don’t see the right role yet?" description="Tell us what you do exceptionally well and how it could advance education. We keep thoughtful introductions on file." primaryLabel="Introduce yourself" secondaryLabel="Learn about CITIS" secondaryHref="/about" />
    </>
  );
}
