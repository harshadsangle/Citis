import { BarChart3, Beaker, BookOpenCheck, Building2, Cpu, Network, Settings, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { CTASection } from "@/components/shared/CTASection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Centres of Excellence", path: "/engagements/centre-of-excellence", description: "Plan, launch, and sustain education Centres of Excellence with CITIS InfoTech strategy, curriculum, labs, faculty development, industry partnerships, and impact measurement." });

export default function CentreOfExcellencePage() {
  return (
    <>
      <PageHeader eyebrow="Centre of Excellence" title="A living ecosystem for learning, innovation, and collaboration" description="CITIS InfoTech helps institutions create Centres of Excellence that build capability, enable applied work, connect industry, and remain valuable long after launch." breadcrumbs={[{ label: "Engagements", href: "/engagements" }, { label: "Centre of Excellence" }]} />
      <FeatureGrid eyebrow="CoE services" title="From strategic intent to sustained operation" description="Select individual services or engage one accountable partner across the CoE lifecycle." items={[
        { icon: Building2, title: "Strategy & business case", description: "Purpose, audiences, capability priorities, partnership model, roadmap, investment case, and measures of success." },
        { icon: Cpu, title: "Technology & lab design", description: "Use-case-led architecture, equipment specification, cloud environments, safety, accessibility, and lifecycle planning." },
        { icon: BookOpenCheck, title: "Curriculum & credentials", description: "Role-aligned pathways, courses, labs, capstones, assessment, academic integration, and stackable credentials." },
        { icon: Users, title: "Faculty & facilitator development", description: "Train-the-trainer pathways, technical immersion, instructional coaching, communities, and practice standards." },
        { icon: Network, title: "Industry activation", description: "Advisory boards, mentors, challenge banks, sponsored cohorts, applied research, and talent pipelines." },
        { icon: Settings, title: "Operations & governance", description: "Programme office, calendars, service standards, asset management, learner support, and quality processes." },
        { icon: Beaker, title: "Innovation programmes", description: "Hackathons, incubators, research sprints, prototype studios, and multidisciplinary community challenges." },
        { icon: BarChart3, title: "Impact & improvement", description: "Baseline, dashboards, portfolio evidence, stakeholder reviews, outcome evaluation, and scale recommendations." },
      ]} />
      <SplitFeature eyebrow="Designed for use" title="More than an impressive room" description="A successful CoE has a clear academic role, regular learner participation, capable facilitators, active industry contribution, and evidence that justifies continued investment." points={["Embedded in institutional strategy", "Connected to programmes and credit", "Inclusive access and scheduling", "Recurring employer engagement", "Sustainable operating model", "Visible learner and institutional outcomes"]} stat={{ value: "Purpose before procurement", label: "Every technology decision begins with the learning and innovation experience it must enable." }} />
      <ProcessTimeline eyebrow="Launch pathway" title="Build confidence before scaling investment" steps={[
        { title: "Frame", description: "Define outcomes, users, differentiators, governance, constraints, and baseline evidence." },
        { title: "Prototype", description: "Test priority learning journeys, lab use cases, partnerships, and operating assumptions." },
        { title: "Launch", description: "Enable teams, activate curriculum and challenges, onboard learners, and establish support." },
        { title: "Sustain", description: "Review utilisation and outcomes, refresh capability priorities, and expand proven models." },
      ]} />
      <CTASection title="Turn your Centre of Excellence vision into an operating model" description="Book a discovery workshop to align stakeholders around purpose, priorities, and a practical first phase." primaryLabel="Plan a CoE workshop" secondaryLabel="Explore university engagement" secondaryHref="/engagements/university" />
    </>
  );
}
