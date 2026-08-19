import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryPage } from "@/components/marketing/GalleryPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Gallery",
  path: "/about/gallery",
  description: "Gallery",
});

export default function GalleryRoute() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Gallery"
        backgroundImage="/images/gallery-background.jpg"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Gallery" },
        ]}
        tone="about"
      />
      <GalleryPage />
    </>
  );
}