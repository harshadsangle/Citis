import { PageHeader } from "@/components/layout/PageHeader";
import { MediaPage } from "@/components/marketing/MediaPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Media",
  path: "/about/media",
  description: "Media",
});

export default function MediaRoute() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Media"
        backgroundImage="/images/premium-indian-media-event.jpg"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Media" },
        ]}
        tone="about"
      />
      <MediaPage />
    </>
  );
}