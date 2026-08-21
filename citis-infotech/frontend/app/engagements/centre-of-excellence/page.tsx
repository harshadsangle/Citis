import { PageHeader } from "@/components/layout/PageHeader";
import CentreOfExcellencePage from "@/components/marketing/CentreOfExcellencePage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Centre of Excellence",
  path: "/engagements/centre-of-excellence",
  description:
    "CITIS Infotech helps universities and colleges establish Centres of Excellence in AI and Cyber Security — building institutional capability in emerging technologies.",
});

export default function CentreOfExcellencePageRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Centre of Excellence"
        description="Building Institutional Capability in Emerging Technologies"
        backgroundImage="/images/indian-coe-lab.jpg"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Centre of Excellence" },
        ]}
      />
      <CentreOfExcellencePage />
    </>
  );
}
