import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

const portalLinks = [
  {
    icon: GraduationCap,
    title: "Learner portal",
    copy: "Continue your learning experience and access future CITIS programmes, resources, and credentials.",
    href: "/lms/login?portal=learner",
  },
  {
    icon: UsersRound,
    title: "Institution portal",
    copy: "Manage institution access, campuses, users, roles, and learning enablement from one foundation.",
    href: "/lms/login?portal=institution",
  },
];

export default function LmsEntryPage() {
  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-8" aria-hidden="true" />
          </div>
          <p className="mt-7 text-xs font-bold tracking-[0.2em] text-primary uppercase">CITIS Skills Excellence Centre</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Your learning portal starts here.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Enter the new CITIS Education Platform foundation built for learners, educators, and institutions.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {portalLinks.map(({ icon: Icon, title, copy, href }) => (
            <article key={title} className="surface rounded-3xl p-7 shadow-sm sm:p-9">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-semibold">{title}</h2>
              <p className="mt-3 min-h-14 text-sm leading-6 text-muted-foreground">{copy}</p>
              <Button asChild variant="accent" className="mt-7 rounded-full">
                <Link href={href}>Continue to portal <ArrowRight /></Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-sm leading-6 text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p>Access is protected by CITIS identity and institution-level permissions. Contact your programme team if you need an account.</p>
        </div>
      </div>
    </main>
  );
}