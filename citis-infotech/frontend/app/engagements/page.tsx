import Link from "next/link";
import { ArrowRight, Award, BadgeCheck, BriefcaseBusiness, GraduationCap, School, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Engagements",
  path: "/engagements",
  description: "University Solutions, School Solutions, Vocational Education, Centre of Excellence, Placements and Internships.",
});

const engagements = [
  { icon: GraduationCap, title: "University Solutions", href: "/engagements/university" },
  { icon: School, title: "School Solutions", href: "/engagements/school" },
  { icon: Wrench, title: "Vocational Education", href: "/engagements/vocational" },
  { icon: Award, title: "Centre of Excellence", href: "/engagements/centre-of-excellence" },
  { icon: BriefcaseBusiness, title: "Placements and Internships", href: "/engagements/placements" },
  { icon: BadgeCheck, title: "Global Certifications", href: "/engagements/global-certifications" },
];

export default function EngagementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engagements"
        title="Engagements"
        description="University Solutions · School Solutions · Vocational Education · Centre of Excellence · Placements and Internships"
        breadcrumbs={[{ label: "Engagements" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Engagements" />
        </AnimatedSection>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engagements.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
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
