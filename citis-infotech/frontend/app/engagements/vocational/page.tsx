import { PageHeader } from "@/components/layout/PageHeader";
import { VocationalEducationPage } from "@/components/marketing/VocationalEducationPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Vocational Education & Skill Development",
  path: "/engagements/vocational",
  description: "Vocational Education & Skill Development — Building Skills. Creating Opportunities. Connecting Education with Industry.",
});

export default function VocationalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Vocational Education & Skill Development"
        description="Building Skills. Creating Opportunities. Connecting Education with Industry."
        backgroundImage="/images/premium-indian-vocational-workshop.jpg"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Vocational Education" },
        ]}
      />
      <VocationalEducationPage />
    </>
  );
}
