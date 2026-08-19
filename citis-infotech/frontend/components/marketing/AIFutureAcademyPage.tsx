import { AnimatedSection } from "@/components/shared/AnimatedSection";
import Image from "next/image";

const thinkingSkills = [
  "Logical reasoning",
  "Problem decomposition",
  "Pattern recognition",
  "Abstraction",
  "Algorithmic thinking",
  "Problem-solving",
  "Computational and mathematical thinking",
];

const codingSkills = [
  "Programming logic",
  "Algorithms",
  "Sequential thinking",
  "Loops",
  "Conditions",
  "Variables",
  "Events",
  "Functions",
  "Data and analysis",
  "Game development",
  "Python foundations",
  "Debugging and problem-solving",
];

const aiSkills = [
  "AI literacy",
  "Understanding of AI",
  "AI recognition and classification",
  "Generative AI awareness",
  "AI problem-solving",
  "AI ethics",
  "Responsible AI use",
  "Understanding of bias and privacy",
  "Ability to question AI outputs",
];

const learningJourney = [
  {
    title: "Foundation / Introductory",
    description:
      "Students begin with computational thinking diagnostics, spatial and arithmetic puzzles, icon-based coding and basic AI recognition activities.",
  },
  {
    title: "Foundation",
    description:
      "Students progress into sequences, loops, conditionals, data collection, game-making and introductory AI concepts.",
  },
  {
    title: "Advanced",
    description:
      "Students explore automation, simulation, variables, events, AI learning principles and STEAM + AI projects.",
  },
  {
    title: "Mastery",
    description:
      "Students move towards Python foundations, debugging, AI classification projects, generative-AI problem solving and responsible AI use.",
  },
];

const studentLearning = [
  {
    title: "Computational Thinking",
    description: "Problem-solving, decomposition, patterns, abstraction and algorithms.",
  },
  {
    title: "Algorithms & Programming",
    description: "Programming logic, sequences, loops, conditions, variables, events and functions.",
  },
  {
    title: "Data & Analysis",
    description: "Understanding, collecting and analysing data.",
  },
  {
    title: "Coding & Game Development",
    description: "Learning through interactive missions, games and creation-oriented activities.",
  },
  {
    title: "Python",
    description: "Progressive introduction to Python programming at appropriate levels.",
  },
  {
    title: "Artificial Intelligence",
    description: "AI concepts, recognition, classification and AI applications.",
  },
  {
    title: "Generative AI",
    description: "Age-appropriate exposure to generative AI and AI-powered problem solving.",
  },
  {
    title: "AI Ethics & Digital Responsibility",
    description: "Bias, privacy, responsibility and appropriate use of AI.",
  },
];

const projects = [
  "Coding challenges",
  "Interactive games",
  "Computational thinking puzzles",
  "Data projects",
  "Python programs",
  "AI classification activities",
  "AI-based problem-solving projects",
  "STEAM + AI projects",
  "Generative AI problem-solving activities",
];

const schoolEcosystem = [
  {
    title: "Curriculum",
    description: "Structured, grade-appropriate learning pathways.",
  },
  {
    title: "Digital Platform",
    description: "A connected learning environment for students and educators.",
  },
  {
    title: "Lesson Plans",
    description: "Ready-to-use lesson plans and structured missions.",
  },
  {
    title: "Teacher Support",
    description: "Training and onboarding to help educators facilitate lessons confidently.",
  },
  {
    title: "Student Dashboards",
    description: "Progress monitoring and skill-based tracking.",
  },
  {
    title: "Analytics",
    description: "Performance insights to support monitoring and intervention.",
  },
  {
    title: "AI-Assisted Support",
    description: "AI-supported assistance within the learning environment.",
  },
];

const implementationModels = [
  {
    title: "ICT / Computer Periods",
    description: "Integrate Computational Thinking, coding and AI into existing ICT periods.",
  },
  {
    title: "STEM / Innovation Programs",
    description: "Use the Academy as part of the school's STEM and innovation ecosystem.",
  },
  {
    title: "AI Academy",
    description: "Create a dedicated AI and future-skills program within the school.",
  },
  {
    title: "Innovation Clubs",
    description: "Use coding, AI and project-based learning for clubs and enrichment activities.",
  },
  {
    title: "Enrichment Programs",
    description: "Offer the program as an additional learning opportunity.",
  },
  {
    title: "Phased Rollout",
    description: "Begin with selected grades and progressively expand across the school.",
  },
];

const studentBenefits = [
  {
    title: "Think Better",
    description: "Develop logical reasoning, problem-solving and structured thinking.",
  },
  {
    title: "Create with Technology",
    description: "Move from consuming technology to building with it.",
  },
  {
    title: "Learn Coding",
    description: "Develop programming foundations through progressive learning.",
  },
  {
    title: "Understand AI",
    description: "Learn what AI is and how it works at an age-appropriate level.",
  },
  {
    title: "Use AI Responsibly",
    description:
      "Understand bias, privacy, responsibility and the importance of questioning AI outputs.",
  },
  {
    title: "Develop Creativity",
    description: "Create games, programs and technology-based projects.",
  },
  {
    title: "Build Confidence",
    description: "Experiment, make mistakes, debug and improve.",
  },
  {
    title: "Prepare for the Future",
    description:
      "Develop foundational skills relevant to further education, technology careers and an AI-enabled workplace.",
  },
];

const schoolBenefits = [
  "A structured K–12 pathway",
  "Computational Thinking development",
  "Coding and programming education",
  "AI literacy and responsible AI",
  "Project-based learning",
  "Ready lesson plans",
  "Teacher enablement",
  "Student dashboards",
  "Learning analytics",
  "Progressive grade-level curriculum",
  "Integration with existing ICT/STEM infrastructure",
  "Scalable institution-wide implementation",
];

const futureReadyEcosystem = [
  {
    title: "CITIS AI Academy",
    description: "Computational Thinking + Coding + AI",
  },
  {
    title: "CODMOS",
    description: "Technology and curriculum platform",
  },
  {
    title: "CITIS Science Lab",
    description: "Experiential Science + Virtual Experiments",
  },
  {
    title: "STEM & Innovation",
    description: "Projects + Making + Problem Solving",
  },
];

const academyAdvantages = [
  {
    title: "Internationally Developed",
    description:
      "CODMOS is developed in South Korea and brought to Indian institutions through the CITIS AI Academy framework.",
  },
  {
    title: "K–12",
    description: "A progressive learning journey rather than a standalone coding course.",
  },
  {
    title: "Three Connected Skills",
    description: "Think → Build → Command",
  },
  {
    title: "Curriculum + Platform",
    description: "Structured curriculum delivered through a connected digital learning system.",
  },
  {
    title: "Practical & Experiential",
    description: "Missions, puzzles, games, coding challenges and projects.",
  },
  {
    title: "Measurable",
    description: "Student progress dashboards, skill tracking and performance insights.",
  },
  {
    title: "Responsible AI",
    description: "AI literacy combined with ethics, privacy, bias and responsibility.",
  },
  {
    title: "School-Ready",
    description: "Designed for practical implementation within existing school infrastructure.",
  },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
      {children}
    </h2>
  );
}

function Copy({ children }: { children: string }) {
  return <p className="text-base leading-8 text-muted-foreground sm:text-lg">{children}</p>;
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2 text-sm leading-7 text-muted-foreground sm:text-base">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-secondary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureGrid({
  items,
  columns = "md:grid-cols-2",
}: {
  items: ReadonlyArray<{ title: string; description: string }>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {items.map((item, index) => (
        <AnimatedSection key={item.title} delay={index * 0.04}>
          <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
          </article>
        </AnimatedSection>
      ))}
    </div>
  );
}

function FrameworkStage({
  number,
  title,
  subtitle,
  paragraphs,
  skills,
}: {
  number: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  skills: readonly string[];
}) {
  return (
    <AnimatedSection>
      <article className="rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
        <p className="text-sm font-bold tracking-[0.18em] text-secondary uppercase">{number}</p>
        <h3 className="mt-3 font-heading text-2xl font-semibold">{title}</h3>
        <p className="mt-2 font-heading text-lg font-medium text-primary">{subtitle}</p>
        <div className="mt-5 space-y-4">
          {paragraphs.map((paragraph) => (
            <Copy key={paragraph}>{paragraph}</Copy>
          ))}
        </div>
        <h4 className="mt-7 font-heading text-lg font-semibold">Students develop:</h4>
        <BulletList items={skills} />
      </article>
    </AnimatedSection>
  );
}

export function AIFutureAcademyPage() {
  return (
    <>
      <section className="border-b border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="font-heading text-2xl font-medium text-primary sm:text-3xl">
              Think. Build. Command.
            </p>
            <p className="mt-3 font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Preparing students for the AI-powered world
            </p>
            <div className="mt-8 space-y-6">
              <Copy>
                The CITIS AI Academy is a comprehensive K–12 program designed to develop the
                skills children need to thrive in an increasingly digital and AI-driven world.
              </Copy>
              <Copy>
                Developed in technical collaboration with CODMOS, South Korea, the program brings
                together Computational Thinking, Coding Foundations and AI Fluency into one structured
                learning pathway. Rather than treating coding and Artificial Intelligence as
                disconnected technology subjects, the Academy develops students progressively—from
                learning how to think and solve problems, to building with code, to understanding and
                responsibly using AI.
              </Copy>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 font-heading text-lg font-semibold text-primary">
              <span>THINK with Computational Thinking</span>
              <span>BUILD with Coding</span>
              <span>COMMAND with AI</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-16">
          <AnimatedSection>
            <SectionTitle>Why CITIS AI Academy?</SectionTitle>
            <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
              From Digital Users to Digital Creators
            </h3>
            <div className="mt-6 space-y-6">
              <Copy>
                Today&apos;s children are growing up surrounded by technology and Artificial
                Intelligence. However, simply using digital devices does not necessarily develop
                digital literacy, computational thinking or AI fluency.
              </Copy>
              <Copy>
                Students need to understand how technology works, how problems can be broken down, how
                solutions can be designed and how AI can be used intelligently and responsibly.
              </Copy>
              <Copy>
                The CITIS AI Academy addresses this need through a structured, age-appropriate
                and progressive learning journey that develops logical reasoning, problem-solving,
                pattern recognition, algorithmic thinking, coding and AI capabilities.
              </Copy>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/ai-academy-classroom-1.jpg"
                alt="Students learning with laptops alongside their teacher"
                width={1080}
                height={1080}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="aspect-square w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Technical Collaboration with CODMOS, South Korea</SectionTitle>
            <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
              Bringing a Global AI-Era Learning Framework to Indian Schools
            </h3>
            <div className="mt-6 space-y-6">
              <Copy>
                CITIS AI Academy is offered in technical collaboration with CODMOS, South
                Korea, bringing a structured international approach to K–12 Computational Thinking,
                Coding and AI education to institutions in India.
              </Copy>
              <Copy>
                CODMOS is designed as an AI-era learning system for K–12 institutions, connecting
                computational and mathematical thinking, coding foundations and AI fluency through a
                single learning pathway.
              </Copy>
              <Copy>
                The CODMOS curriculum is developed in South Korea and is presented for Indian
                institutions as an Indian classroom-ready, NEP 2020-aligned program.
              </Copy>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-base leading-8 text-muted-foreground">
                  CODMOS brings the technology and curriculum framework.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-base leading-8 text-muted-foreground">
                  CITIS brings the institutional implementation, academic integration and
                  India-focused education ecosystem.
                </p>
              </div>
            </div>
            <AnimatedSection className="mt-10">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <Image
                  src="/images/ai-academy-classroom-2.jpg"
                  alt="Students collaborating in a coding and robotics lab"
                  width={1024}
                  height={768}
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[16/7]"
                />
              </div>
            </AnimatedSection>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>The CITIS AI Academy Learning Framework</SectionTitle>
          <p className="mt-6 font-heading text-2xl font-semibold text-primary sm:text-3xl">
            THINK → BUILD → COMMAND
          </p>
        </AnimatedSection>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <FrameworkStage
            number="01 — THINK"
            title="Computational Thinking"
            subtitle="Students first learn how to think before they learn how to code."
            paragraphs={[
              "Computational Thinking helps students break complex problems into smaller parts, identify patterns, understand relationships, develop logical reasoning and create step-by-step solutions.",
              "These capabilities are transferable across Mathematics, Science, ICT and project-based learning.",
            ]}
            skills={thinkingSkills}
          />
          <FrameworkStage
            number="02 — BUILD"
            title="Coding Foundations"
            subtitle="Once students learn to structure their thinking, they learn to convert ideas into working solutions."
            paragraphs={[
              "Coding is introduced progressively through icon/block-based programming, interactive missions, games and problem-solving activities, moving towards more advanced programming concepts and Python pathways.",
              "Students learn to create, test, debug and improve their solutions.",
            ]}
            skills={codingSkills}
          />
          <FrameworkStage
            number="03 — COMMAND"
            title="AI Fluency"
            subtitle="The final stage is not simply learning about AI, but learning how to understand, question, use and apply AI responsibly."
            paragraphs={[
              "Students are introduced to age-appropriate AI concepts including recognition, classification, generative AI and AI-based problem-solving. They also explore issues such as bias, privacy and responsibility.",
              "The objective is to help students use AI with judgement rather than dependency.",
            ]}
            skills={aiSkills}
          />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>A Progressive K–12 Learning Journey</SectionTitle>
            <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              The Academy follows a grade-banded progression, allowing students to build capabilities
              continuously rather than repeating the same introductory coding experience every year.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={learningJourney} columns="sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>What Students Learn</SectionTitle>
          <p className="mt-6 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
            The Academy brings together multiple areas of future-ready technology education within
            one connected pathway.
          </p>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={studentLearning} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </div>
        <p className="mt-10 text-base leading-8 text-muted-foreground sm:text-lg">
          The underlying CODMOS curriculum covers areas including Digital Literacy, Computing
          Systems, Data, Algorithms & Programming, Maker, Artificial Intelligence, Digital Culture
          and Computational Thinking across progressive levels.
        </p>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Learning Through Missions, Challenges & Projects</SectionTitle>
            <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
              Make Learning an Experience
            </h3>
            <div className="mt-6 space-y-6">
              <Copy>CITIS AI Academy moves beyond traditional lectures and worksheets.</Copy>
              <Copy>
                Students learn through interactive missions, puzzles, coding challenges, games,
                projects and problem-solving activities. This approach allows students to experiment,
                make mistakes, debug their solutions and learn through iteration.
              </Copy>
              <Copy>
                The program is designed to make learning engaging while keeping student progress
                measurable.
              </Copy>
            </div>
            <p className="mt-8 font-heading text-xl font-semibold text-primary sm:text-2xl">
              Learn → Experiment → Create → Debug → Improve → Apply
            </p>
          </AnimatedSection>
          <AnimatedSection className="mt-12">
            <h3 className="font-heading text-2xl font-semibold">AI & Coding Projects</h3>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              The Academy encourages students to move from learning concepts to creating with
              technology.
            </p>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Depending on age and level, students can work on:
            </p>
            <BulletList items={projects} />
            <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg">
              The progression is designed to take students from understanding technology to creating
              with technology.
            </p>
          </AnimatedSection>
          <AnimatedSection className="mt-12">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/ai-academy-classroom-3.jpg"
                alt="Students exploring coding and AI projects with their teacher"
                width={1536}
                height={1024}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section id="curriculum" className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Responsible AI Education</SectionTitle>
          <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
            AI Literacy Must Include AI Responsibility
          </h3>
          <div className="mt-6 space-y-6">
            <Copy>
              As AI becomes increasingly accessible, students need to understand not only what AI
              can do, but also its limitations and responsibilities.
            </Copy>
            <Copy>The Academy introduces students to questions such as:</Copy>
          </div>
          <div className="mt-5 space-y-3 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>Can we always trust an AI output?</p>
            <p>What happens when AI makes a mistake?</p>
            <p>Can AI be biased?</p>
            <p>How should personal information be protected?</p>
            <p>Who is responsible for decisions made with AI?</p>
          </div>
          <Copy>
            Students are introduced to concepts such as AI ethics, privacy, bias and responsibility,
            helping them develop the judgement necessary to use AI responsibly.
          </Copy>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Designed for Indian Schools</SectionTitle>
            <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
              International Framework. Indian Classroom.
            </h3>
            <div className="mt-6 space-y-6">
              <Copy>
              CITIS AI Academy is designed to support the requirements of Indian schools
                and the changing direction of school education.
              </Copy>
              <Copy>
                The program aligns with the broader emphasis of NEP 2020 and NCF 2023 on
                competency-based, experiential, multidisciplinary and skill-oriented learning. The
                source material also notes the introduction of a CBSE Computational Thinking and
                Artificial Intelligence curriculum framework for Classes III–VIII from Session
                2026–27.
              </Copy>
              <Copy>
                This creates an opportunity for schools to establish a structured Computational
                Thinking and AI pathway rather than introducing isolated coding or AI activities.
              </Copy>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>A Complete School Implementation Model</SectionTitle>
          <h3 className="mt-7 font-heading text-2xl font-semibold text-primary">
            Not Just a Curriculum. An Ecosystem.
          </h3>
          <div className="mt-6 space-y-6">
            <Copy>
              CITIS AI Academy is designed to make implementation practical for schools.
            </Copy>
            <Copy>The ecosystem includes:</Copy>
          </div>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={schoolEcosystem} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </div>
        <p className="mt-10 text-base leading-8 text-muted-foreground sm:text-lg">
          The platform is designed to reduce dependence on specialist hiring or schools developing
          their own coding and AI curriculum from scratch.
        </p>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>No Specialist Infrastructure Required</SectionTitle>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              The Academy is designed to work within a school&apos;s existing technology environment.
            </p>
            <BulletList
              items={[
                "No specialised hardware required.",
                "No specialist coding teacher required.",
                "Works within the existing classroom setup.",
              ]}
            />
            <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg">
              Schools can begin with a pilot program and progressively scale it across grades and the
              institution.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Flexible School Implementation</SectionTitle>
          <div className="mt-6 space-y-6">
            <Copy>
              CITIS can work with schools to integrate the Academy according to their academic
              structure.
            </Copy>
            <Copy>Possible implementation models include:</Copy>
          </div>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={implementationModels} columns="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
        <p className="mt-10 text-base leading-8 text-muted-foreground sm:text-lg">
          The CODMOS implementation model specifically supports ICT/STEM periods, lab rotations,
          innovation clubs, enrichment blocks and phased grade-band rollouts.
        </p>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>Benefits to Students</SectionTitle>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={studentBenefits} columns="sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Benefits to Schools</SectionTitle>
          <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
            CITIS AI Academy enables schools to develop a structured technology-learning
            ecosystem without treating AI and coding as isolated add-ons.
          </p>
          <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
            Schools can benefit from:
          </p>
          <BulletList items={schoolBenefits} />
          <p className="mt-8 text-base leading-8 text-muted-foreground sm:text-lg">
            The central advantage is one connected system instead of multiple disconnected tools for
            coding, puzzles, mathematics enrichment and AI demonstrations.
          </p>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection className="max-w-4xl">
            <SectionTitle>A Stronger Future-Ready School Ecosystem</SectionTitle>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              CITIS AI Academy can become the technology and innovation layer of a school&apos;s
              broader STEM ecosystem.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={futureReadyEcosystem} columns="sm:grid-cols-2 lg:grid-cols-4" />
          </div>
          <p className="mt-10 text-base leading-8 text-muted-foreground sm:text-lg">
            Together, these initiatives can create a powerful AI + Coding + STEM + Experiential
            Learning ecosystem for K–12 education.
          </p>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>Why CITIS AI Academy?</SectionTitle>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={academyAdvantages} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Build AI-Ready Learners</SectionTitle>
            <div className="mt-7 space-y-4">
              <Copy>The future-ready student will not simply use technology.</Copy>
              <Copy>They will understand it.</Copy>
              <Copy>They will question it.</Copy>
              <Copy>They will build with it.</Copy>
              <Copy>And they will use Artificial Intelligence responsibly.</Copy>
            </div>
            <Copy>
            CITIS AI Academy, in technical collaboration with CODMOS, South Korea, gives
              schools a structured pathway to make that transformation possible.
            </Copy>
            <p className="mt-8 font-heading text-xl font-semibold text-primary sm:text-2xl">
              Think. Build. Command.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Bring CITIS AI Academy to Your School</SectionTitle>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Request a School Demo
            </a>
            <a
              href="#curriculum"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Explore the Curriculum
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Start a Pilot Program
            </a>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}