import { PageHeader } from "@/components/layout/PageHeader";
import PlacementsPage from "@/components/marketing/PlacementsPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Placements and Internships",
  path: "/engagements/placements",
  description:
    "CITIS Infotech bridges education and careers through structured internship programs, placement readiness, industry connect and career guidance.",
});

export default function PlacementsPageRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Placements & Internships"
        description="Connecting Education with Careers"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Placements & Internships" },
        ]}
      />
      <PlacementsPage />
    </>
  );
}
