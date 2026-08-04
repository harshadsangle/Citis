import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ClientLogoCarousel } from "@/components/shared/ClientLogoCarousel";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TestimonialsSlider } from "@/components/shared/TestimonialsSlider";
import { Button } from "@/components/ui/button";
import {
  HOME_CLIENTS,
  HOME_COPY,
  HOME_TESTIMONIALS,
  SITE_CONFIG,
  WHY_CHOOSE_US,
} from "@/lib/constants";

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#e8f1fa_45%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#10233e_55%,#0f172a_100%)]" />
        <div className="absolute top-[-12rem] right-[-6rem] -z-10 size-[36rem] rounded-full bg-[#0F4C81]/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] -z-10 size-[28rem] rounded-full bg-[#FF7A00]/10 blur-3xl" />
        <div className="container-site grid min-h-[calc(100vh-var(--header-height))] items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <AnimatedSection>
            <p className="mb-5 font-heading text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              {SITE_CONFIG.name}
            </p>
            <h1 className="max-w-4xl font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
              {HOME_COPY.excellence.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {HOME_COPY.excellence.body}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href="/future-academy">
                  CITIS Future Academy
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="relative hidden lg:block">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#0F4C81_0%,#1e3a5f_45%,#0f172a_100%)] p-8 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,122,0,.45),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(37,99,235,.5),transparent_40%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="font-heading text-lg font-semibold tracking-wide">{SITE_CONFIG.name}</span>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-blue-100 uppercase">
                    {SITE_CONFIG.tagline}
                  </p>
                  <p className="mt-4 font-heading text-3xl leading-tight font-semibold">
                    Technology-enabled education for K–12 and Higher Education.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["K–12", "Higher Education"].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-4 text-center text-xs font-semibold"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-20 dark:bg-slate-900/50 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading
              align="center"
              eyebrow="Education landscape"
              title={HOME_COPY.changingFace.title}
            />
            <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground">
              {HOME_COPY.changingFace.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <SectionHeading eyebrow="Learning beyond textbooks" title={HOME_COPY.beyondCurriculum.title} />
            <p className="mt-6 text-base leading-8 text-muted-foreground">{HOME_COPY.beyondCurriculum.body}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-[linear-gradient(145deg,#0F4C81_0%,#163a5f_100%)] py-20 text-white sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="text-xs font-bold tracking-[0.18em] text-orange-300 uppercase">Collaboration</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              {HOME_COPY.industryAcademia.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-blue-100">{HOME_COPY.industryAcademia.body}</p>
            <Button asChild variant="accent" className="mt-8">
              <Link href="/engagements/university">
                University Solutions
                <ArrowRight />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Why institutions choose CITIS InfoTech"
          />
        </AnimatedSection>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {WHY_CHOOSE_US.map((item, index) => (
            <AnimatedSection key={item.title} delay={Math.min(index * 0.03, 0.3)}>
              <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-slate-50 py-20 dark:bg-slate-950/30 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading align="center" eyebrow="Testimonials" title="What partners say" />
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-12">
            <TestimonialsSlider items={HOME_TESTIMONIALS} />
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-20">
        <AnimatedSection>
          <SectionHeading align="center" eyebrow="Key Clientele" title="Institutions and organizations we work with" />
        </AnimatedSection>
        <AnimatedSection delay={0.08} className="mt-10">
          <ClientLogoCarousel logos={HOME_CLIENTS} />
        </AnimatedSection>
      </section>

      <CTASection
        eyebrow="Get in touch"
        title="Write to us"
        description={`${SITE_CONFIG.email} · Helpline: ${SITE_CONFIG.phone}`}
        primaryHref="/contact"
        primaryLabel="Contact us"
        secondaryHref="/future-academy"
        secondaryLabel="CITIS Future Academy"
      />
    </>
  );
}
