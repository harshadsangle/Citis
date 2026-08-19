import { PageHeader } from "@/components/layout/PageHeader";
import { ContentBrowser } from "@/components/marketing/ContentBrowser";
import { CTASection } from "@/components/shared/CTASection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Education Insights & Blogs",
  path: "/highlights/blogs",
  description:
    "Practical CITIS InfoTech insights on higher education, schools, AI literacy, faculty capability, workforce development, and employability.",
});

export default function BlogsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Blogs & perspectives"
        title="Useful thinking for people building the future of learning"
        description="Frameworks, field notes, and informed perspectives from CITIS educators, technologists, programme leaders, and partners."
        breadcrumbs={[
          { label: "Highlights", href: "/highlights" },
          { label: "Blogs" },
        ]}
        tone="blogs"
      />
      <div className="bg-[#e8edf5] dark:bg-slate-900">
        <ContentBrowser kind="blogs" />
      </div>
      <CTASection
        title="Bring an idea into practice"
        description="Explore how CITIS can help your institution translate emerging possibilities into responsible learning experiences."
        primaryLabel="Talk to our education team"
        secondaryLabel="View case studies"
        secondaryHref="/highlights/case-studies"
      />
    </>
  );
}
