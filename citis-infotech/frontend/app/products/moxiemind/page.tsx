import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "MoxieMind Entrepreneurship Academy",
  path: "/products/moxiemind",
  description: "MoxieMind Entrepreneurship Academy",
});

export default function MoxieMindPage() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="MoxieMind Entrepreneurship Academy"
        description="MoxieMind Entrepreneurship Academy"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "MoxieMind Entrepreneurship Academy" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="MoxieMind Entrepreneurship Academy" />
        </AnimatedSection>
      </section>
    </>
  );
}
