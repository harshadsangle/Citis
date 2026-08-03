import { BadgeCheck, BriefcaseBusiness, ClipboardCheck, Factory, Route, Settings, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { CTASection } from "@/components/shared/CTASection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Vocational Education", path: "/engagements/vocational", description: "CITIS InfoTech creates stackable, industry-aligned vocational pathways with practical labs, recognised assessment, apprenticeships, and career mobility." });

export default function VocationalPage() {
  return (
    <>
      <PageHeader eyebrow="Vocational education" title="Skills that lead somewhere" description="Build flexible, practical pathways that recognise prior learning, respond to evolving roles, and help learners progress into employment and further education." breadcrumbs={[{ label: "Engagements", href: "/engagements" }, { label: "Vocational education" }]} />
      <ProcessTimeline eyebrow="Interactive pathway" title="A visible journey from aspiration to workforce mobility" description="Each stage creates evidence, feedback, and a clear next step for the learner." steps={[
        { meta: "Orient", title: "Discover", description: "Career exploration, aptitude insight, foundational diagnostics, and an individual learning plan." },
        { meta: "Develop", title: "Learn", description: "Modular theory, guided demonstrations, safe practice, and contextual digital capability." },
        { meta: "Demonstrate", title: "Prove", description: "Simulation, workplace projects, moderated practical assessment, and a verified portfolio." },
        { meta: "Progress", title: "Advance", description: "Apprenticeship, employment, higher-level credentials, credit transfer, or entrepreneurship." },
      ]} />
      <SplitFeature eyebrow="Skills architecture" title="Stackable learning for changing lives and roles" description="CITIS maps occupations into coherent competencies and credentials. Learners can enter at the right point, build confidence through practice, and return as roles evolve." points={["Role and task analysis", "Recognition of prior learning", "Competency-based modules", "Accessible multimodal content", "Authentic practical assessment", "Credit and credential articulation"]} stat={{ value: "Learn. Earn. Return. Progress.", label: "A lifelong pathway designed around capability—not seat time." }} />
      <FeatureGrid eyebrow="What we enable" title="The complete vocational learning ecosystem" items={[
        { icon: Factory, title: "Industry-aligned programmes", description: "Curricula co-designed around real roles, standards, equipment, safety, and emerging practices." },
        { icon: Settings, title: "Practice environments", description: "Physical labs, simulations, digital twins, job aids, and supervised workplace learning." },
        { icon: Users, title: "Trainer capability", description: "Technical updates, facilitation, inclusive practice, assessment, and industry immersion." },
        { icon: ClipboardCheck, title: "Assessment systems", description: "Observable rubrics, assessor calibration, moderation, evidence management, and quality assurance." },
        { icon: BadgeCheck, title: "Portable credentials", description: "Transparent credentials linked to demonstrated competencies and progression options." },
        { icon: BriefcaseBusiness, title: "Employer transitions", description: "Apprenticeship agreements, work-readiness support, matching, and post-placement feedback." },
      ]} />
      <FeatureGrid eyebrow="Priority sectors" title="Applied pathways for regional opportunity" columns={4} items={[
        { icon: Factory, title: "Advanced manufacturing", description: "Automation, quality, maintenance, safety, and connected operations." },
        { icon: Settings, title: "Electric mobility", description: "EV systems, diagnostics, battery safety, service, and charging." },
        { icon: Route, title: "Logistics", description: "Warehousing, planning, digital operations, safety, and customer service." },
        { icon: BadgeCheck, title: "Digital services", description: "IT support, cloud operations, cybersecurity, data, and application services." },
      ]} />
      <CTASection title="Build a vocational pathway with real progression" description="Let us connect occupational insight, practical learning, quality assessment, and employer transition." primaryLabel="Discuss a skills programme" secondaryLabel="Explore Centre of Excellence" secondaryHref="/engagements/centre-of-excellence" />
    </>
  );
}
