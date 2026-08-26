import { Award, BadgeCheck, BookOpenCheck, FileCheck2 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";

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