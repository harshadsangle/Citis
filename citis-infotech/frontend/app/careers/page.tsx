import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JOBS } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Career",
  path: "/careers",
  description: "Find Your opportunity · Our Culture",
});

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career"
        title="Career"
        description="Find Your opportunity · Our Culture"
        breadcrumbs={[{ label: "Career" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Find Your opportunity" />
        </AnimatedSection>
        <div className="mt-10 space-y-4">
          {JOBS.map((job, index) => (
            <AnimatedSection key={job.slug} delay={index * 0.04}>
              <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge>{job.team}</Badge>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                    <h3 className="font-heading text-xl font-semibold">{job.title}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      {job.location} · {job.experience}
                    </p>
                  </div>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary"
                  >
                    View role
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="Our Culture" />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
