import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, GraduationCap } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import type { GlobalCertification } from "@/lib/global-certifications";

export function GlobalCertificationDetailPage({ certification }: { certification: GlobalCertification }) {
  return (
    <>
      <section className="container-site grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.72fr)_minmax(32rem,1.28fr)] lg:items-center lg:gap-20 lg:py-20">
        <AnimatedSection>
          <Link
            href="/engagements/global-certifications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-[#315d7b]"
          >
            <ArrowLeft className="size-4" />
            All global certifications
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-primary uppercase">
              <BadgeCheck className="size-4" />
              {certification.category}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">{certification.provider}</span>
          </div>
          <h2 className="mt-5 max-w-2xl font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
            Build a credential around skills that matter.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {certification.overview}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent" className="rounded-full">
              <Link href="/contact">
                Talk to our team
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/engagements/global-certifications">Explore all pathways</Link>
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="w-full lg:justify-self-stretch">
          <div className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#b9d8e6] bg-[#edf7f9] p-3 shadow-[0_24px_70px_rgba(15,76,129,0.16)]">
            <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#f9e8a2]/65 blur-3xl" />
            <div className="relative aspect-[1.38] w-full overflow-hidden rounded-[1.25rem] border border-[#8fc1d5] bg-white">
              <Image
                src="/images/global-certification-sample.svg"
                alt={`Sample ${certification.name} certification certificate`}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain"
                priority
              />
              <Image
                src="/images/citis-logo-certificate.png"
                alt=""
                width={707}
                height={121}
                className="absolute left-[7.8%] top-[8.8%] z-10 h-auto w-[25%] object-contain"
                priority
              />
            </div>
            <div className="relative flex items-center justify-between gap-4 px-2 pb-1 pt-4">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Sample credential</p>
                <p className="mt-1 text-sm text-muted-foreground">{certification.name} pathway preview</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#d19a14] shadow-sm">
                <BadgeCheck className="size-5" />
              </span>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-[#f0f7f9] py-16 sm:py-20">
        <div className="container-site">
          <div className="grid gap-5 lg:grid-cols-2">
            <AnimatedSection>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Skills covered</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">Learn by doing</h2>
                  </div>
                </div>
                <ul className="mt-7 space-y-4">
                  {certification.skills.map((skill) => (
                    <li key={skill} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </AnimatedSection>
            <AnimatedSection delay={0.08}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff5cf] text-[#a67d24]">
                    <BadgeCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Benefits</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">Make progress visible</h2>
                  </div>
                </div>
                <ul className="mt-7 space-y-4">
                  {certification.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-20">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-secondary uppercase">Career relevance</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">A next step, not just a badge.</h2>
          </div>
          <div>
            <div className="flex gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-6 sm:p-8">
              <BriefcaseBusiness className="mt-1 size-6 shrink-0 text-primary" />
              <div>
                <p className="text-base leading-8 text-muted-foreground sm:text-lg">{certification.careerRelevance}</p>
                <p className="mt-5 border-t border-primary/15 pt-5 text-sm font-semibold text-primary">
                  Ideal for: <span className="font-normal text-muted-foreground">{certification.suitableFor}</span>
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}