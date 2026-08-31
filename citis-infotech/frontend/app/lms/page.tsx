import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { LMS_PORTALS, normalizeLmsPortal, type LmsPortal } from "@/lib/lms-roles";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

type LmsEntryPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function LmsEntryPage({ searchParams }: LmsEntryPageProps) {
  const params = await searchParams;
  const portal = normalizeLmsPortal(params?.portal);
  if (portal) await redirectToLmsPortal(portal);

  const icons: Record<LmsPortal, typeof ShieldCheck> = {
    admin: ShieldCheck,
    instructor: BookOpenCheck,
    learner: GraduationCap,
  };

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,#f7fbff_0%,#edf5ff_55%,#fff8e8_100%)] dark:bg-[linear-gradient(145deg,#071526_0%,#10233e_60%,#241b0d_100%)]" />
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">CITIS learning management system</p>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Choose your learning portal</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Select the option that matches your role. Your account permissions are checked securely after sign-in.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
          {(Object.keys(LMS_PORTALS) as LmsPortal[]).map((key) => {
            const portalOption = LMS_PORTALS[key];
            const Icon = icons[key];
            return (
              <article key={key} className="surface group flex min-h-72 flex-col rounded-3xl p-7 transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></span>
                <p className="mt-7 text-xs font-bold tracking-[0.14em] text-primary uppercase">{portalOption.eyebrow}</p>
                <h2 className="mt-3 font-heading text-2xl font-semibold">{portalOption.label}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{portalOption.description}</p>
                <Link href={`/lms/login?portal=${key}`} className="mt-7 inline-flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition group-hover:bg-primary/90">
                  Continue as {key === "admin" ? "administrator" : key}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Not sure which portal to use? Contact your institution or programme team.</p>
      </div>
    </section>
  );
}