import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Handshake,
  Lightbulb,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FeatureGrid } from "@/components/marketing/MarketingBlocks";
import type { MarketingItem } from "@/components/marketing/MarketingBlocks";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const integratedApproach = [
  "Curriculum Design",
  "Academic Consulting",
  "Industry Collaboration",
  "Learning Technology",
  "Faculty Development",
  "Assessments",
  "Digital Learning Platforms",
  "Research Support",
  "Innovation Labs",
  "Entrepreneurship Programs",
  "Global Certifications",
  "Placement Enablement",
  "Continuous Quality Improvement",
];

const values: (MarketingItem & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    icon: Star,
    title: "Excellence",
    description:
      "We pursue excellence in every academic engagement, solution, and learner experience.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We embrace emerging technologies and forward-thinking educational practices to create meaningful transformation.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "We conduct every engagement with transparency, accountability, and professionalism.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    description:
      "We believe lasting educational impact is achieved through partnerships among institutions, industry, educators, and learners.",
  },
  {
    icon: Users,
    title: "Learner-Centricity",
    description:
      "Every solution is ultimately designed to improve student learning, employability, and lifelong success.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description:
      "We continually refine our programs, methodologies, and technologies to keep pace with changing educational and industry needs.",
  },
];

const approachSteps = [
  {
    title: "Discover",
    description: "Understand institutional objectives, strengths, and challenges.",
  },
  {
    title: "Design",
    description: "Develop customized academic and technology solutions.",
  },
  {
    title: "Deploy",
    description: "Implement programs through structured project management and faculty support.",
  },
  {
    title: "Enable",
    description: "Train educators, engage learners, and integrate digital tools.",
  },
  {
    title: "Measure",
    description: "Evaluate learning outcomes, institutional performance, and placement success.",
  },
  {
    title: "Improve",
    description:
      "Continuously optimize programs based on data, feedback, and evolving industry requirements.",
  },
];

const subPageLinks = [
  { title: "Vision and Mission", href: "/about/vision-mission" },
  { title: "Quality Policy", href: "/about/quality-policy" },
  { title: "Our Associations", href: "/about/associations" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function AboutPage() {
  return (
    <>
      {/* ── Hero intro ────────────────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="text-xl font-medium leading-8 text-foreground sm:text-2xl">
              CITIS Infotech LLP is India&rsquo;s leading Education Transformation Company,
              partnering with Schools, Colleges, Universities, Governments, and Enterprises to
              build innovative, technology-enabled, and industry-integrated learning ecosystems
              that prepare learners for the future.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">
                  Partner With CITIS
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  href={`mailto:support@citis.in?subject=${encodeURIComponent("Corporate Profile Request")}&body=${encodeURIComponent("Please send me the CITIS Corporate Profile.")}`}
                >
                  <Download className="size-4" />
                  Download Corporate Profile
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          {/* Five body paragraphs */}
          <AnimatedSection delay={0.1} className="mt-12 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              Education is undergoing one of the most significant transformations in history.
              Artificial Intelligence, Industry 5.0, automation, data-driven decision-making, and
              changing workforce expectations are redefining what students need to learn and how
              institutions must prepare them. Traditional education models alone are no longer
              sufficient. Institutions today are expected to produce graduates who possess technical
              expertise, critical thinking, creativity, innovation, entrepreneurial capabilities, and
              workplace readiness.
            </p>
            <p>
              At CITIS Infotech LLP, we believe that education must evolve continuously to remain
              relevant. Our mission is to help educational institutions transform into future-ready
              centres of excellence by integrating academic innovation, industry collaboration,
              digital technologies, and experiential learning.
            </p>
            <p>
              For over a decade, we have worked alongside universities, engineering colleges,
              schools, vocational institutions, government bodies, and corporate organizations to
              design and implement comprehensive education solutions that improve learning outcomes,
              institutional reputation, student employability, and academic excellence.
            </p>
            <p>
              Our approach extends far beyond delivering courses. We collaborate closely with
              institutions to develop sustainable education ecosystems that combine curriculum
              innovation, faculty development, digital infrastructure, industry partnerships, global
              certifications, internships, research, entrepreneurship, and placement support into one
              integrated framework.
            </p>
            <p>
              By bridging the gap between academia and industry, we help institutions deliver
              education that is relevant, measurable, and aligned with the future of work.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── WHO WE ARE ───────────────────────────────────────────────────── */}
      <section className="border-y border-border py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="WHO WE ARE" />
            <div className="mt-7 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                CITIS Infotech LLP is a multidisciplinary education transformation organization
                specializing in academic consulting, technology integration, skill development, and
                institutional capacity building.
              </p>
              <p>
                Our expertise spans the entire education value chain—from K&ndash;12 education and
                higher education to vocational training, corporate learning, professional
                certifications, and lifelong learning.
              </p>
              <p>
                We work with educational institutions to implement scalable, future-focused academic
                models that create measurable improvements in teaching quality, student engagement,
                employability, and institutional growth.
              </p>
              <p>
                Our solutions are aligned with national priorities such as the National Education
                Policy (NEP 2020), multidisciplinary education, outcome-based learning, digital
                transformation, and industry-academia collaboration, complementing the direction
                outlined in your website framework and collaboration proposals.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── OUR PURPOSE ──────────────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-secondary uppercase">
              OUR PURPOSE
            </p>
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
              Building Better Institutions.
              <br />
              Empowering Better Learners.
            </h2>
            <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                Our purpose is to create educational ecosystems where every learner has access to
                world-class education, practical experience, emerging technologies, global
                certifications, and meaningful career opportunities.
              </p>
              <p>
                We believe education should not merely prepare students for examinations—it should
                prepare them to solve real-world problems, lead innovation, create enterprises, and
                contribute meaningfully to society.
              </p>
              <p>Every solution developed by CITIS is therefore designed around one simple objective:</p>
              <p className="font-heading text-2xl font-semibold text-foreground">
                Transform learning into lifelong success.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Sub-page navigation cards ────────────────────────────────────── */}
      <section className="border-y border-border py-12">
        <div className="container-site">
          <AnimatedSection>
            <div className="grid gap-4 sm:grid-cols-3">
              {subPageLinks.map((item, index) => (
                <AnimatedSection key={item.href} delay={index * 0.06}>
                  <Link href={item.href} className="block h-full">
                    <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          View
                          <ArrowRight className="size-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <AnimatedSection>
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-secondary uppercase">
                WHAT MAKES US DIFFERENT
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                We Don&rsquo;t Sell Courses.
                <br />
                We Build Academic Ecosystems.
              </h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                Unlike conventional training organizations, CITIS partners with institutions to
                design and implement complete education transformation strategies.
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">
                This comprehensive model creates sustainable academic excellence instead of isolated
                training interventions.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="mb-5 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                Our integrated approach includes:
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {integratedApproach.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-6">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ───────────────────────────────────────────────────── */}
      <FeatureGrid
        eyebrow="OUR VALUES"
        title="OUR VALUES"
        items={values}
        columns={3}
      />

      {/* ── OUR APPROACH ─────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading align="center" title="OUR APPROACH" />
          </AnimatedSection>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {approachSteps.map((step, index) => (
              <AnimatedSection key={step.title} delay={index * 0.07}>
                <div className="relative rounded-xl border border-border bg-card p-7 shadow-sm h-full">
                  <span className="mb-5 grid size-10 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground ring-8 ring-background">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
