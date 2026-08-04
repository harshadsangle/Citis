import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Quality Policy",
  path: "/about/quality-policy",
  description: "Quality Policy — CITIS InfoTech.",
});

export default function QualityPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Quality Policy"
        description="Quality Policy"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Quality Policy" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Quality Policy" />
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            CITIS InfoTech is committed to excellence in curriculum design, delivery, assessment,
            certifications, and placement assistance—ensuring outcome-focused, industry-aligned learning
            experiences for institutions and learners.
          </p>
        </AnimatedSection>
      </section>
    </>
  );
}
