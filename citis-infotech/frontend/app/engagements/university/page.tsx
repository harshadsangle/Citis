import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "University Solutions",
  path: "/engagements/university",
  description: "Ways to Collaborate, Domain Expertise, Key benefits of the CITIS University Progression Model, IILP – By the Industry.",
});

const sections = [
  { title: "Ways to Collaborate" },
  { title: "Domain Expertise" },
  { title: "Key benefits of the CITIS University Progression Model" },
  { title: "IILP – By the Industry" },
];

export default function UniversityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="University Solutions"
        description="University Solutions"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "University Solutions" },
        ]}
      />
      <section className="container-site max-w-4xl space-y-14 py-16 sm:py-24">
        {sections.map((section, index) => (
          <AnimatedSection key={section.title} delay={index * 0.05}>
            <SectionHeading title={section.title} />
          </AnimatedSection>
        ))}
      </section>
    </>
  );
}
