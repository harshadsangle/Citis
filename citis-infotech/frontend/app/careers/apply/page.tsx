import Link from "next/link";
import { JobApplicationForm } from "@/components/marketing/InteractiveForms";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Apply for a Career at CITIS",
  path: "/careers/apply",
  description: "Submit your application for a career opportunity at CITIS InfoTech.",
});

export default async function CareerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const jobTitle = role || "CITIS career opportunity";

  return (
    <main className="container-site max-w-3xl py-16 sm:py-24">
      <AnimatedSection>
        <Link href="/careers" className="text-sm font-semibold text-primary hover:underline">
          ← Back to Career Opportunities
        </Link>
        <div className="mt-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-primary">Career application</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Apply for {jobTitle}</h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Complete the form below. Your application will be prepared for the CITIS careers team at careers@citis.in.
          </p>
        </div>
        <div className="mt-10">
          <JobApplicationForm jobId={jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")} jobTitle={jobTitle} />
        </div>
      </AnimatedSection>
    </main>
  );
}