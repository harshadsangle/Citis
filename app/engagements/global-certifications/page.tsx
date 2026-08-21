import { PageHeader } from "@/components/layout/PageHeader";
import { GlobalCertificationPage } from "@/components/marketing/GlobalCertificationPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Global Certifications",
  path: "/engagements/global-certifications",
  description:
    "Industry-recognized certification pathways through EtrainIndia across technology, business and professional skills.",
});

export default function GlobalCertificationsRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Global Certifications"
        description="Industry-Recognized Certification Pathways"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Global Certifications" },
        ]}
      />
      <GlobalCertificationPage />
    </>
  );
}