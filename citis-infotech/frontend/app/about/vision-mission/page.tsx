import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Vision and Mission",
  path: "/about/vision-mission",
  description: "Vision and Mission — CITIS InfoTech.",
});

export default function VisionMissionPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Vision and Mission"
        description="Vision and Mission"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Vision and Mission" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Vision" />
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Inspired by excellence and driven by innovation, CITIS InfoTech shapes the next generation of
            skilled professionals for a dynamic, technology-driven world.
          </p>
        </AnimatedSection>
        <AnimatedSection className="mt-14" delay={0.08}>
          <SectionHeading title="Mission" />
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            To empower K–12 and Higher Education institutions with future-ready solutions that integrate
            academic learning with industry relevance, bridging the gap between education and employability.
          </p>
        </AnimatedSection>
      </section>
    </>
  );
}
