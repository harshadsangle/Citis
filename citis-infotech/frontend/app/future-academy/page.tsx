import Link from "next/link";
import { ArrowRight, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "CITIS Future Academy",
  path: "/future-academy",
  description: "CITIS Future Academy — AI Future Academy, AppWizz Academy, and MoxieMind Entrepreneurship Academy.",
});

/** Content limited to wireframe product academies — no invented courses or faculty. */
const academies = [
  {
    title: "AI Future Academy",
    href: "/products/ai-future-academy",
    icon: Sparkles,
    description: "AI Future Academy",
  },
  {
    title: "AppWizz Academy",
    href: "/products/appwizz-academy",
    icon: Rocket,
    description: "AppWizz Academy",
  },
  {
    title: "MoxieMind Entrepreneurship Academy",
    href: "/products/moxiemind",
    icon: Lightbulb,
    description: "MoxieMind Entrepreneurship Academy",
  },
];

export default function FutureAcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="CITIS Future Academy"
        title="CITIS Future Academy"
        description="Explore our academies: AI Future Academy, AppWizz Academy, and MoxieMind Entrepreneurship Academy."
        breadcrumbs={[{ label: "CITIS Future Academy" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Products"
            title="CITIS Future Academy"
            description="AI Future Academy · AppWizz Academy · MoxieMind Entrepreneurship Academy"
          />
        </AnimatedSection>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {academies.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline">
                      <Link href={item.href}>
                        View academy
                        <ArrowRight />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </section>
      <CTASection
        title="Contact CITIS InfoTech"
        description="Write to us: info@citisinfotech.in · Helpline: +91 7204992221"
        primaryHref="/contact"
        primaryLabel="Contact us"
        secondaryHref="/products"
        secondaryLabel="All products"
      />
    </>
  );
}
