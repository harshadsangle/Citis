import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, BriefcaseBusiness, FileCheck2, MessagesSquare, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline } from "@/components/marketing/MarketingBlocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Placements & Career Readiness", path: "/engagements/placements", description: "A skills-first campus placement model connecting diagnostics, capability development, portfolio evidence, coaching, and employer partnerships." });

export default function PlacementsPage() {
  return (
    <>
      <PageHeader eyebrow="Placements & career readiness" title="Every learner deserves a confident transition" description="Move beyond end-of-degree placement training with a progression model that builds role awareness, demonstrated capability, and employer trust over time." breadcrumbs={[{ label: "Engagements", href: "/engagements" }, { label: "Placements" }]} />
      <ProcessTimeline eyebrow="Placement process" title="Readiness developed, demonstrated, and matched" steps={[
        { meta: "Discover", title: "Profile", description: "Role interests, strengths, baseline diagnostics, aspirations, and individual action plans." },
        { meta: "Prepare", title: "Develop", description: "Technical, communication, aptitude, collaboration, and interview practice by role family." },
        { meta: "Demonstrate", title: "Evidence", description: "Verified projects, simulations, portfolios, credentials, and structured readiness reviews." },
        { meta: "Connect", title: "Place", description: "Employer briefs, matching, selection support, offer decisions, onboarding, and feedback." },
      ]} />
      <FeatureGrid eyebrow="Placement ecosystem" title="A connected operating model" items={[
        { icon: Target, title: "Role-based diagnostics", description: "Actionable insight tied to job families rather than one generic employability score." },
        { icon: Users, title: "Cohort pathways", description: "Differentiated practice and coaching based on readiness, aspiration, and opportunity." },
        { icon: FileCheck2, title: "Verified portfolios", description: "Credible evidence from projects, demonstrations, reflections, and mentor feedback." },
        { icon: MessagesSquare, title: "Selection practice", description: "Technical interviews, group tasks, case discussions, presentations, and behavioural stories." },
        { icon: BriefcaseBusiness, title: "Employer partnerships", description: "Long-term role mapping, learning briefs, mentoring, internships, hiring, and feedback." },
        { icon: BarChart3, title: "Placement intelligence", description: "Funnel visibility, equity insight, skill gaps, quality-of-offer metrics, and continuous improvement." },
      ]} />
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading eyebrow="Success stories" title="Progress that institutions and learners can see" description="Illustrative outcomes from programmes designed around readiness quality, not only placement volume." /></AnimatedSection>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { metric: "31%", title: "More quality offers", copy: "A multi-campus university aligned role diagnostics, coached pathways, and portfolio reviews across disciplines.", tag: "Higher education" },
              { metric: "2.2×", title: "More internship conversions", copy: "Mentor-supported employer briefs helped engineering learners demonstrate teamwork and delivery in context.", tag: "Industry projects" },
              { metric: "88%", title: "Learner plan completion", copy: "Early profiling and monthly evidence reviews made career readiness visible throughout the degree.", tag: "Career progression" },
            ].map((story, index) => <AnimatedSection key={story.title} delay={index * 0.07}><Card className="h-full"><CardContent className="p-7"><Badge variant="outline">{story.tag}</Badge><p className="mt-7 font-heading text-4xl font-semibold text-primary">{story.metric}</p><h3 className="mt-2 font-heading text-xl font-semibold">{story.title}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{story.copy}</p><Link href="/highlights/case-studies/career-readiness-placement-cell" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Read the story<ArrowRight className="size-4" /></Link></CardContent></Card></AnimatedSection>)}
          </div>
        </div>
      </section>
      <FeatureGrid eyebrow="Shared success" title="Value across the ecosystem" columns={4} items={[
        { icon: BadgeCheck, title: "For learners", description: "Clarity, focused practice, credible evidence, and better-fit opportunities." },
        { icon: Users, title: "For faculty", description: "Insight into capability gaps and authentic learning evidence." },
        { icon: BriefcaseBusiness, title: "For employers", description: "Better matching, richer evidence, and work-ready candidates." },
        { icon: BarChart3, title: "For institutions", description: "Consistent operations, transparent outcomes, and stronger partnerships." },
      ]} />
      <CTASection title="Build career readiness throughout the learner journey" description="Let us map your placement funnel, readiness evidence, and employer collaboration model." primaryLabel="Request a placement review" secondaryLabel="Explore university engagement" secondaryHref="/engagements/university" />
    </>
  );
}
