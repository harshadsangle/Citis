import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlobalCertificationDetailPage } from "@/components/marketing/GlobalCertificationDetailPage";
import { getGlobalCertification, GLOBAL_CERTIFICATIONS } from "@/lib/global-certifications";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return GLOBAL_CERTIFICATIONS.map((certification) => ({ slug: certification.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "adobe") redirect("/engagements/global-certifications");
  const certification = getGlobalCertification(slug);
  return certification
    ? generatePageMetadata({
        title: `${certification.name} Certification`,
        description: certification.tagline,
        path: `/engagements/global-certifications/${certification.slug}`,
        image: "/images/global-certifications-background.jpg",
        keywords: [certification.name, "global certification", certification.category],
      })
    : generatePageMetadata({ title: "Certification not found", noIndex: true });
}

export default async function GlobalCertificationDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "adobe") redirect("/engagements/global-certifications");
  const certification = getGlobalCertification(slug);
  if (!certification) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Global Certification"
        title={certification.name}
        description={certification.tagline}
        backgroundImage="/images/global-certifications-background.jpg"
        breadcrumbs={[
          { label: "Engagements", href: "/engagements" },
          { label: "Global Certifications", href: "/engagements/global-certifications" },
          { label: certification.name },
        ]}
      />
      <GlobalCertificationDetailPage certification={certification} />
    </>
  );
}