import { PageHeader } from "@/components/layout/PageHeader";
import { ContentComingSoonPage } from "@/components/marketing/ContentComingSoonPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Management Team",
  path: "/about/management-team",
  description: "Meet the team shaping CITIS InfoTech's education transformation journey.",
});

export default function ManagementTeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Management Team"
        backgroundImage="/images/premium-indian-about-campus.jpg"
        description="The people driving our education transformation journey"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Management Team" },
        ]}
        tone="about"
      />
      <ContentComingSoonPage title="Management Team" />
    </>
  );
}