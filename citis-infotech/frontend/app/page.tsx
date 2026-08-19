import NextImage from "next/image";
import { Quote } from "lucide-react";
import { HomeHero, PillarMarquee } from "@/components/marketing/HomeHero";
import { AmbientBackdrop, WhyChooseIcon } from "@/components/marketing/HomeVisuals";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ClientLogoCarousel } from "@/components/shared/ClientLogoCarousel";
import { TestimonialsSlider } from "@/components/shared/TestimonialsSlider";
import {
  HOME_CLIENTS,
  HOME_COPY,
  HOME_TESTIMONIALS,
  SITE_CONFIG,
  WHY_CHOOSE_US,
} from "@/lib/constants";

const PILLARS = [
  "Digital-first learning",
  "Industry-integrated curricula",
  "Skills-based education",
  "Experiential learning",
  "Zero-day readiness",
  "NEP-aligned pathways",
];

export default function Home() {
  return (
    <>
      <HomeHero
        title={HOME_COPY.excellence.title}
        support="Empowering K–12 and Higher Education institutions with future-ready, industry-relevant learning."
      />
      <PillarMarquee items={PILLARS} />

      <section className="relative overflow-hidden py-20 sm:py-28">
        <AmbientBackdrop tone="light" />
        <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <AnimatedSection>
            <p className="section-eyebrow">
              <span className="h-px w-8 bg-accent" />
              {SITE_CONFIG.name}
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-5xl">
              Innovation Today, Excellence Tomorrow
            </h2>
            <div className="mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-accent to-primary" />
            <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
              {HOME_COPY.excellence.body}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.12} className="relative">
            <div className="absolute -top-8 -left-8 size-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -right-6 -bottom-10 size-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(15,76,129,0.25)] ring-1 ring-[#0F4C81]/10">
              <NextImage
                src="/images/excellence-innovation-provided.jpg"
                alt="Woman using a laptop"
                width={1100}
                height={780}
                className="aspect-[5/4] w-full object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F4C81] via-[#0F4C81]/55 to-transparent p-6 sm:p-8">
                <p className="font-heading text-xl font-semibold text-white sm:text-2xl">
                  Inspired by excellence
                </p>
                <p className="mt-2 text-sm text-orange-200">Driven by innovation · K–12 & Higher Education</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071221] py-20 text-white sm:py-28">
        <div className="absolute inset-0 opacity-40">
          <NextImage src="/images/industry-academia.jpg" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#071221_10%,rgba(15,76,129,0.82)_55%,rgba(7,18,33,0.95)_100%)]" />
        <div className="container-site relative">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <AnimatedSection>
              <p className="section-eyebrow text-orange-300">
                <span className="h-px w-8 bg-orange-300" />
                Education landscape
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
                {HOME_COPY.changingFace.title}
              </h2>
              <div className="mt-8 space-y-4">
                {["Digital-first classrooms", "Industry-integrated curricula", "Skills & employability"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold backdrop-blur"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1} className="space-y-6 text-base leading-8 text-blue-100 sm:text-lg sm:leading-9">
              {HOME_COPY.changingFace.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-28">
        <AmbientBackdrop tone="light" />
        <div className="container-site">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <AnimatedSection className="order-2 lg:order-1">
              <div className="relative pb-12 sm:pb-16">
                <div className="absolute -inset-3 rotate-2 rounded-[2.2rem] bg-gradient-to-br from-accent/30 to-primary/20" />
                <div className="relative overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(15,76,129,0.18)] ring-1 ring-[#0F4C81]/10">
                  <NextImage
                    src="/images/move-beyond-curriculum.png"
                    alt="Hands-on STEM learning beyond the curriculum"
                    width={1000}
                    height={800}
                    className="aspect-[5/4] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F4C81] via-[#0F4C81]/50 to-transparent p-5 sm:p-7">
                    <p className="font-heading text-lg font-semibold text-white sm:text-xl">
                      Learn beyond the curriculum
                    </p>
                    <p className="mt-1 text-sm text-orange-200">Projects · Skills · Real-world application</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.08} className="order-1 lg:order-2">
              <p className="section-eyebrow">
                <span className="h-px w-8 bg-accent" />
                Beyond textbooks
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
                {HOME_COPY.beyondCurriculum.title}
              </h2>
              <div className="mt-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
              <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
                {HOME_COPY.beyondCurriculum.body}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-20 sm:py-28">
        <NextImage
          src="/images/campus-dusk.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0F4C81]/88 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071221] via-[#0F4C81]/80 to-transparent" />
        <div className="container-site relative max-w-4xl text-white">
          <AnimatedSection>
            <p className="section-eyebrow text-orange-300">
              <span className="h-px w-8 bg-orange-300" />
              Collaboration
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {HOME_COPY.industryAcademia.title}
            </h2>
            <p className="mt-8 text-base leading-8 text-blue-50 sm:text-lg sm:leading-9">
              {HOME_COPY.industryAcademia.body}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-28">
        <AmbientBackdrop tone="light" />
        <div className="container-site">
          <AnimatedSection className="max-w-3xl">
            <p className="section-eyebrow">
              <span className="h-px w-8 bg-accent" />
              Partnership value
            </p>
            <h2 className="mt-5 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Why Choose Us</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fifteen reasons institutions partner with CITIS InfoTech.
            </p>
          </AnimatedSection>
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {WHY_CHOOSE_US.map((item, index) => (
              <AnimatedSection key={item.title} delay={Math.min(index * 0.025, 0.28)}>
                <article className="group relative h-full overflow-hidden rounded-[1.5rem] border border-border/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,76,129,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_50px_rgba(15,76,129,0.14)] dark:bg-card/80 sm:p-7">
                  <div className="absolute -top-10 -right-8 size-28 rounded-full bg-gradient-to-br from-accent/15 to-primary/10 transition group-hover:scale-125" />
                  <div className="relative flex items-start gap-4">
                    <WhyChooseIcon index={index} />
                    <div>
                      <p className="giant-index absolute -top-2 -right-1 select-none">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="relative pr-14 font-heading text-lg font-bold leading-snug">{item.title}</h3>
                      <p className="relative mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#071221] py-20 text-white sm:py-28">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,rgba(255,122,0,0.35),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(37,99,235,0.4),transparent_35%)]" />
        <div className="container-site relative">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <Quote className="mx-auto size-12 text-orange-300/80" />
            <h2 className="mt-5 font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Testimonials</h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="mt-12">
              <TestimonialsSlider items={HOME_TESTIMONIALS} />
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#0F4C81]/10 bg-[#f7fafc] py-16 sm:py-24">
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,122,0,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(15,76,129,0.08),transparent_40%)]" />
        <div className="container-site relative">
          <AnimatedSection className="text-center">
            <p className="section-eyebrow mx-auto justify-center">
              <span className="h-px w-8 bg-accent" />
              Trusted partners
              <span className="h-px w-8 bg-accent" />
            </p>
            <h2 className="mt-5 font-heading text-4xl font-bold tracking-[-0.03em] text-[#0b1524] sm:text-5xl">
              Key Clientele
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-12">
            <ClientLogoCarousel logos={HOME_CLIENTS} />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
