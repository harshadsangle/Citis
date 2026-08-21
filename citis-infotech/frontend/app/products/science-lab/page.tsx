import { PageHeader } from "@/components/layout/PageHeader";
import { ScienceLabPage } from "@/components/marketing/ScienceLabPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Science Lab",
  path: "/products/science-lab",
  description: "The Virtual Lab of Tomorrow",
});

export default function ScienceLabRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Science Lab"
        description="The Virtual Lab of Tomorrow"
        backgroundImage="/images/premium-indian-science-lab.jpg"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Science Lab" },
        ]}
      />
      <ScienceLabPage />
    </>
  );
}