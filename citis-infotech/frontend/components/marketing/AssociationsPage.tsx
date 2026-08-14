import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  FlaskConical,
  Globe,
  GraduationCap,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FeatureGrid, OutcomesList } from "@/components/marketing/MarketingBlocks";
import type { MarketingItem } from "@/components/marketing/MarketingBlocks";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const collaborationEcosystem: (MarketingItem & {
  icon: React.ComponentType<{ className?: string }>;
})[] = [
  {
    icon: Globe,
    title: "Global Technology Partners",
    description:
      "We collaborate with leading technology organizations to deliver future-ready programs in Artificial Intelligence, Cloud Computing, Cyber Security, Data Science, Software Development, Productivity Solutions, Digital Creativity, and other emerging technologies.",
  },
  {
    icon: Award,
    title: "International Certification Bodies",
    description:
      "Our programs are mapped to globally recognized certifications, enabling students to validate their skills against international standards and enhance their career opportunities across industries worldwide.",
  },
  {
    icon: GraduationCap,
    title: "Universities and Higher Education Institutions",
    description:
      "We work closely with universities and colleges to design and implement Industry Integrated Learning Programs (IILP), Honours and Minor Degree Programs, Centres of Excellence, Faculty Development Initiatives, and multidisciplinary academic collaborations aligned with NEP 2020.",
  },
  {
    icon: Briefcase,
    title: "Industry Partners",
    description:
      "Our network of industry experts and corporate partners contributes to curriculum design, guest lectures, live projects, internships, mentorship, and placement opportunities, ensuring that students graduate with practical, workplace-ready competencies.",
  },
  {
    icon: Building2,
    title: "Government and Educational Bodies",
    description:
      "We actively engage with educational institutions, government agencies, and sector skill organizations to support national initiatives in skill development, digital education, vocational training, and capacity building.",
  },
  {
    icon: FlaskConical,
    title: "Research and Innovation Partners",
    description:
      "Through collaborations with research organizations, innovation ecosystems, and entrepreneurship networks, we encourage students and faculty to participate in research, innovation, incubation, and technology commercialization initiatives.",
  },
];

const whyMatterItems = [
  "Globally benchmarked academic content",
  "Industry-endorsed curriculum",
  "International certification pathways",
  "Faculty upskilling and professional development",
  "Access to emerging technologies",
  "Experiential learning opportunities",
  "Live industry projects",
  "Internship and placement support",
  "Research and innovation collaborations",
  "Entrepreneurship development",
  "Enhanced institutional reputation",
  "Improved graduate employability",
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function AssociationsPage() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Our Associations"
              title="Collaborating with Global Leaders to Transform Education"
            />
            <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                At CITIS Infotech LLP, we believe that meaningful education transformation is
                achieved through strong collaborations with globally recognized technology companies,
                certification bodies, universities, industry leaders, research organizations, and
                academic institutions.
              </p>
              <p>
                Our strategic associations enable us to provide institutions and learners with
                access to internationally benchmarked curricula, industry-recognized certifications,
                advanced learning technologies, faculty development programs, and real-world
                industry exposure.
              </p>
              <p>
                By combining academic excellence with global expertise, we create learning
                experiences that are relevant, future-focused, and aligned with the evolving demands
                of the digital economy.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Our Collaboration Ecosystem ──────────────────────────────────── */}
      <FeatureGrid
        eyebrow="Our Collaboration Ecosystem"
        title="Our Collaboration Ecosystem"
        items={collaborationEcosystem}
        columns={3}
      />

      {/* ── Why Our Associations Matter ──────────────────────────────────── */}
      <OutcomesList
        eyebrow="Why Our Associations Matter"
        title="Why Our Associations Matter"
        description="Our partnerships provide significant value to institutions and learners by offering:"
        outcomes={whyMatterItems}
      />

      {/* ── Our Technology & Academic Network ────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="Our Technology & Academic Network" />
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS has established associations with leading organizations across education and
              technology to strengthen the learning ecosystem. Our collaborations include globally
              recognized technology companies, professional certification bodies, universities,
              content providers, and innovation partners. These relationships enable us to deliver
              contemporary, industry-relevant education solutions that prepare learners for success
              in a rapidly evolving world.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Association Logos ────────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading title="Association Logos" />
          </AnimatedSection>

          {/* Skill Development and Vocation Education */}
          <AnimatedSection delay={0.08} className="mt-10">
            <p className="mb-6 text-xs font-bold tracking-[0.2em] text-secondary uppercase">
              Skill Development and Vocation Education
            </p>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground"
                >
                  Partner Logo
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Education Consultants and Advisors */}
          <AnimatedSection delay={0.12} className="mt-10">
            <p className="mb-6 text-xs font-bold tracking-[0.2em] text-secondary uppercase">
              Education Consultants and Advisors
            </p>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground"
                >
                  Partner Logo
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
