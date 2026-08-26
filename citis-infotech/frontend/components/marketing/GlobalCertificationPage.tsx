import Link from "next/link";
import { ArrowRight, Award, BadgeCheck, BookOpenCheck, FileCheck2 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GLOBAL_CERTIFICATIONS } from "@/lib/global-certifications";

const certificationHighlights = [
  {
    icon: FileCheck2,
    title: "Sample Certificate",
    description:
      "Learners can earn a verifiable certificate through EtrainIndia after completing the applicable learning and assessment requirements.",
  },
  {
    icon: BookOpenCheck,
    title: "Certification Tracks",
    description:
      "Adobe, Autodesk, Cisco, Entrepreneurship, IC3, IT Specialist, Intuit, Meta, Microsoft, PMI and Unity.",
  },
  {
    icon: Award,
    title: "Industry-Recognized Certifications",
    description:
      "EtrainIndia connects learners with certification pathways aligned to leading technology, business and professional skills.",
  },
  {
    icon: BadgeCheck,
    title: "Digital Badge",
    description:
      "Eligible learners can receive a digital badge to showcase verified skills and achievements across professional platforms.",
  },
];

function CertificatePreview() {
  return (
    <AnimatedSection className="mt-12">
      <div className="mb-6">
        <SectionHeading eyebrow="Sample Certificate" title="A Digital Credential Built for Progress" />
      </div>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#b9d8e6] bg-[#f8fcfd] p-2 shadow-[0_24px_70px_rgba(15,76,129,0.16)]">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[#8fc1d5] bg-white px-6 py-8 sm:px-12 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#e8f4f8] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-[#fff4c7] blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 border-b border-[#d5e8ee] pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0f4c81]">
                  EtrainIndia
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6a8797]">
                  Professional Certification Network
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-[#e2ad23] text-[#d19a14]">
                <Award className="size-6" />
              </div>
            </div>

            <div className="py-8 text-center sm:py-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#d19a14]">
                Sample Certificate
              </p>
              <h3 className="mt-3 font-heading text-2xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">
                Certificate of Achievement
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5d7482]">
                This certificate is presented to
              </p>
              <p className="mt-4 font-heading text-2xl font-semibold text-[#0f4c81] sm:text-3xl">
                Alex Morgan
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#78909c]">
                Learner Name Placeholder
              </p>
              <div className="mx-auto mt-6 h-px max-w-md bg-gradient-to-r from-transparent via-[#8fc1d5] to-transparent" />
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#6a8797]">
                Has successfully completed
              </p>
              <p className="mt-2 font-heading text-xl font-bold text-[#123d5c] sm:text-2xl">
                Entrepreneurship &amp; Innovation
              </p>
              <p className="mt-2 text-sm text-[#5d7482]">Industry Certification Track</p>
            </div>

            <div className="flex flex-col gap-8 border-t border-[#d5e8ee] pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left text-xs text-[#5d7482]">
                <div>
                  <p className="font-semibold uppercase tracking-wider text-[#78909c]">Issued by</p>
                  <p className="mt-1 font-semibold text-[#123d5c]">EtrainIndia</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-[#78909c]">Date</p>
                  <p className="mt-1 font-semibold text-[#123d5c]">21 August 2026</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-[#78909c]">Certificate ID</p>
                  <p className="mt-1 font-semibold text-[#123d5c]">ETRAIN-2026-000184</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-[#78909c]">Signature</p>
                  <p className="mt-1 font-serif text-base italic text-[#0f4c81]">Dr. Ananya Rao</p>
                  <p className="text-[10px] text-[#78909c]">Program Director</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start rounded-xl border border-[#d5e8ee] bg-[#f4fafc] p-3 sm:self-auto">
                <div className="grid size-16 grid-cols-7 gap-0.5 bg-white p-1" aria-label="Sample verification QR code">
                  {Array.from({ length: 49 }, (_, index) => {
                    const filled =
                      (index * 17 + index * index * 3) % 11 < 5 ||
                      [0, 1, 2, 7, 14, 21, 42, 43, 44, 45, 46, 47, 48].includes(index);
                    return <span key={index} className={filled ? "bg-[#123d5c]" : "bg-transparent"} />;
                  })}
                </div>
                <div className="text-[10px] leading-4 text-[#5d7482]">
                  <p className="font-bold uppercase tracking-wider text-[#0f4c81]">Verify</p>
                  <p>Scan to validate</p>
                  <p>credential details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

export function GlobalCertificationPage() {
  return (
    <section className="container-site py-16 sm:py-24">
      <AnimatedSection className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Global Certification"
          title="Industry-Recognized Certification Pathways"
        />
        <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
          EtrainIndia supports learners with professional certification pathways that validate
          practical skills, strengthen career portfolios and provide globally relevant credentials.
        </p>
      </AnimatedSection>

      <CertificatePreview />

      <AnimatedSection className="mt-16 sm:mt-20">
        <SectionHeading
          eyebrow="Choose your pathway"
          title="Global certifications for different kinds of ambition"
          description="Explore a focused pathway and see how its skills connect to further study, portfolios and career opportunities."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GLOBAL_CERTIFICATIONS.map((certification, index) => (
            <AnimatedSection key={certification.slug} delay={index * 0.03}>
              <Link
                href={`/engagements/global-certifications/${certification.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(15,76,129,0.12)]"
              >
                <span className="text-[11px] font-bold tracking-[0.16em] text-secondary uppercase">{certification.category}</span>
                <h2 className="mt-3 font-heading text-lg font-semibold">{certification.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{certification.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  View pathway
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </AnimatedSection>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {certificationHighlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <AnimatedSection key={item.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="font-heading text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </article>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}