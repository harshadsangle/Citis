import { PageHeader } from "@/components/layout/PageHeader";
import { AboutPage } from "@/components/marketing/AboutPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "About Us",
  path: "/about",
  description:
    "CITIS Infotech LLP is India's leading Education Transformation Company, partnering with Schools, Colleges, Universities, Governments, and Enterprises to build innovative, technology-enabled, and industry-integrated learning ecosystems that prepare learners for the future.",
});

export default function AboutUsPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About Us"
        backgroundImage="/images/premium-indian-about-campus.jpg"
        description="India's leading Education Transformation Company"
        breadcrumbs={[{ label: "About Us" }]}
        tone="about"
      />
      <AboutPage />
    </>
  );
}
