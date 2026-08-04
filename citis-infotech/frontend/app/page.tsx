import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { AmbientBackdrop, EducationNetworkArt, WhyChooseIcon } from "@/components/marketing/HomeVisuals";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ClientLogoCarousel } from "@/components/shared/ClientLogoCarousel";
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
      {/* Full-bleed hero — brand + headline + CTA + dominant image */}
      <section className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden">
        <NextImage
          src="/images/hero-campus.jpg"
          alt="CITIS InfoTech — technology-enabled learning environments"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,18,36,0.88)_0%,rgba(15,76,129,0.72)_48%,rgba(8,18,36,0.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,122,0,0.22),transparent_45%)]" />
        <div className="container-site relative flex min-h-[calc(100vh-var(--header-height))] flex-col justify-end pb-16 pt-24 sm:pb-20 lg:justify-center lg:pb-24">
          <AnimatedSection className="max-w-3xl text-white">
            <p className="mb-5 font-heading text-sm font-semibold tracking-[0.28em] text-orange-300 uppercase sm:text-base">
              {SITE_CONFIG.name}
            </p>
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              {HOME_COPY.excellence.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-blue-50/90 sm:text-lg">
              A leading technology-enabled education company empowering K–12 and Higher Education
              institutions across India.
            </p>
            <div className="mt-9">
              <Button asChild variant="accent" size="lg" className="shadow-lg shadow-orange-500/25">
                <Link href="/future-academy">
                  CITIS Future Academy
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Full wireframe excellence body */}
      <section className="relative overflow-hidden border-b border-border py-16 sm:py-20">
        <AmbientBackdrop tone="light" />
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <AnimatedSection>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">{SITE_CONFIG.name}</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {HOME_COPY.excellence.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-muted-foreground">{HOME_COPY.excellence.body}</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="relative">
            <div className="overflow-hidden rounded-[1.75rem] border border-border shadow-2xl shadow-primary/10">
              <NextImage
                src="/images/beyond-curriculum.jpg"
                alt="Hands-on STEM and digital learning"
                width={960}
                height={720}
                className="h-auto w-full object-cover"
              />
            </div>
            <EducationNetworkArt className="mt-6 opacity-90" />
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border py-20 sm:py-24">
        <AmbientBackdrop tone="light" />
        <div className="container-site grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <AnimatedSection className="relative overflow-hidden rounded-[1.75rem]">
            <NextImage
              src="/images/industry-academia.jpg"
              alt="Educators collaborating in a modern learning space"
              width={1100}
              height={720}
              className="min-h-[22rem] w-full object-cover lg:min-h-[32rem]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81]/70 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 font-heading text-xl font-semibold text-white">
              The Changing Face of Education
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <SectionHeading title={HOME_COPY.changingFace.title} />
            <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground">
              {HOME_COPY.changingFace.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border py-20 sm:py-24">
        <AmbientBackdrop tone="light" />
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <SectionHeading title={HOME_COPY.beyondCurriculum.title} />
            <p className="mt-6 text-base leading-8 text-muted-foreground">{HOME_COPY.beyondCurriculum.body}</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/20 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-xl">
              <NextImage
                src="/images/beyond-curriculum.jpg"
                alt="Learners building practical STEM skills"
                width={960}
                height={720}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-20 text-white sm:py-24">
        <NextImage
          src="/images/industry-academia.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a1a2f_0%,#0F4C81_55%,#163a5f_100%)]/90" />
        <AmbientBackdrop tone="accent" />
        <div className="container-site relative max-w-4xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {HOME_COPY.industryAcademia.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-blue-100">{HOME_COPY.industryAcademia.body}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-24">
        <AmbientBackdrop tone="light" />
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading title="Why Choose Us" />
          </AnimatedSection>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {WHY_CHOOSE_US.map((item, index) => (
              <AnimatedSection key={item.title} delay={Math.min(index * 0.03, 0.3)}>
                <div className="group flex h-full gap-4 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:p-6">
                  <WhyChooseIcon index={index} />
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wider text-accent uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border py-20 sm:py-24">
        <AmbientBackdrop tone="light" />
        <div className="container-site">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <Quote className="mx-auto size-10 text-accent/80" />
            <SectionHeading align="center" title="Testimonials" />
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-12">
            <TestimonialsSlider items={HOME_TESTIMONIALS} />
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20">
        <AmbientBackdrop tone="light" />
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading align="center" title="Key Clientele" />
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-10">
            <div className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
              <ClientLogoCarousel logos={HOME_CLIENTS} />
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
