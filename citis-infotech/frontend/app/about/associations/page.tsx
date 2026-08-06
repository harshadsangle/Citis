import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Our Associations",
  path: "/about/associations",
  description: "Our Associations — CITIS InfoTech.",
});

export default function AssociationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Our Associations"
        description="Our Associations"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Our Associations" },
        ]}
        tone="about"
      />
      <section className="bg-[#e8f4f8]">
        <div className="container-site max-w-4xl py-16 sm:py-24">
          <AnimatedSection>
            <SectionHeading title="Our Associations" />
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              CITIS InfoTech partners with academic institutions, industry organizations, and education
              networks to deliver industry–academia collaboration and future-ready learning programs.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
