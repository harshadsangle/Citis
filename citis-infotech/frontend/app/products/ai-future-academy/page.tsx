import { PageHeader } from "@/components/layout/PageHeader";
import { AIFutureAcademyPage } from "@/components/marketing/AIFutureAcademyPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "AI Academy",
  path: "/products/ai-future-academy",
  description: "Computational Thinking, Coding & Artificial Intelligence for K–12",
});

export default function AIFutureAcademyRoute() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="CITIS AI Academy"
        description="Computational Thinking, Coding & Artificial Intelligence for K–12"
        backgroundImage="/images/ai-academy-background.jpg"
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "CITIS AI Academy" },
        ]}
      />
      <AIFutureAcademyPage />
    </>
  );
}
