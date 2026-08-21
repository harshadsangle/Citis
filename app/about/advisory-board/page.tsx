import { PageHeader } from "@/components/layout/PageHeader";
import { ContentComingSoonPage } from "@/components/marketing/ContentComingSoonPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Advisory Board",
  path: "/about/advisory-board",
  description: "Learn about the advisors supporting CITIS InfoTech's strategic direction.",
});

export default function AdvisoryBoardPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Advisory Board"
        backgroundImage="/images/premium-indian-about-campus.jpg"
        description="Experienced voices guiding our long-term vision"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Advisory Board" },
        ]}
        tone="about"
      />
      <ContentComingSoonPage title="Advisory Board" />
    </>
  );
}