import {
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  FlaskConical,
  GraduationCap,
  HandshakeIcon,
  Heart,
  LayoutDashboard,
  Layers,
  Lightbulb,
  Monitor,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OutcomesList } from "@/components/marketing/MarketingBlocks";

/* ─── Data ──────────────────────────────────────────────────────────────── */

type Solution = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  paragraphs: string[];
};

const tomorrowsSolutions: Solution[] = [
  {
    icon: Brain,
    title: "CITIS AI Academy",
    paragraphs: [
      "Artificial Intelligence will increasingly influence how students learn, work and create. The CITIS AI Academy introduces students to AI concepts and applications through age-appropriate, structured and practical learning experiences.",
      "The Academy can be implemented across school grades and can include AI literacy, Generative AI awareness, responsible AI, problem-solving, projects and innovation. The objective is to help students become not merely users of AI, but confident, creative and responsible participants in the AI-enabled world.",
    ],
  },
  {
    icon: Zap,
    title: "Future Skills",
    paragraphs: [
      "Tomorrow's learners will require a combination of technology skills and human capabilities. CITIS integrates computational thinking, creativity, communication, collaboration, critical thinking, problem-solving and digital literacy into its future-skills approach.",
      "Schools can progressively build these capabilities through classroom activities, coding, projects, technology labs, AI learning and experiential learning initiatives.",
    ],
  },
];

const ictSolutions: Solution[] = [
  {
    icon: LayoutDashboard,
    title: "Digital Learning Ecosystem",
    paragraphs: [
      "CITIS can support schools in developing a connected digital learning environment through digital content, learning platforms, AI-enabled learning resources, interactive tools and virtual learning experiences.",
      "The ecosystem can support both teachers and students and enable learning to extend beyond the traditional classroom.",
    ],
  },
  {
    icon: Code2,
    title: "Coding & Computational Thinking",
    paragraphs: [
      "Coding is increasingly becoming a fundamental digital literacy. Through CODMOS, CITIS can introduce students to coding, computational thinking and technology creation through engaging and age-appropriate learning experiences.",
      "The focus is not simply on learning programming languages. Students learn to break down problems, develop logical thinking, create solutions and build projects—helping them transition from technology consumers to technology creators.",
    ],
  },
];

const stemSolutions: Solution[] = [
  {
    icon: FlaskConical,
    title: "Virtual Science Labs",
    paragraphs: [
      "The CITIS Science Lab solution provides students with access to interactive and technology-enabled science learning experiences. Virtual laboratories can complement physical laboratories by allowing students to explore scientific concepts, conduct simulations and repeat experiments in a safe and accessible environment.",
      "This enables schools to extend practical science learning across classrooms and learner groups while providing students with greater opportunities for exploration and experimentation.",
    ],
  },
  {
    icon: Code2,
    title: "CODMOS – Coding & Digital Making",
    paragraphs: [
      "CODMOS complements STEM education by introducing students to coding, computational thinking and digital creation. Students can progress from understanding basic logic and computational concepts to building projects and exploring technology creatively.",
      "The solution can be integrated into the school curriculum as a structured program or as part of a broader STEM, coding and innovation ecosystem.",
    ],
  },
];

const benefits: {
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  title: string;
  description: string;
}[] = [
  {
    icon: GraduationCap,
    number: 1,
    title: "Future-Ready Students",
    description:
      "Students gain early exposure to Artificial Intelligence, coding, computational thinking, STEM and digital technologies, helping them develop the skills and confidence required for the future.",
  },
  {
    icon: BookOpen,
    number: 2,
    title: "Stronger Academic & Experiential Learning",
    description:
      "CITIS solutions complement classroom teaching with interactive, practical and experiential learning. Virtual science labs, coding projects and AI-based learning activities help students connect concepts with real-world applications.",
  },
  {
    icon: Star,
    number: 3,
    title: "Differentiated School Positioning",
    description:
      "A comprehensive AI, STEM and technology ecosystem can help schools differentiate themselves in an increasingly competitive education landscape. It provides a strong proposition for parents seeking schools that prepare children for the future.",
  },
  {
    icon: Users,
    number: 4,
    title: "Teacher Capability Building",
    description:
      "CITIS can support teachers with structured training and resources to effectively integrate AI, ICT, coding and digital learning into classroom practice, enabling technology to become an effective teaching tool rather than a standalone subject.",
  },
  {
    icon: Layers,
    number: 5,
    title: "Integrated Technology Ecosystem",
    description:
      "Instead of implementing multiple disconnected technology initiatives, schools can create an integrated ecosystem combining CITIS AI Academy, CODMOS, ICT integration and Science Labs under a common future-skills framework.",
  },
  {
    icon: Zap,
    number: 6,
    title: "Increased Student Engagement",
    description:
      "Interactive learning, coding, simulations, AI activities and practical STEM experiences can make learning more engaging and encourage students to explore, experiment, create and solve problems.",
  },
  {
    icon: Lightbulb,
    number: 7,
    title: "Innovation & Problem-Solving Culture",
    description:
      "Students are encouraged to move from consuming information to creating solutions. Projects, coding, STEM activities and AI applications can help develop creativity, critical thinking, collaboration and problem-solving.",
  },
  {
    icon: TrendingUp,
    number: 8,
    title: "Scalable Implementation",
    description:
      "CITIS solutions can be introduced progressively across grades and academic years, allowing schools to start with priority areas and expand their technology and innovation ecosystem over time.",
  },
  {
    icon: Heart,
    number: 9,
    title: "Parent & Community Value",
    description:
      "A visible commitment to AI, STEM, coding and future skills strengthens the school's value proposition to parents and demonstrates a clear commitment to preparing students for the changing world.",
  },
  {
    icon: HandshakeIcon,
    number: 10,
    title: "A Long-Term Transformation Partner",
    description:
      "CITIS can work with the school beyond the deployment of an individual product or program—supporting technology adoption, teacher capability, curriculum integration, student learning and continuous innovation.",
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SolutionCard({ solution }: { solution: Solution }) {
  const Icon = solution.icon;
  return (
    <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <CardHeader>
        <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <CardTitle>{solution.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {solution.paragraphs.map((p, i) => (
          <p key={i} className="text-sm leading-7 text-muted-foreground">
            {p}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function SchoolPage() {
  return (
    <>
      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border py-14 sm:py-20">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS Infotech works with schools to build future-ready, technology-enabled and
              innovation-driven learning ecosystems. Our School Solutions bring together Artificial
              Intelligence, digital literacy, coding, computational thinking, ICT integration, STEM
              education and virtual science learning to complement the academic curriculum and
              prepare students for the future.
            </p>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Through solutions such as CITIS AI Academy, CODMOS and Virtual Science Labs,
              we enable schools to move beyond conventional technology-enabled teaching towards
              experiential learning, creativity, problem-solving and innovation. Our approach is
              designed to support students, teachers and school leadership through a structured and
              scalable technology-enabled education ecosystem.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/school-solutions-stem-robotics.jpg"
                alt="Students collaborating on a hands-on STEM robotics project"
                width={1408}
                height={768}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tomorrow's Schools ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Tomorrow's Schools"
              title="Preparing Schools for the Future"
            />
            <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              The school of tomorrow will be more than a place where students acquire academic
              knowledge. It will be an environment where learners develop the ability to think,
              create, experiment, collaborate and solve problems using technology.
            </p>
            <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS helps schools prepare for this future by bringing together AI education, coding,
              computational thinking, digital skills, STEM learning, virtual laboratories and
              innovation programs. Our solutions are designed to complement the existing curriculum
              while gradually building the capabilities required for an increasingly
              technology-driven world.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/school-solutions-classroom.jpg"
                alt="Students learning with digital classroom technology"
                width={1408}
                height={736}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {tomorrowsSolutions.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.08}>
                <SolutionCard solution={s} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── ICT Integration ───────────────────────────────────────────────── */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="ICT Integration"
              title="Technology as an Enabler of Learning"
            />
            <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              ICT should not be limited to teaching students how to operate computers or use
              software. When effectively integrated into education, technology can enhance teaching,
              collaboration, creativity, assessment and access to learning resources.
            </p>
            <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS works with schools to develop a structured approach to ICT integration that
              connects technology, teachers, curriculum and students. Our objective is to help
              schools make technology an integral part of the learning environment rather than a
              standalone subject.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/school-solutions-robotics.jpg"
                alt="Students building and programming robotics projects in class"
                width={1280}
                height={720}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ictSolutions.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.08}>
                <SolutionCard solution={s} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEM Education Solution ───────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="STEM Education Solution"
              title="Learn. Experiment. Discover. Innovate."
            />
            <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              STEM education brings together Science, Technology, Engineering and Mathematics to
              create practical and interdisciplinary learning experiences.
            </p>
            <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS helps schools build STEM ecosystems where students can learn concepts through
              experimentation, simulation, coding, projects and real-world problem-solving rather
              than relying exclusively on theoretical instruction.
            </p>
          </AnimatedSection>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {stemSolutions.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.08}>
                <SolutionCard solution={s} />
              </AnimatedSection>
            ))}
          </div>

          {/* Integrated STEM Ecosystem */}
          <AnimatedSection delay={0.12} className="mt-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </span>
                <CardTitle>Integrated STEM Ecosystem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  CITIS can bring together AI + Coding + ICT + Virtual Science Labs + STEM +
                  Innovation into a unified school transformation framework.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
          <div className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/school-solutions-digital-classroom.jpg"
                alt="Students collaborating around an interactive digital classroom display"
                width={1017}
                height={678}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits to Schools ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading title="Benefits to Schools" />
            <p className="mt-5 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              Partnering with CITIS enables schools to build a future-ready education ecosystem
              that goes beyond conventional academic learning. By integrating AI, coding, ICT, STEM
              and virtual science learning into the school environment, institutions can strengthen
              their academic offering while preparing students for the rapidly changing world of
              technology and work.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/school-solutions-maker-lab.jpg"
                alt="Students working together on a hands-on robotics and maker project"
                width={1024}
                height={1024}
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="mx-auto aspect-square w-full max-w-3xl object-cover"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <AnimatedSection key={b.title} delay={(i % 2) * 0.08}>
                  <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground ring-4 ring-background">
                          {b.number}
                        </span>
                        <div>
                          <span className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <CardTitle className="text-base">{b.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-muted-foreground">{b.description}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final Statement ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <div className="brand-gradient relative overflow-hidden rounded-2xl px-6 py-12 text-white shadow-[0_24px_80px_rgba(15,76,129,.25)] sm:px-12 lg:px-16 lg:py-16">
              <div className="absolute -top-20 -right-20 size-72 rounded-full border border-white/10" />
              <div className="absolute -right-4 -bottom-32 size-80 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="relative">
                <p className="mb-4 text-sm font-bold tracking-[0.18em] text-orange-300 uppercase">
                  The CITIS proposition for schools is simple:
                </p>
                <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  Equip the school. Empower the teacher. Inspire the student. Prepare for tomorrow.
                </h2>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
