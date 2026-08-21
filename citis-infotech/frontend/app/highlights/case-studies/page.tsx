import { PageHeader } from "@/components/layout/PageHeader";
import { ContentBrowser } from "@/components/marketing/ContentBrowser";
import { CTASection } from "@/components/shared/CTASection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Education Case Studies", path: "/highlights/case-studies", description: "See how CITIS InfoTech partners with universities, schools, skills organisations, and employers to create measurable learning outcomes." });

export default function CaseStudiesPage() {
  return (
    <>
      <PageHeader eyebrow="Case studies" title="Partnerships measured by progress" description="Explore how institutions and industry partners have strengthened curriculum, educator capability, learning ecosystems, and learner transitions with CITIS InfoTech." backgroundImage="/images/indian-case-study-classroom.jpg" breadcrumbs={[{ label: "Highlights", href: "/highlights" }, { label: "Case studies" }]} />
      <ContentBrowser kind="case-studies" />
      <CTASection title="Create your institution’s next impact story" description="Start with the outcome you need to improve. We will help define an evidence-led pathway forward." primaryLabel="Discuss your priority" secondaryLabel="Explore engagements" secondaryHref="/engagements" />
    </>
  );
}
