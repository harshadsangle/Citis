import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Centre of Excellence",
  path: "/engagements/centre-of-excellence",
  description: "Centre of Excellence · Services offered by Us.",
});

export default function CentreOfExcellencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Centre of Excellence"
        description="Centre of Excellence"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Centre of Excellence" },
        ]}
      />
      <section className="container-site max-w-4xl space-y-14 py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Centre of Excellence" />
        </AnimatedSection>
        <AnimatedSection delay={0.08}>
          <SectionHeading title="Services offered by Us" />
        </AnimatedSection>
      </section>
    </>
  );
}
