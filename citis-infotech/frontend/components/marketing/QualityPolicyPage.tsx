import {
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  Monitor,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import NextImage from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const commitments: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    description:
      "We develop academically rigorous, industry-aligned programs that combine theoretical knowledge with practical application, ensuring students are prepared for higher education, employment, entrepreneurship, and lifelong learning.",
  },
  {
    icon: Users,
    title: "Customer-Centric Approach",
    description:
      "We work closely with our partner institutions to understand their objectives and deliver customized, scalable, and sustainable solutions that address their unique academic and institutional needs.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Innovation",
    description:
      "We continuously enhance our curriculum, learning methodologies, digital platforms, and educational technologies to remain at the forefront of educational innovation.",
  },
  {
    icon: Briefcase,
    title: "Industry Relevance",
    description:
      "Our programs are designed in collaboration with industry experts, technology leaders, and academic professionals to ensure relevance in a rapidly evolving global economy.",
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description:
      "We ensure that our academic engagements are aligned with applicable educational frameworks, institutional guidelines, and recognized standards while supporting institutions in implementing progressive education practices.",
  },
  {
    icon: Monitor,
    title: "Technology Excellence",
    description:
      "We leverage Artificial Intelligence, Learning Management Systems (LMS), Virtual Labs, Digital Learning Platforms, Learning Analytics, and emerging technologies to create engaging and outcome-driven learning experiences.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description:
      "We regularly review our processes, gather stakeholder feedback, measure learning outcomes, and implement improvements that enhance institutional effectiveness and learner success.",
  },
  {
    icon: Award,
    title: "Ethical Business Practices",
    description:
      "We conduct our business with transparency, accountability, professionalism, confidentiality, and respect for all stakeholders while maintaining the highest standards of governance and corporate ethics.",
  },
  {
    icon: Heart,
    title: "People Development",
    description:
      "We invest in the continuous development of our employees, faculty, trainers, consultants, and partners, recognizing that empowered professionals create exceptional learning experiences.",
  },
  {
    icon: Globe,
    title: "Sustainable Impact",
    description:
      "Our objective is not merely to deliver programs but to create long-term educational transformation that improves institutional performance, student employability, faculty capabilities, and societal development.",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function QualityPolicyPage() {
  return (
    <>
      {/* ── Quality Policy intro ─────────────────────────────────────────── */}
      <section className="bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Quality Policy"
              title="Delivering Excellence Through Quality, Innovation and Continuous Improvement"
            />
            <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                At CITIS Infotech LLP, quality is the cornerstone of everything we do. We are
                committed to delivering world-class education solutions that create measurable value
                for educational institutions, educators, learners, industry partners, and society.
              </p>
              <p>
                Our quality philosophy is built on the belief that education should continuously
                evolve to meet the changing needs of the global workforce. Every solution we design,
                every program we deliver, and every partnership we establish reflects our unwavering
                commitment to academic excellence, innovation, integrity, and learner success.
              </p>
              <p>
                We strive to provide education transformation solutions that are aligned with
                national education policies, global best practices, and emerging industry
                requirements while ensuring consistent quality across every stage of planning,
                implementation, delivery, assessment, and continuous improvement.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-[0_18px_60px_rgba(15,76,129,0.12)] sm:p-5">
              <NextImage
                src="/images/quality-policy-certificate.png"
                alt="CITIS Infotech ISO 9001:2015 quality management system certificate"
                width={1837}
                height={3028}
                sizes="(max-width: 1024px) 100vw, 960px"
                className="mx-auto h-auto w-full max-w-3xl rounded-2xl"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Our Quality Commitments ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading title="Our Quality Commitments" />
          </AnimatedSection>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {commitments.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={index * 0.06}>
                  <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardHeader>
                      <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="leading-7">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Quality Promise ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#e8f4f8] py-16 dark:bg-slate-900 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionHeading title="Our Quality Promise" />
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              At CITIS Infotech LLP, quality is not an activity—it is a culture embedded across
              every engagement. Through innovation, collaboration, and an unwavering commitment to
              excellence, we aspire to become the most trusted education transformation partner for
              institutions across India and beyond.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
