import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "AppWizz Academy",
  path: "/products/appwizz-academy",
  description: "AppWizz Academy",
});

export default function AppWizzAcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="AppWizz Academy"
        description="AppWizz Academy"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "AppWizz Academy" },
        ]}
      />
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="AppWizz Academy" />
        </AnimatedSection>
      </section>
    </>
  );
}
