import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ClientLogoCarousel } from "@/components/shared/ClientLogoCarousel";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TestimonialsSlider } from "@/components/shared/TestimonialsSlider";
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
        <div className="container-site py-20 sm:py-28">
          <AnimatedSection className="mx-auto max-w-4xl text-center">
            <p className="mb-5 font-heading text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              {SITE_CONFIG.name}
            </p>
            <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
              {HOME_COPY.excellence.title}
            </h1>
            <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg">
              {HOME_COPY.excellence.body}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-20 dark:bg-slate-900/50 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading align="center" title={HOME_COPY.changingFace.title} />
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
            <SectionHeading title={HOME_COPY.beyondCurriculum.title} />
            <p className="mt-6 text-base leading-8 text-muted-foreground">{HOME_COPY.beyondCurriculum.body}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-[linear-gradient(145deg,#0F4C81_0%,#163a5f_100%)] py-20 text-white sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              {HOME_COPY.industryAcademia.title}
            </h2>
            <p className="mt-6 text-base leading-8 text-blue-100">{HOME_COPY.industryAcademia.body}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Why Choose Us" />
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
            <SectionHeading align="center" title="Testimonials" />
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-12">
            <TestimonialsSlider items={HOME_TESTIMONIALS} />
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-20">
        <AnimatedSection>
          <SectionHeading align="center" title="Key Clientele" />
        </AnimatedSection>
        <AnimatedSection delay={0.08} className="mt-10">
          <ClientLogoCarousel logos={HOME_CLIENTS} />
        </AnimatedSection>
      </section>
    </>
  );
}
