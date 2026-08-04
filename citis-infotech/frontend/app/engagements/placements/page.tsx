import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Placements and Internships",
  path: "/engagements/placements",
  description: "Placements and Internships — CITIS InfoTech.",
});

export default function PlacementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Placements and Internships"
        description="Placements and Internships"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Placements and Internships" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Placements and Internships" />
        </AnimatedSection>
      </section>
    </>
  );
}
