import { PageHeader } from "@/components/layout/PageHeader";
import { QualityPolicyPage } from "@/components/marketing/QualityPolicyPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Quality Policy",
  path: "/about/quality-policy",
  description:
    "Delivering Excellence Through Quality, Innovation and Continuous Improvement — CITIS Infotech LLP is committed to delivering world-class education solutions.",
});

export default function QualityPolicyRoute() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Quality Policy"
        backgroundImage="/images/quality-policy-background.jpg"
        description="Delivering Excellence Through Quality, Innovation and Continuous Improvement"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Quality Policy" },
        ]}
        tone="about"
      />
      <QualityPolicyPage />
    </>
  );
}
