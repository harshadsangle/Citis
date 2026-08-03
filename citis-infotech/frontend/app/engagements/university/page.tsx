import { Beaker, BookOpenCheck, BriefcaseBusiness, Cpu, GraduationCap, Lightbulb, Network, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { CTASection } from "@/components/shared/CTASection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "University Engagement", path: "/engagements/university", description: "CITIS InfoTech partners with universities on curriculum, faculty capability, industry-integrated learning, innovation, and student progression." });

export default function UniversityPage() {
  return (
    <>
      <PageHeader eyebrow="University engagement" title="Universities where knowledge becomes capability" description="Connect academic rigour with contemporary practice through co-designed curricula, enabled faculty, authentic projects, and sustained employer participation." breadcrumbs={[{ label: "Engagements", href: "/engagements" }, { label: "University" }]} />
      <FeatureGrid eyebrow="Ways to collaborate" title="Build on your institution’s strengths" items={[
        { icon: BookOpenCheck, title: "Curriculum transformation", description: "Map future capabilities to programme outcomes, courses, assessment, and credit-bearing experiences." },
        { icon: Users, title: "Faculty enablement", description: "Practice-based studios, coaching, communities, and resources for confident contemporary teaching." },
        { icon: Beaker, title: "Innovation labs", description: "Purposeful spaces, challenge portfolios, governance, and facilitator capability—not equipment alone." },
        { icon: BriefcaseBusiness, title: "Career pathways", description: "Role discovery, diagnostic insight, portfolio development, mentoring, and employer matching." },
        { icon: Lightbulb, title: "Entrepreneurship", description: "Idea validation, venture studios, founder mentoring, and demonstration opportunities." },
        { icon: Network, title: "Digital ecosystems", description: "Integrated learning, assessment, analytics, credentials, and learner support experiences." },
      ]} />
      <SplitFeature eyebrow="Domain expertise" title="Relevant learning across disciplines" description="Our academic and industry specialists contextualise technology without diluting disciplinary identity. Programmes can be embedded, elective, co-curricular, or offered as stackable credentials." points={["Artificial intelligence and data", "Cloud and cybersecurity", "Application and product development", "Advanced manufacturing and IoT", "Digital business and entrepreneurship", "Communication and professional capability"]} stat={{ value: "Academic depth × industry context", label: "Learning designed to transfer from classroom to complex real-world work." }} />
      <ProcessTimeline eyebrow="University progression model" title="A coherent journey from exploration to professional contribution" steps={[
        { meta: "Discover", title: "Explore", description: "Understand domains, roles, strengths, ethics, and the changing world of work." },
        { meta: "Practise", title: "Build", description: "Develop foundations through guided labs, feedback, and increasingly complex tasks." },
        { meta: "Apply", title: "Contribute", description: "Solve authentic briefs with peers, faculty, and mentors from industry." },
        { meta: "Progress", title: "Launch", description: "Present verified evidence, earn credentials, and transition into work or advanced study." },
      ]} />
      <FeatureGrid eyebrow="IILP by industry" title="Industry-Integrated Learning Programmes" description="Semester-aligned programmes connect curriculum to sector practices through mentors, simulations, live briefs, and capstones." columns={4} items={[
        { icon: Cpu, title: "Technology", description: "AI, cloud, cyber, software, product thinking, and digital operations." },
        { icon: Beaker, title: "Life sciences", description: "Research data, quality systems, digital health, and regulated innovation." },
        { icon: Network, title: "Manufacturing", description: "Automation, connected systems, quality, sustainability, and operations." },
        { icon: GraduationCap, title: "Business services", description: "Analytics, customer experience, financial technology, and consulting practice." },
      ]} />
      <CTASection title="Create a distinctive progression model for your university" description="We will work with academic leaders, faculty, students, and employers to define an achievable first phase." primaryLabel="Plan a university workshop" secondaryLabel="View placement engagement" secondaryHref="/engagements/placements" />
    </>
  );
}
