import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Vision and Mission",
  path: "/about/vision-mission",
  description:
    "To become the world's most trusted education transformation company by enabling institutions to deliver innovative, technology-enabled, industry-driven, and learner-centric education.",
});

const missionItems = [
  "Industry-integrated academic programs",
  "Artificial Intelligence-enabled learning ecosystems",
  "Future skills education",
  "Academic innovation",
  "Faculty empowerment",
  "Global certifications",
  "Research and innovation",
  "Digital transformation",
  "Entrepreneurship development",
  "Career readiness",
  "Institutional consulting",
];

export default function VisionMissionPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Vision and Mission"
        description="Our vision, mission, and philosophy"
        breadcrumbs={[
          { label: "About Us", href: "/about" },
          { label: "Vision and Mission" },
        ]}
        tone="about"
      />

      {/* ── OUR VISION ────────────────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading eyebrow="Vision and Mission" title="OUR VISION" />
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              To become the world&rsquo;s most trusted education transformation company by enabling
              institutions to deliver innovative, technology-enabled, industry-driven, and
              learner-centric education that empowers every student to succeed in the global
              knowledge economy.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── OUR MISSION ───────────────────────────────────────────────────── */}
      <section className="border-y border-border py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="OUR MISSION" />
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              Our mission is to transform educational institutions through:
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {missionItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-base leading-7">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg">
              We strive to create measurable impact for institutions while helping students become
              confident, competent, ethical, and future-ready professionals.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="OUR PHILOSOPHY" />
            <p className="mt-6 font-heading text-2xl font-semibold text-foreground">
              Education Should Never Stand Still.
            </p>
            <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                The pace of technological advancement continues to reshape every industry.
                Educational institutions must therefore evolve faster than ever before.
              </p>
              <p>
                At CITIS, innovation is not viewed as an isolated initiative—it is embedded into
                every curriculum, classroom, faculty development program, and institutional
                engagement.
              </p>
              <p>
                We believe the future belongs to institutions that continuously adapt, collaborate,
                and innovate.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
