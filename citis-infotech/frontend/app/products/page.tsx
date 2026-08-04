import Link from "next/link";
import { ArrowRight, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Products",
  path: "/products",
  description: "AI Future Academy, AppWizz Academy, MoxieMind Entrepreneurship Academy.",
});

const academies = [
  { icon: Sparkles, name: "AI Future Academy", href: "/products/ai-future-academy" },
  { icon: Rocket, name: "AppWizz Academy", href: "/products/appwizz-academy" },
  { icon: Lightbulb, name: "MoxieMind Entrepreneurship Academy", href: "/products/moxiemind" },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Products"
        description="AI Future Academy · AppWizz Academy · MoxieMind Entrepreneurship Academy"
        breadcrumbs={[{ label: "Products" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Products" />
        </AnimatedSection>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {academies.map((academy, index) => {
            const Icon = academy.icon;
            return (
              <AnimatedSection key={academy.name} delay={index * 0.08}>
                <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <CardTitle className="text-2xl">{academy.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={academy.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      View
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
