import { PageHeader } from "@/components/layout/PageHeader";
import PartnerWithUsPage from "@/components/marketing/PartnerWithUsPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Partner With Us",
  path: "/partner",
  description:
    "Partner with CITIS Infotech — franchise and centre partnerships, institutional collaboration, industry & corporate collaboration, and strategic partnerships.",
});

export default function PartnerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Partner With Us"
        title="Build the Future of Education Together"
        description="Partner with CITIS to create new opportunities in education, skills and emerging technologies."
        breadcrumbs={[{ label: "Partner With Us" }]}
      />
      <PartnerWithUsPage />
    </>
  );
}
