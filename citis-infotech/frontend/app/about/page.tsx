import { Award, BookOpenCheck, Compass, HeartHandshake, ShieldCheck, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "About Us", path: "/about", description: "Meet CITIS InfoTech, an EdTech company helping education institutions, industry, educators, and learners build capabilities for a changing world." });

const leaders = [
  { initials: "AK", name: "Anil Kumar", role: "Founder & Managing Director", bio: "An education entrepreneur focused on connecting academic purpose, emerging technology, and equitable workforce opportunity." },
  { initials: "MR", name: "Dr. Maya Rao", role: "Chief Academic Officer", bio: "A curriculum and faculty-development leader with two decades of experience across universities and lifelong learning." },
  { initials: "SM", name: "Sanjay Menon", role: "Chief Partnerships Officer", bio: "Builds durable collaborations among education providers, employers, governments, and community organisations." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About CITIS InfoTech" title="Education strengthened by technology, partnership, and purpose" description="We help learning organisations turn ambitious ideas into inclusive programmes, confident educators, capable graduates, and measurable outcomes." breadcrumbs={[{ label: "About us" }]} />
      <SplitFeature eyebrow="Who we are" title="An EdTech partner from strategy to learner success" description="CITIS InfoTech works with universities, schools, skills organisations, and employers to design contemporary learning pathways and the technology ecosystems that sustain them." points={["Academic and industry co-design", "Faculty and teacher enablement", "Applied, project-based learning", "Digital learning platforms", "Career readiness and placement", "Evidence-led programme improvement"]} stat={{ value: "Learning for life and work", label: "Built with educators. Connected to industry. Centred on learners." }} />
      <FeatureGrid eyebrow="Our foundation" title="A clear direction and a promise of quality" items={[
        { icon: Compass, title: "Vision", description: "A world where every learner can access relevant education, demonstrate their potential, and progress with confidence." },
        { icon: Target, title: "Mission", description: "To unite educators, technology, and industry in learning experiences that build capability and expand opportunity." },
        { icon: ShieldCheck, title: "Quality policy", description: "We commit to learner-centred design, academic integrity, accessible delivery, transparent evidence, and continual improvement." },
      ]} />
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading align="center" eyebrow="Our associations" title="Progress is a collaborative practice" description="We engage with academic communities, skills networks, technology ecosystems, and employer forums. Logos below represent partnership categories pending final brand approvals." /></AnimatedSection>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {["University Network", "Schools Alliance", "Skills Council", "Industry Forum", "Cloud Learning", "STEM Community"].map((name, index) => <AnimatedSection key={name} delay={index * 0.05}><div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase">{name}</div></AnimatedSection>)}
          </div>
        </div>
      </section>
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection><SectionHeading eyebrow="Leadership" title="Educators, builders, and partnership leaders" description="Our leadership team combines academic practice, learning technology, programme delivery, and industry engagement." /></AnimatedSection>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {leaders.map((leader, index) => <AnimatedSection key={leader.name} delay={index * 0.07}><Card className="h-full"><CardContent className="p-7"><span className="brand-gradient grid size-16 place-items-center rounded-2xl font-heading text-lg font-bold text-white">{leader.initials}</span><h3 className="mt-5 font-heading text-xl font-semibold">{leader.name}</h3><p className="mt-1 text-sm font-semibold text-primary">{leader.role}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">{leader.bio}</p></CardContent></Card></AnimatedSection>)}
        </div>
      </section>
      <ProcessTimeline eyebrow="Our journey" title="Growing with the learning ecosystem" description="Milestones in our commitment to connected, technology-enabled education." steps={[
        { meta: "2010", title: "CITIS founded", description: "Started with a mission to make technology education more practical and accessible." },
        { meta: "2015", title: "Campus partnerships", description: "Expanded into curriculum co-design, faculty development, and university innovation labs." },
        { meta: "2020", title: "Digital learning at scale", description: "Helped institutions maintain continuity and redesign learning for blended delivery." },
        { meta: "2026", title: "Connected academies", description: "Bringing AI, application development, life skills, and industry credentials into one ecosystem." },
      ]} />
      <FeatureGrid eyebrow="What guides us" title="Values visible in the work" columns={4} items={[
        { icon: BookOpenCheck, title: "Learning first", description: "Technology serves pedagogy and human development." },
        { icon: HeartHandshake, title: "Partnership", description: "We build with institutions, not around them." },
        { icon: Users, title: "Inclusion", description: "Access and belonging are designed from the start." },
        { icon: Award, title: "Evidence", description: "Outcomes are defined, observed, and improved." },
      ]} />
      <CTASection title="Shape the next chapter of learning with us" description="Bring us your institutional priority, capability challenge, or idea for collaboration." primaryLabel="Start a conversation" secondaryLabel="Explore engagements" secondaryHref="/engagements" />
    </>
  );
}
