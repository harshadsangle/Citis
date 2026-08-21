import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  HandshakeIcon,
  Layers,
  Lightbulb,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import NextImage from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ─── Benefits to Learners ─────────────────────────────────────────────── */

const learnerBenefits = [
  "Industry-relevant skills",
  "Practical and experiential learning",
  "Exposure to emerging technologies",
  "Industry interaction and projects",
  "Internship and workplace exposure opportunities",
  "Certification pathways",
  "Improved employability and career readiness",
  "Multiple pathways for progression",
  "Opportunities for continuous upskilling and reskilling",
];

/* ─── Program Offerings ─────────────────────────────────────────────────── */

const programs = [
  {
    icon: BookOpen,
    title: "Diploma Programs",
    paragraphs: [
      "Diploma programs provide focused and practical education in specific vocational and professional domains. They are designed to provide learners with foundational knowledge, technical skills and practical exposure relevant to their chosen field.",
      "Programs can incorporate classroom learning, digital learning, practical assignments, projects and industry exposure.",
    ],
  },
  {
    icon: Layers,
    title: "Advanced Diploma Programs",
    paragraphs: [
      "Advanced Diploma programs provide deeper and more specialized learning for learners seeking to develop advanced competencies in a particular domain.",
      "These programs can build upon foundational knowledge and introduce advanced technologies, specialized skills, practical projects and industry-oriented applications.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Degree Programs",
    paragraphs: [
      "CITIS works with academic institutions and partners to enable industry-relevant degree pathways that combine academic education with skills and practical exposure.",
      "Where appropriate, degree programs can incorporate Industry Integrated Learning, Work Integrated Learning, projects, internships, certifications and technology-enabled learning, helping students graduate with both formal qualifications and relevant workplace competencies.",
    ],
  },
  {
    icon: Award,
    title: "Certification Courses",
    paragraphs: [
      "Certification courses provide focused learning opportunities in specific technologies, skills and professional domains.",
      "These programs are suitable for students, professionals, educators and organizations looking for targeted skill development or additional credentials. They can range from foundational digital skills to advanced areas such as Artificial Intelligence, Data Science, Cybersecurity, Cloud Computing, Automation, Digital Technologies and other emerging domains.",
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function VocationalEducationPage() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <AnimatedSection className="container-site max-w-4xl py-16 sm:py-24">
        <SectionHeading title="Vocational Education & Skill Development" />
        <p className="mt-4 text-xl font-semibold text-primary">
          Building Skills. Creating Opportunities. Connecting Education with Industry.
        </p>
        <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
          <p>
            CITIS Infotech believes that education becomes more meaningful when learners can connect knowledge with skills, skills with industry and learning with employment opportunities. Our vocational education and skill development ecosystem is designed to provide learners with practical, industry-relevant and career-oriented learning pathways.
          </p>
          <p>
            Our programs combine academic learning with hands-on training, projects, technology exposure, industry interaction and workplace-oriented experiences. Through our network of academic and industry associations, CITIS works towards creating pathways that enable students and professionals to build relevant skills, earn recognized qualifications and prepare for evolving career opportunities.
          </p>
        </div>
      </AnimatedSection>

      {/* ── Skill Development ─────────────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border">
        <AnimatedSection className="container-site max-w-4xl py-16 sm:py-20">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="size-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Skill Development
              </h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
                <p>
            The nature of work is changing rapidly with the emergence of Artificial Intelligence, automation, digital technologies and new business models. This makes continuous skill development essential for students, working professionals and organizations.
                </p>
                <p>
                  CITIS offers skill development programs across technology, digital, business and emerging technology domains. Programs can be designed for different learner segments and can range from foundational skills to advanced and specialized competencies.
                </p>
                <p>
                  Our approach focuses on learning by doing, combining structured curriculum with practical assignments, projects, simulations, assessments and industry-oriented learning experiences.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Industry Integrated Learning ──────────────────────────────── */}
      <AnimatedSection className="container-site max-w-4xl py-16 sm:py-20">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-6" />
          </div>
          <div className="w-full">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Industry Integrated Learning
            </h2>
            <p className="mt-1 text-lg font-semibold text-primary">
              Bringing Industry Into Education
            </p>
            <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                Industry Integrated Learning bridges the gap between academic education and workplace requirements. CITIS works with educational institutions and industry partners to integrate industry inputs into the learner's academic journey.
              </p>
              <p>
                Programs may include industry-relevant curriculum, technology platforms, guest sessions, practical projects, internships, certifications, industry assessments and career-oriented learning. This creates a more holistic learning experience in which students understand not only what they are learning, but also how and where those skills are applied.
              </p>
            </div>

            {/* Framework flow */}
            <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
              <h3 className="mb-5 font-heading text-base font-bold uppercase tracking-widest text-primary">
                Our Industry Integrated Learning Framework
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                {[
                  "Academic Learning",
                  "Skill Development",
                  "Practical Projects",
                  "Industry Exposure",
                  "Internship",
                  "Certification",
                  "Career Readiness",
                ].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                The objective is to create learners who are better prepared to transition from campus to workplace.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Work Integrated Learning Degrees ──────────────────────────── */}
      <section className="bg-muted/40 border-y border-border">
        <AnimatedSection className="container-site max-w-4xl py-16 sm:py-20">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Work Integrated Learning Degrees
              </h2>
              <p className="mt-1 text-lg font-semibold text-primary">
                Learn While You Work. Earn While You Learn.
              </p>
              <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
                <p>
                  Work Integrated Learning programs are designed to combine formal academic education with practical workplace exposure. They provide learners with the opportunity to develop academic knowledge while gaining experience in real or simulated professional environments.
                </p>
                <p>
                  CITIS works with academic institutions and industry ecosystems to support work-integrated and industry-oriented degree pathways where appropriate.
                </p>
                <p>
                  These programs can combine structured academic learning, practical assignments, industry projects, internships and workplace exposure, helping learners develop both qualifications and employability-oriented competencies.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Vocational Education ──────────────────────────────────────── */}
      <AnimatedSection className="container-site max-w-4xl py-16 sm:py-20">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="size-6" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Vocational Education
            </h2>
            <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                Vocational education provides an alternative and complementary pathway to conventional academic education by focusing strongly on practical skills and occupational competencies.
              </p>
              <p>
                CITIS supports vocational learning across technology, business, digital and emerging skill domains. Programs can be structured for school graduates, higher education students, working professionals and individuals seeking career transitions or additional qualifications.
              </p>
              <p>
                Our objective is to make vocational education aspirational, technology-enabled and connected to industry, while providing learners with opportunities to progress from certificates to advanced qualifications and higher levels of learning.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Program Offering ──────────────────────────────────────────── */}
      <section className="bg-muted/40 border-y border-border">
        <AnimatedSection className="container-site py-16 sm:py-24">
          <SectionHeading
            title="Program Offering"
            className="mb-12"
          />
          <div className="grid gap-8 sm:grid-cols-2">
            {programs.map((prog) => (
              <Card key={prog.title} className="surface border-0 shadow-none">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <prog.icon className="size-5" />
                  </div>
                  <CardTitle className="font-heading text-xl">{prog.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                  {prog.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ── Benefits: Learners & Institutions ─────────────────────────── */}
      <AnimatedSection className="container-site py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2">

          {/* Learners */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Benefits to Learners
              </h2>
            </div>
            <p className="mb-6 text-base leading-8 text-muted-foreground">
              CITIS's vocational and skill development ecosystem aims to provide learners with:
            </p>
            <ul className="space-y-3">
              {learnerBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-base text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-muted-foreground">
              The objective is to create a learning journey where a student can learn, practice, certify, experience and progress.
            </p>
          </div>

          {/* Institutions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Benefits to Institutions
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Educational institutions can leverage CITIS's vocational and industry-integrated ecosystem to expand their academic and skill offerings without limiting themselves to traditional programs.
              </p>
              <p>
                CITIS can support institutions with curriculum, technology, industry integration, faculty enablement, digital learning, assessments, certifications and implementation support.
              </p>
              <p>
                This enables institutions to create stronger connections between academics, skills, industry and employment, while expanding opportunities for their students.
              </p>
            </div>
          </div>

        </div>
      </AnimatedSection>

      {/* ── Associations & Industry Partnerships ──────────────────────── */}
      <section className="bg-muted/40 border-y border-border">
        <AnimatedSection className="container-site max-w-4xl py-16 sm:py-20">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HandshakeIcon className="size-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Associations & Industry Partnerships
              </h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
                <p>
                  Industry and academic collaboration is central to the CITIS model. We work with universities, educational institutions, technology organizations, certification bodies and industry partners to create relevant and scalable learning pathways.
                </p>
                <p>
                  Our association ecosystem can support areas such as curriculum development, technology enablement, certifications, faculty development, internships, industry projects, skill assessments and career-oriented learning.
                </p>
                <p>
                  Through these partnerships, CITIS aims to bring the best of academia, technology and industry together for the benefit of learners and institutions.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── From Learning to Livelihood ───────────────────────────────── */}
      <section className="brand-gradient relative overflow-hidden px-6 py-16 text-white shadow-[0_24px_80px_rgba(15,76,129,.25)] sm:px-12 sm:py-20">
        <div className="container-site relative max-w-4xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-white/15">
            <TrendingUp className="size-7" />
          </div>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            From Learning to Livelihood
          </h2>
          <p className="mt-6 text-base leading-8 text-blue-100/90">
            CITIS's vocational education philosophy is built around a simple principle:
          </p>
          <p className="mt-4 text-lg font-semibold italic text-white/95">
            Education should create capability, capability should create opportunity, and opportunity should create meaningful careers.
          </p>
          <p className="mt-6 text-base leading-8 text-blue-100/90">
            Through Diplomas, Advanced Diplomas, Degrees, Certifications, Industry Integrated Learning and Work Integrated Learning pathways, CITIS aims to create a flexible ecosystem in which learners can continuously learn, earn, upskill and progress.
          </p>
        </div>
      </section>
    </>
  );
}
