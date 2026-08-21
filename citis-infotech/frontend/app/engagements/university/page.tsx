import { PageHeader } from "@/components/layout/PageHeader";
import { UniversityPage } from "@/components/marketing/UniversityPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "University Solutions",
  path: "/engagements/university",
  description:
    "Empowering Universities and Higher Education Institutions through Industry Integrated Learning Programs, Academic Innovation, Centre of Excellence, Artificial Intelligence, Global Certifications, Faculty Development, and Outcome-Based Education aligned with NEP 2020.",
});

export default function UniversityPageRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="University Solutions"
        description="Transforming Universities into Future-Ready Institutions"
        backgroundImage="/images/premium-indian-university-campus.jpg"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "University Solutions" },
        ]}
      />
      <UniversityPage />
    </>
  );
}
