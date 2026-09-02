import { ProfessionalProgramsCatalogue } from "@/components/marketing/ProfessionalProgramsCatalogue";
import { PageHeader } from "@/components/layout/PageHeader";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Professional Programs & Specializations",
  path: "/engagements/professional-programs",
  description: "Explore CITIS professional programmes and specialisations across technology, business, data, innovation, operations, and future-ready skills.",
});

export default function ProfessionalProgramsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Professional Programs & Specializations"
        description="Industry-oriented learning pathways for practical capability, career growth, and applied innovation."
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Professional Programs & Specializations" },
        ]}
      />
      <ProfessionalProgramsCatalogue />
    </>
  );
}