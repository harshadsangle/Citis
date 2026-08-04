import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Vocational Education",
  path: "/engagements/vocational",
  description: "Vocational Education — CITIS InfoTech.",
});

export default function VocationalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Vocational Education"
        description="Vocational Education"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Vocational Education" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Vocational Education" />
        </AnimatedSection>
      </section>
    </>
  );
}
