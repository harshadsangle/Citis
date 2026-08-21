import { PageHeader } from "@/components/layout/PageHeader";
import { AssociationsPage } from "@/components/marketing/AssociationsPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Our Associations",
  path: "/about/associations",
  description:
    "Collaborating with Global Leaders to Transform Education — CITIS Infotech LLP partners with globally recognized technology companies, certification bodies, universities, and industry leaders.",
});

export default function AssociationsRoute() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Our Associations"
        backgroundImage="/images/indian-associations-university.jpg"
        description="Collaborating with Global Leaders to Transform Education"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Our Associations" },
        ]}
        tone="about"
      />
      <AssociationsPage />
    </>
  );
}
