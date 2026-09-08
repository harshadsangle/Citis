import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { LMS_PORTALS, normalizeLmsPortal, type LmsPortal } from "@/lib/lms-roles";
import { LMS_COURSE_CATEGORIES, normalizeLmsCourseProvider } from "@/lib/lms-catalog";
import { ProfessionalProgramsCatalogue } from "@/components/marketing/ProfessionalProgramsCatalogue";
import { LmsCourseCatalogue } from "@/components/marketing/LmsCourseCatalogue";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

type LmsEntryPageProps = {
  searchParams?: Promise<{ portal?: string; provider?: string }>;
};

export default async function LmsEntryPage({ searchParams }: LmsEntryPageProps) {
  const params = await searchParams;
  const provider = normalizeLmsCourseProvider(params?.provider);
  const portal = normalizeLmsPortal(params?.portal);
  if (portal) await redirectToLmsPortal(portal, provider);
  const providerQuery = provider ? `&provider=${provider}` : "";
  const courseCategories = provider
    ? LMS_COURSE_CATEGORIES.filter((category) => category.id === provider)
    : LMS_COURSE_CATEGORIES;

  const icons: Record<LmsPortal, typeof ShieldCheck> = {
    admin: ShieldCheck,
    instructor: BookOpenCheck,
    learner: GraduationCap,
  };

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-primary/10 py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_14%,rgba(92,166,177,.18),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(239,125,60,.13),transparent_26%),linear-gradient(145deg,#f7fbfd_0%,#edf5f8_55%,#fff7ed_100%)] dark:bg-[linear-gradient(145deg,#071526_0%,#10233e_60%,#241b0d_100%)]" />
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-eyebrow"><span className="h-px w-8 bg-accent" />CITIS learning management system</p>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">Learning with a clear next step.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Select the option that matches your role. Your account permissions are checked securely after sign-in.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {(Object.keys(LMS_PORTALS) as LmsPortal[]).map((key) => {
            const portalOption = LMS_PORTALS[key];
            const Icon = icons[key];
            return (
              <article key={key} className="surface group relative flex min-h-72 flex-col overflow-hidden rounded-[1.6rem] p-7 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                <span className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/10" aria-hidden="true" />
                <span className="relative grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(18,75,115,.2)]"><Icon className="size-6" /></span>
                <p className="mt-7 text-xs font-bold tracking-[0.14em] text-primary uppercase">{portalOption.eyebrow}</p>
                <h2 className="mt-3 font-heading text-2xl font-semibold">{portalOption.label}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{portalOption.description}</p>
                <Link href={`/lms/login?portal=${key}${providerQuery}`} className="mt-7 inline-flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition group-hover:bg-primary/90">
                  Continue as {key === "admin" ? "administrator" : key}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Not sure which portal to use? Contact your institution or programme team.</p>
        <p className="mt-4 text-center text-sm"><Link href="/certificate-verification" className="font-semibold text-primary hover:underline">Verify a CITIS certificate →</Link></p>
      </div>
      </section>
      <LmsCourseCatalogue categories={courseCategories} provider={provider} />
      <ProfessionalProgramsCatalogue compact />
    </>
  );
}