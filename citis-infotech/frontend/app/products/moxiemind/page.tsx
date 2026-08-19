import { PageHeader } from "@/components/layout/PageHeader";
import { MoxieMindsPage } from "@/components/marketing/MoxieMindsPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "MoxieMinds Entrepreneurship Academy",
  path: "/products/moxiemind",
  description: "Transforming Vision into Venture. Where Ideas Ignite Business Success.",
});

export default function MoxieMindsRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="MoxieMinds Entrepreneurship Academy"
        description="Transforming Vision into Venture. Where Ideas Ignite Business Success."
        backgroundImage="/images/moxieminds-entrepreneurship-background.jpg"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "MoxieMinds Entrepreneurship Academy" },
        ]}
      />
      <MoxieMindsPage />
    </>
  );
}
