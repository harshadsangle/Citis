import { PageHeader } from "@/components/layout/PageHeader";
import { SchoolPage } from "@/components/marketing/SchoolPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "School Solutions",
  path: "/engagements/school",
  description:
    "CITIS Infotech works with schools to build future-ready, technology-enabled and innovation-driven learning ecosystems through AI, coding, ICT integration, STEM education and virtual science learning.",
});

export default function SchoolPageRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="School Solutions"
        description="Building future-ready, technology-enabled and innovation-driven learning ecosystems"
        backgroundImage="/images/school-solutions-background.jpg"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "School Solutions" },
        ]}
      />
      <SchoolPage />
    </>
  );
}
