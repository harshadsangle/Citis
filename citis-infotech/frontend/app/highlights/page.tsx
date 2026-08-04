import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Highlights",
  path: "/highlights",
  description: "Case Studies and Blogs.",
});

const sections = [
  { icon: TrendingUp, title: "Case Studies", href: "/highlights/case-studies" },
  { icon: BookOpen, title: "Blogs", href: "/highlights/blogs" },
];

export default function HighlightsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Highlights"
        title="Highlights"
        description="Case Studies · Blogs"
        breadcrumbs={[{ label: "Highlights" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Highlights" />
        </AnimatedSection>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <AnimatedSection key={section.title} delay={index * 0.08}>
                <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={section.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {section.title}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </section>
    </>
  );
}
