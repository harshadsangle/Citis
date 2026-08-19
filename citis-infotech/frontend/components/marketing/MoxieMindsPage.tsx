import { AnimatedSection } from "@/components/shared/AnimatedSection";
import Image from "next/image";

const capabilities = [
  {
    title: "Entrepreneurship",
    description:
      "Understanding entrepreneurial mindset, opportunity identification, business fundamentals and the core functions required to start and manage a venture.",
  },
  {
    title: "Design Thinking",
    description:
      "Learning how to understand customers, identify problems, generate ideas, test assumptions and develop innovative solutions.",
  },
  {
    title: "Data Analytics",
    description:
      "Developing the ability to work with data, analyse information and use numbers to support business and managerial decision-making.",
  },
  {
    title: "Project Management",
    description:
      "Understanding how projects are planned, executed, monitored and delivered using both traditional and modern project management approaches.",
  },
];

const modules = [
  {
    title: "1. The Entrepreneur",
    paragraphs: [
      "The Entrepreneur module introduces learners to the fundamentals of entrepreneurship and the mindset required to recognise and pursue opportunities.",
      "Students explore opportunity identification, business fundamentals and the key functions of a business, including finance, marketing, sales and operations. The module also helps learners understand the difference between being an entrepreneur and an intrapreneur and the capabilities required to succeed in both environments.",
    ],
  },
  {
    title: "2. Design Thinking for Innovation",
    paragraphs: [
      "Innovation begins with understanding problems and people. This module introduces students to design thinking principles and practical tools for understanding customer needs, generating ideas and developing solutions.",
      "Students learn to explore problems, build empathy, brainstorm possibilities, experiment, test assumptions and refine their ideas. The approach encourages creativity, critical thinking and complex problem-solving.",
    ],
  },
  {
    title: "3. Data Analysis Using Advanced MS Excel",
    paragraphs: [
      "Data is an increasingly important part of business decision-making. This module develops learners' ability to work with data, analyse information and derive meaningful insights using advanced MS Excel.",
      "Students learn to work with different types of data and use analytical techniques to support business decisions. The objective is to develop confidence in using numbers and information as a basis for effective decision-making.",
    ],
  },
  {
    title: "4. Project Management",
    paragraphs: [
      "Ideas become successful ventures only when they can be executed effectively. The Project Management module introduces learners to the core concepts, tools and methodologies required to plan and manage projects.",
      "Students are exposed to traditional and modern project management approaches and develop an understanding of project planning, execution, monitoring and delivery.",
    ],
  },
];

const coreModules = [
  {
    title: "The Entrepreneur",
    description: "Entrepreneurial mindset, opportunity recognition and business fundamentals.",
  },
  {
    title: "Design Thinking for Innovation",
    description: "Problem identification, customer empathy, ideation and experimentation.",
  },
  {
    title: "Data Analysis using Advanced MS Excel",
    description: "Data handling, analysis and business decision-making.",
  },
  {
    title: "Project Management",
    description: "Project planning, execution and modern project management practices.",
  },
];

const institutionModels = [
  {
    title: "Credit Integrated Learning",
    description:
      "The program can be integrated into the institution's academic framework as a credit-oriented learning component, subject to institutional and regulatory requirements.",
  },
  {
    title: "Honours Program",
    description:
      "MoxieMinds can form part of an Honours pathway, providing students with additional exposure to entrepreneurship, innovation and business capabilities.",
  },
  {
    title: "Value Added Program",
    description:
      "Institutions can offer MoxieMinds as a value-added program that complements the student's primary academic discipline.",
  },
  {
    title: "Diploma / Upskilling Program",
    description:
      "The program can also be considered as part of diploma or upskilling initiatives for students and professionals seeking additional business and entrepreneurial capabilities.",
  },
];

const studentBenefits = [
  {
    title: "Entrepreneurial Mindset",
    description:
      "Develop the confidence to identify opportunities, take initiative and explore new possibilities.",
  },
  {
    title: "Innovation & Creativity",
    description: "Learn structured approaches to problem-solving, ideation and innovation.",
  },
  {
    title: "Business Understanding",
    description:
      "Gain exposure to the fundamental functions of business, including finance, marketing, sales and operations.",
  },
  {
    title: "Data-Driven Decision Making",
    description: "Develop the ability to work with data and use insights to support decisions.",
  },
  {
    title: "Project Management",
    description: "Learn how to structure, manage and deliver projects effectively.",
  },
  {
    title: "Practical Experience",
    description: "Apply concepts through projects, case studies, exercises and real-world scenarios.",
  },
  {
    title: "Industry Exposure",
    description: "Interact with industry professionals and gain insights into current business practices.",
  },
  {
    title: "Career Readiness",
    description:
      "Develop skills relevant not only to entrepreneurs but also to professionals working in organisations as intrapreneurs and future business leaders.",
  },
];

const advantages = [
  {
    title: "Practical Learning",
    description: "Focused on application rather than only theoretical understanding.",
  },
  {
    title: "Industry Faculty",
    description: "Sessions supported by industry and subject-matter experts.",
  },
  {
    title: "Global Certification Orientation",
    description: "Curriculum mapped to relevant global certification pathways.",
  },
  {
    title: "Four Core Business Capabilities",
    description:
      "Entrepreneurship, Design Thinking, Data Analytics and Project Management.",
  },
  {
    title: "Flexible Academic Integration",
    description:
      "Can be considered for credit-integrated, Honours, value-added, diploma and upskilling formats.",
  },
  {
    title: "Career & Venture Readiness",
    description:
      "Builds capabilities relevant to entrepreneurship, intrapreneurship and professional careers.",
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

function FeatureGrid({
  items,
  columns = "md:grid-cols-2",
}: {
  items: Array<{ title: string; description: string }>;
  columns?: string;
}) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {items.map((item, index) => (
        <AnimatedSection key={item.title} delay={index * 0.05}>
          <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
}

function ModuleGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {modules.map((module, index) => (
        <AnimatedSection key={module.title} delay={index * 0.05}>
          <article className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h3 className="font-heading text-xl font-semibold">{module.title}</h3>
            <div className="mt-5 space-y-5">
              {module.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </AnimatedSection>
      ))}
    </div>
  );
}

export function MoxieMindsPage() {
  return (
    <>
      <section className="border-b border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-16">
            <AnimatedSection>
              <p className="font-heading text-2xl font-medium text-primary sm:text-3xl">
                Transforming Vision into Venture. Where Ideas Ignite Business Success.
              </p>
              <div className="mt-8 space-y-6">
                <Copy>
                  The MoxieMinds Entrepreneurship Academy is designed to help students develop the
                  mindset, skills and practical capabilities required to navigate an increasingly
                  entrepreneurial and innovation-driven world.
                </Copy>
                <Copy>
                  Entrepreneurship is not only about starting a company. It is about recognising
                  opportunities, understanding problems, taking initiative, creating solutions and
                  making informed decisions. MoxieMinds helps learners develop this entrepreneurial
                  mindset while building practical capabilities across business, innovation,
                  technology and management.
                </Copy>
                <Copy>
                  The Academy&apos;s objective is to help today&apos;s learners become tomorrow&apos;s
                  entrepreneurs, innovators, intrapreneurs and business leaders.
                </Copy>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.08}>
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <Image
                  src="/images/moxieminds-workshop.jpg"
                  alt="Students participating in an entrepreneurship workshop"
                  width={980}
                  height={735}
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>Why Entrepreneurship Education?</SectionTitle>
          <div className="mt-7 space-y-6">
            <Copy>
              The world of work is changing rapidly, and young people need more than academic
              qualifications to succeed. They need the confidence to identify opportunities, solve
              problems creatively, manage resources and adapt to changing circumstances.
            </Copy>
            <Copy>
              Entrepreneurship education helps learners develop an ability to think differently,
              recognise opportunities and turn ideas into practical solutions. It can also nurture
              creativity, confidence, initiative and leadership while introducing students to the
              fundamentals of how businesses are created and managed.
            </Copy>
            <Copy>
              MoxieMinds is built around this philosophy—helping learners move from idea to action
              and from concept to execution.
            </Copy>
          </div>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>What is MoxieMinds?</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>
                MoxieMinds is a structured entrepreneurship and business-skills program designed for
                students and emerging professionals.
              </Copy>
              <Copy>
                The program combines entrepreneurship with four critical areas of 21st-century
                capability:
              </Copy>
            </div>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={capabilities} columns="md:grid-cols-2 lg:grid-cols-4" />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>Program Modules</SectionTitle>
        </AnimatedSection>
        <div className="mt-10">
          <ModuleGrid />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Learning by Doing</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>MoxieMinds follows a practical and experiential learning approach.</Copy>
              <Copy>
                Instead of relying only on classroom lectures, students are exposed to case studies,
                practical learning, real-time problem solving, hands-on sessions, project work, field
                exercises and industry interactions.
              </Copy>
              <Copy>
                Industry and subject-matter experts contribute to the learning experience, bringing
                current business practices, practical insights and real-world perspectives into the
                classroom.
              </Copy>
            </div>
            <h3 className="mt-10 font-heading text-2xl font-semibold text-primary">
              Our Learning Approach
            </h3>
            <p className="mt-4 font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Learn → Explore → Apply → Experiment → Build → Present → Reflect
            </p>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              This approach helps students understand how concepts are applied in real business and
              professional environments.
            </p>
          </AnimatedSection>
          <AnimatedSection className="mt-12">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/moxieminds-presentation.jpg"
                alt="Students presenting a business solution to an audience"
                width={1280}
                height={720}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="aspect-[16/7] w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Industry-Led Learning</SectionTitle>
          <div className="mt-7 space-y-6">
            <Copy>
              A key differentiator of MoxieMinds is its emphasis on learning from practitioners.
            </Copy>
            <Copy>
              Sessions are designed to include industry experts and subject-matter experts who can
              provide practical perspectives on entrepreneurship, innovation, project management,
              data and business functions.
            </Copy>
            <Copy>
              Through case studies, industry interactions and practical projects, students gain
              exposure to the challenges and decisions faced by entrepreneurs and professionals in
              the real world.
            </Copy>
          </div>
        </AnimatedSection>
        <AnimatedSection className="mt-12">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <Image
              src="/images/moxieminds-industry-session.jpg"
              alt="Entrepreneurship instructor speaking to a student audience"
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Global Certification & Recognition</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>
                MoxieMinds is designed with a global certification orientation, with the program
                being presented in association with Microsoft, PMI, Intuit and NFTE, USA.
              </Copy>
              <Copy>
                The curriculum is mapped to relevant certification pathways, enabling eligible
                students to pursue additional global credentials alongside the academic program.
              </Copy>
              <Copy>
                These credentials can help learners strengthen their professional portfolios and
                demonstrate competencies in areas relevant to entrepreneurship, business and
                management.
              </Copy>
              <Copy>
                Certification eligibility, examination requirements and applicable credentials may
                vary by program and learner.
              </Copy>
            </div>
          </AnimatedSection>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>Program Structure</SectionTitle>
          <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
            The MoxieMinds program comprises four modules, with each module designed around
            approximately 45–50 hours of practical learning.
          </p>
          <h3 className="mt-10 font-heading text-2xl font-semibold text-primary">4 Core Modules</h3>
        </AnimatedSection>
        <div className="mt-8">
          <FeatureGrid items={coreModules} columns="md:grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>How Institutions Can Integrate MoxieMinds</SectionTitle>
            <p className="mt-7 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
              MoxieMinds can be integrated into an institution&apos;s academic and professional
              learning ecosystem through multiple models.
            </p>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={institutionModels} columns="md:grid-cols-2" />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>Benefits to Students</SectionTitle>
          <p className="mt-7 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
            MoxieMinds helps students develop capabilities that extend beyond conventional academic
            learning.
          </p>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={studentBenefits} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Entrepreneurship & Intrapreneurship</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>Entrepreneurship is not limited to creating a startup.</Copy>
              <Copy>
                Modern organisations increasingly need employees who think like entrepreneurs—people
                who identify opportunities, challenge existing approaches, solve problems and create
                new value within an organisation.
              </Copy>
              <Copy>MoxieMinds therefore develops capabilities relevant to both:</Copy>
            </div>
            <div className="mt-7 space-y-4">
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                Entrepreneurs – Individuals who want to create and build their own ventures.
              </p>
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                Intrapreneurs – Individuals who want to innovate, create and drive new opportunities
                within existing organisations.
              </p>
            </div>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              This makes the program relevant to students who aspire to become founders as well as
              those who want to build careers in established organisations.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>The MoxieMinds Advantage</SectionTitle>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={advantages} columns="md:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>From Idea to Impact</SectionTitle>
            <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
              MoxieMinds is built around a simple journey:
            </p>
            <p className="mt-5 font-heading text-xl font-semibold text-foreground sm:text-2xl">
              Think → Identify → Create → Test → Build → Execute → Grow
            </p>
            <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
              The Academy aims to create an environment where learners can develop the confidence to
              look at problems as opportunities, ideas as possibilities and challenges as experiences
              from which they can learn.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>MoxieMinds Entrepreneurship Academy</SectionTitle>
          <h3 className="mt-6 font-heading text-2xl font-semibold text-primary">
            Transforming Vision into Venture.
          </h3>
          <p className="mt-3 font-heading text-xl font-medium text-foreground">
            Where Ideas Ignite Business Success.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Bring MoxieMinds to Your Institution
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Enquire Now
            </a>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}