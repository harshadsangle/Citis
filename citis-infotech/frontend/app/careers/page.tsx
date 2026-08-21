import { PageHeader } from "@/components/layout/PageHeader";
import { CareersPage as CareersContent } from "@/components/marketing/CareersPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Careers with CITIS",
  path: "/careers",
  description: "Build the Future of Learning with Us",
});

export default function CareersPage() {
  return (
    <>
      <PageHeader
        backgroundImage="/images/indian-career-campus.jpg"
        title="Careers with CITIS"
        description="Build the Future of Learning with Us"
        breadcrumbs={[{ label: "Careers with CITIS" }]}
      />
      <CareersContent />
    </>
  );
}
