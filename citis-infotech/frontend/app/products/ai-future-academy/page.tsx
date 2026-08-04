import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "AI Future Academy",
  path: "/products/ai-future-academy",
  description: "AI Future Academy",
});

export default function AIFutureAcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="AI Future Academy"
        description="AI Future Academy"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "AI Future Academy" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="AI Future Academy" />
        </AnimatedSection>
      </section>
    </>
  );
}
