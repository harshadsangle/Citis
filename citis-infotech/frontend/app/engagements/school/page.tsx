import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "School Solutions",
  path: "/engagements/school",
  description: "Tomorrow’s Schools, ICT Integration, STEM Education Solution.",
});

const sections = [
  { title: "Tomorrow’s Schools" },
  { title: "ICT Integration" },
  { title: "STEM Education Solution" },
];

export default function SchoolPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="School Solutions"
        description="School Solutions"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "School Solutions" },
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
