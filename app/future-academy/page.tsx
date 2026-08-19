import Link from "next/link";
import { ArrowRight, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "CITIS Future Academy",
  path: "/future-academy",
  description: "AI Academy · AppWizz Academy · MoxieMind Entrepreneurship Academy",
});

const academies = [
  { title: "AI Academy", href: "/products/ai-future-academy", icon: Sparkles },
  { title: "AppWizz Academy", href: "/products/appwizz-academy", icon: Rocket },
  { title: "MoxieMind Entrepreneurship Academy", href: "/products/moxiemind", icon: Lightbulb },
];

export default function FutureAcademyPage() {
  return (
    <>
      <PageHeader
        title="CITIS Future Academy"
        breadcrumbs={[{ label: "CITIS Future Academy" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-5 lg:grid-cols-3">
          {academies.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <Card className="group h-full transition-all hover:border-primary/30">
                  <CardHeader>
                    <span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {item.title}
                      <ArrowRight className="size-4" />
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
