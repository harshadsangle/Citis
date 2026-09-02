import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BookOpenCheck, ChevronDown, Clock3, FileText, GraduationCap, Layers3, ShieldCheck } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { LMS_PORTALS, normalizeLmsPortal, type LmsPortal } from "@/lib/lms-roles";
import { LMS_COURSE_CATEGORIES, normalizeLmsCourseProvider, type LmsCourseProvider } from "@/lib/lms-catalog";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

type LmsEntryPageProps = {
  searchParams?: Promise<{ portal?: string; provider?: string }>;
};

const PROVIDER_LOGOS: Record<LmsCourseProvider, { src: string; alt: string; sizes: string }> = {
  adobe: { src: "/images/adobe.png", alt: "Adobe logo", sizes: "120px" },
  comptia: { src: "/images/comptia-authorized-partner.jpg", alt: "CompTIA logo", sizes: "56px" },
  autodesk: { src: "/images/autodesk-logo.svg", alt: "Autodesk logo", sizes: "112px" },
  microsoft: { src: "/images/microsoft.png", alt: "Microsoft logo", sizes: "112px" },
};

function ProviderLogo({ provider }: { provider: LmsCourseProvider }) {
  const logo = PROVIDER_LOGOS[provider];
  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white px-2 shadow-sm ring-1 ring-border/60 sm:size-16">
      <Image src={logo.src} alt={logo.alt} width={128} height={64} sizes={logo.sizes} className="max-h-12 max-w-full w-auto object-contain" />
    </span>
  );
}

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
      <section id="course-catalogue" className="border-t border-border/70 bg-white/55 py-16 dark:bg-slate-950/20 sm:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Course catalogue</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {provider ? `Explore ${courseCategories[0]?.name} certification courses.` : "Explore focused certification paths."}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {provider
              ? courseCategories[0]?.description
              : "Browse objective-led Adobe, Autodesk, CompTIA, and Microsoft Office Specialist certification courses across creative, CAD, architecture, design, content, web, marketing, productivity, IT, cloud, data, project, networking, and cybersecurity paths."}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl space-y-4">
          {courseCategories.map((category) => {
            const providerLogo = normalizeLmsCourseProvider(category.id);
            if (!providerLogo) return null;
            return (
            <details key={category.id} className="lms-category surface overflow-hidden rounded-3xl">
              <summary className="lms-category-summary flex items-center gap-4 p-5 sm:gap-6 sm:p-7">
                <ProviderLogo provider={providerLogo} />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold tracking-[0.16em] text-primary uppercase">{category.eyebrow}</span>
                  <span className="mt-1 block font-heading text-xl font-semibold text-foreground sm:text-2xl">{category.name}</span>
                  <span className="mt-2 hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">{category.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-right text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
                  <span className="hidden sm:block">{category.courses.length} course{category.courses.length === 1 ? "" : "s"}</span>
                  <ChevronDown className="lms-category-chevron size-5 text-primary" />
                </span>
              </summary>

              <div className="border-t border-border/70 bg-[linear-gradient(145deg,rgba(247,251,255,.85),rgba(255,255,255,.95))] p-4 dark:bg-slate-900/30 sm:p-7">
                <div className="grid gap-3">
                  {category.courses.map((course) => (
                    <details key={course.id} className="lms-course-card rounded-2xl border border-border/80 bg-white shadow-sm dark:bg-slate-950/40">
                      <summary className="lms-course-summary flex items-center gap-4 px-4 py-4 sm:px-5">
                        <span className="min-w-0 flex-1 font-heading text-base font-semibold leading-6 text-foreground sm:text-lg">{course.title}</span>
                        <ChevronDown className="lms-course-chevron size-5 shrink-0 text-primary" />
                      </summary>

                      <article className="border-t border-border/70 p-5 sm:p-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-primary uppercase"><FileText className="size-3.5" /> Official exam objectives</span>
                              <span className="inline-flex items-center rounded-full bg-accent/60 px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-accent-foreground uppercase">Featured course</span>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{course.description}</p>
                          </div>
                          <Link href={`/lms/login?portal=learner${providerQuery}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                            Continue to learner portal
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>

                        <div className="mt-6 grid gap-3 border-y border-border/70 py-5 sm:grid-cols-3">
                          {course.details.map((detail, index) => {
                            const Icon = index === 0 ? Clock3 : index === 1 ? Layers3 : Award;
                            return (
                              <div key={detail.label} className="flex items-center gap-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-4" /></span>
                                <span>
                                  <span className="block text-xs font-semibold text-muted-foreground">{detail.label}</span>
                                  <span className="mt-0.5 block text-sm font-semibold text-foreground">{detail.value}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-10">
                          <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Target candidate</p>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{course.audience}</p>
                            <p className="mt-4 text-xs leading-5 text-muted-foreground">Access is provided through your institution or programme team.</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">What the objectives cover</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {course.objectiveAreas.map((area) => (
                                <div key={area.number} className="lms-objective flex gap-3 rounded-xl border border-border/70 bg-background/75 p-3.5">
                                  <span className="text-xs font-bold tracking-[0.08em] text-primary">{area.number}</span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold leading-5 text-foreground">{area.title}</span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{area.description}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    </details>
                  ))}
                </div>
              </div>
            </details>
            );
          })}
        </div>
      </div>
      </section>
    </>
  );
}