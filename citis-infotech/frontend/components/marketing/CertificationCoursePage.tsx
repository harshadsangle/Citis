import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpenCheck, CheckCircle2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LmsCourse } from "@/lib/lms-courses";

export function CertificationCoursePage({ course }: { course: LmsCourse }) {
  return (
    <section className="bg-[#f5f9fc] py-12 sm:py-16">
      <div className="container-site">
        <Link href="/lms/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-[#123d5c]">
          <ArrowLeft className="size-4" />
          All courses
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:items-start lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-primary uppercase">
                <BookOpenCheck className="size-4" />
                Course Information
              </span>
              <span className="text-sm font-semibold text-muted-foreground">{course.category}</span>
            </div>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-tight font-bold tracking-tight text-[#123d5c] text-balance sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{course.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#cfe3ea] bg-white p-5">
                <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Learning level</p>
                <p className="mt-2 font-heading text-lg font-semibold text-[#123d5c]">{course.level}</p>
              </div>
              <div className="rounded-2xl border border-[#cfe3ea] bg-white p-5">
                <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Instructor</p>
                <p className="mt-2 flex items-center gap-2 font-heading text-lg font-semibold text-[#123d5c]">
                  <UserRound className="size-4 text-primary" />
                  {course.instructor}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#cfe3ea] bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-secondary uppercase">What you will learn</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold text-[#123d5c]">Practical outcomes</h2>
                </div>
                <BadgeCheck className="size-6 shrink-0 text-[#d19a14]" />
              </div>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild variant="accent" className="mt-8 rounded-full">
              <Link href={`/lms/courses/${course.slug}`}>
                Continue to learning portal
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#b9d8e6] bg-[#edf7f9] p-3 shadow-[0_24px_70px_rgba(15,76,129,0.14)]">
              <div className="relative aspect-[1.38] overflow-hidden rounded-[1.25rem] border border-[#8fc1d5] bg-white">
                <Image
                  src="/images/global-certification-sample.svg"
                  alt={`Sample certificate for ${course.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="px-2 pb-2 pt-5">
                <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Sample Certificate</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  A preview of the certificate learners can work toward after completing the course pathway.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}