import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "About Us",
  path: "/about",
  description: "About Us — CITIS InfoTech.",
});

const aboutLinks = [
  { title: "About Us", href: "/about" },
  { title: "Vision and Mission", href: "/about/vision-mission" },
  { title: "Quality Policy", href: "/about/quality-policy" },
  { title: "Our Associations", href: "/about/associations" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About Us"
        description="About Us"
        breadcrumbs={[{ label: "About Us" }]}
        tone="about"
      />
      <section className="bg-[#e8f4f8] dark:bg-slate-900">
        <div className="container-site py-16 sm:py-24">
          <AnimatedSection>
            <SectionHeading title="About Us" />
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
              CITIS InfoTech is a leading technology-enabled education company empowering K–12 and Higher
              Education institutions with future-ready solutions that seamlessly integrate academic learning
              with industry relevance.
            </p>
          </AnimatedSection>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutLinks.map((item, index) => (
              <AnimatedSection key={item.href} delay={index * 0.05}>
                <Link href={item.href} className="block h-full">
                  <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        View
                        <ArrowRight className="size-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
