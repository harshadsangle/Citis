import { BadgeCheck, Building2, Globe2, HeartHandshake, Lightbulb, Network, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PartnerInquiryForm } from "@/components/marketing/InteractiveForms";
import { FeatureGrid, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FAQ } from "@/components/shared/FAQ";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Partner With Us", path: "/partner", description: "Partner with CITIS InfoTech to co-create academic programmes, industry pathways, learning technology, educator capability, and workforce opportunity." });

export default function PartnerPage() {
  return (
    <>
      <PageHeader eyebrow="Partner with CITIS InfoTech" title="Collaboration turns learning into opportunity" description="We bring education institutions, industry, technology partners, and delivery organisations together around shared outcomes and a practical model for contribution." breadcrumbs={[{ label: "Partner" }]} />
      <FeatureGrid eyebrow="Partnership models" title="Find the model that fits your contribution" items={[
        { icon: Building2, title: "Academic partnership", description: "Co-design curriculum, faculty development, credit pathways, applied research, and innovation programmes." },
        { icon: HeartHandshake, title: "Industry alliance", description: "Shape talent pathways, provide mentors and briefs, sponsor labs, offer internships, and hire verified capability." },
        { icon: Lightbulb, title: "Technology partnership", description: "Connect platforms, cloud, tools, and credentials to meaningful learning experiences and responsible adoption." },
        { icon: Users, title: "Delivery partnership", description: "Extend regional reach through trained facilitators, shared quality standards, learner support, and local context." },
        { icon: Globe2, title: "Community partnership", description: "Create inclusive access, scholarships, outreach, educator networks, and place-based learning challenges." },
        { icon: Network, title: "Strategic consortium", description: "Coordinate multi-stakeholder initiatives for sector skills, education transformation, and workforce mobility." },
      ]} />
      <SplitFeature eyebrow="Why CITIS" title="An accountable bridge between education and work" description="We combine academic respect, learning design, technology delivery, programme operations, and employer engagement. Partners gain one coordinated team and transparent evidence of progress." points={["Outcome and role mapping", "Co-branded programme design", "Faculty and mentor enablement", "Learner operations and support", "Assessment and credentialing", "Impact reporting and improvement"]} stat={{ value: "Shared purpose. Defined roles. Measured value.", label: "Partnership governance designed for trust, momentum, and long-term relevance." }} />
      <FeatureGrid eyebrow="Partner benefits" title="Create value across the ecosystem" columns={4} items={[
        { icon: BadgeCheck, title: "Credible impact", description: "Clear outcomes and transparent evidence for learners and stakeholders." },
        { icon: Users, title: "Connected talent", description: "Earlier, richer engagement with learners and educators." },
        { icon: Lightbulb, title: "Applied innovation", description: "A structured route from challenges to prototypes and insight." },
        { icon: Globe2, title: "Extended reach", description: "Flexible models for institutions, sectors, and regions." },
      ]} />
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:gap-16">
          <AnimatedSection><SectionHeading eyebrow="Partnership inquiry" title="Tell us what we could build together" description="Share your organisation, intended learners, contribution, and the outcome you want to create. Our partnerships team will propose a useful next conversation." /></AnimatedSection>
          <AnimatedSection delay={0.1}><PartnerInquiryForm /></AnimatedSection>
        </div>
      </section>
      <FAQ title="Partnership questions" items={[
        { question: "What types of organisations can partner with CITIS?", answer: "We collaborate with education institutions, employers, industry bodies, technology providers, government and skills organisations, foundations, and qualified delivery partners." },
        { question: "Can a partnership start with a pilot?", answer: "Yes. A focused pilot with defined outcomes, roles, learners, and evidence is often the best way to test assumptions before scaling." },
        { question: "How is programme quality managed?", answer: "We agree standards for curriculum, facilitation, assessment, learner support, data, and review. Partners receive clear governance and regular outcome reporting." },
        { question: "Do you support co-branded academies?", answer: "Yes. Co-branded or institution-branded models can include custom pathways, platform experience, faculty enablement, mentors, credentials, and programme operations." },
      ]} />
    </>
  );
}
