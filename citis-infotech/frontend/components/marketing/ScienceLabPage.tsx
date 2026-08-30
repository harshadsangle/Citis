import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

const subjects = [
  {
    title: "Physics of Daily Life",
    description:
      "Explore physical principles through interactive experiments and everyday applications.",
  },
  {
    title: "Chemistry in Action",
    description:
      "Understand chemical concepts and reactions through safe, controlled and repeatable virtual experiments.",
  },
  {
    title: "Biology Dissected",
    description:
      "Explore biological concepts, processes and structures through interactive learning experiences.",
  },
];

const interactiveFeatures = [
  {
    title: "3D & Immersive",
    description:
      "Interactive 3D and 360° simulations provide students with a visual and immersive way to explore scientific concepts.",
  },
  {
    title: "Experiment Without Limits",
    description:
      "Students can reset and repeat experiments as many times as required, allowing them to learn at their own pace without being restricted by laboratory equipment, material availability or classroom time.",
  },
  {
    title: "Learn Through Mistakes",
    description:
      "The platform allows students to make errors and learn from the outcomes—an important part of meaningful scientific learning.",
  },
  {
    title: "Randomised Experiments",
    description:
      "Randomisation of seed values and extensive parametrisation create opportunities for students to experience varied experimental conditions rather than simply repeating identical outcomes.",
  },
];

const studentActivities = [
  "Explore scientific concepts interactively",
  "Conduct virtual experiments",
  "Change experimental parameters",
  "Observe outcomes",
  "Repeat experiments",
  "Learn from mistakes",
  "Connect concepts to real-world applications",
  "Strengthen conceptual understanding",
  "Develop critical thinking",
  "Prepare for practical laboratory work",
];

const teacherUses = [
  {
    title: "Classroom Demonstration",
    description: "Visualise and explain complex scientific concepts.",
  },
  {
    title: "Pre-Lab Preparation",
    description: "Prepare students before they conduct physical experiments.",
  },
  {
    title: "Concept Reinforcement",
    description: "Allow students to revisit concepts and experiments independently.",
  },
  {
    title: "Assessment",
    description: "Use quizzes to evaluate student understanding.",
  },
  {
    title: "Blended Learning",
    description: "Combine physical laboratory experiences with digital simulations.",
  },
];

const advantages = [
  {
    title: "135+ Interactive Simulations",
    description: "A growing library of simulations across Physics, Chemistry and Biology.",
  },
  {
    title: "500+ Topics",
    description: "Broad coverage of scientific concepts and applications.",
  },
  {
    title: "3D & 360° Experience",
    description:
      "Interactive and immersive simulations designed to make concepts more visual and engaging.",
  },
  {
    title: "Unlimited Practice",
    description: "Students can repeat experiments whenever required.",
  },
  {
    title: "Safe Experimentation",
    description:
      "Explore difficult or hazardous scenarios within a controlled virtual environment.",
  },
  {
    title: "Massive Parametrisation",
    description: "Experiment with different conditions and parameters.",
  },
  {
    title: "Randomised Learning",
    description: "Randomised values can create varied experimental experiences.",
  },
  {
    title: "Virtual Notebook & Quizzes",
    description:
      "Students can record observations and reinforce learning through assessments.",
  },
  {
    title: "Anywhere, Anytime",
    description: "Access learning beyond the physical classroom and laboratory.",
  },
  {
    title: "No Special Hardware",
    description: "Works on commonly available digital devices without requiring VR headsets.",
  },
  {
    title: "LMS/CMS Integration",
    description:
      "The platform is LTI compliant and can be integrated with compatible LMS/CMS environments.",
  },
];

const scienceLabBanners = [
  {
    title: "Learning by Doing",
    image: "/images/science-lab-learning-by-doing.png",
    alt: "Learning by Doing science learning graphic",
  },
  {
    title: "Concept Application",
    image: "/images/science-lab-concept-application.png",
    alt: "Concept Application science learning graphic",
  },
] as const;

const scienceLabResources = [
  {
    title: "Scholarlab Biology",
    url: "https://www.youtube.com/watch?v=y5ev3xA_rH8&list=PL2n-lSyk8P1l0dfemVeHgDJmk5vYxz-iu",
  },
  {
    title: "Scholarlab Chemistry",
    url: "https://www.youtube.com/watch?v=P0CeJ_k5NxE&list=PL2n-lSyk8P1keAA1jUTnArpNd6gH6Y6tN",
  },
  {
    title: "Scholarlab Physics",
    url: "https://www.youtube.com/watch?v=tzN1ZCFzo08&list=PL2n-lSyk8P1mx5nnxG4kADNmN_Yk7k4SG",
  },
] as const;

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

export function ScienceLabPage() {
  return (
    <>
      <section className="border-b border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="font-heading text-2xl font-medium text-primary sm:text-3xl">
              Experience. Observe. Learn.
            </p>
            <Copy>
              Science is best understood when students can see concepts come alive, experiment with
              them and observe the results. CITIS Science Lab is a 3D, interactive and immersive
              virtual science learning environment designed to bring science experiments and
              real-world applications into the classroom and beyond.
            </Copy>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              Designed primarily for students in Grades 6–12, Science Lab enables learners to
              explore Physics, Chemistry and Biology through interactive simulations. It can be
              accessed through laptops, desktops, tablets, mobile devices, Smart TVs and Smart
              Boards, without requiring specialised hardware such as VR headsets.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-16">
          <AnimatedSection>
            <SectionTitle>Why Science Lab?</SectionTitle>
            <h3 className="mt-4 font-heading text-2xl font-semibold text-primary sm:text-3xl">
              From Concept to Application
            </h3>
            <div className="mt-7 space-y-6">
              <Copy>
                Traditional learning often relies heavily on textbooks, lectures and one-way
                communication. While these methods are important, STEM learning becomes significantly
                more engaging when students can interact, experiment, make mistakes, observe outcomes
                and apply concepts.
              </Copy>
              <Copy>
                Science Lab follows a Learning by Doing approach, helping students move from
                understanding a concept to exploring its practical application. Interactive
                simulations create an environment where learners can experiment repeatedly and develop
                a deeper understanding of scientific principles.
              </Copy>
              <p className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                Learn → Experiment → Observe → Understand → Apply
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/science-lab-virtual-experiment.jpg"
                alt="Student exploring an interactive virtual science experiment"
                width={700}
                height={392}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section id="science-lab-learning-banners" className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site">
          <div className="grid gap-6 lg:grid-cols-2">
            {scienceLabBanners.map((banner, index) => (
              <AnimatedSection key={banner.title} delay={index * 0.1}>
                <div className="overflow-hidden rounded-3xl border border-[#0F4C81]/15 bg-white p-3 shadow-[0_12px_36px_rgba(15,76,129,0.1)]">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      width={493}
                      height={370}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="px-3 pb-2 pt-5 text-center font-heading text-2xl font-semibold text-primary sm:text-3xl">
                    {banner.title}
                  </h3>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>What is Science Lab?</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>
                Science Lab is a 3D interactive virtual science laboratory that brings science
                experiments and real-world scenarios to life.
              </Copy>
              <Copy>
                The platform currently offers 135+ simulations covering 500+ topics, with the
                content library continuing to expand. The simulations cover three major areas:
              </Copy>
            </div>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={subjects} columns="md:grid-cols-3" />
          </div>
          <AnimatedSection className="mt-8">
            <Copy>
              The content library is designed to support CBSE, ICSE, IGCSE, IB and State Board
              curricula, with scope for adaptation to other curricula.
            </Copy>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>A Truly Interactive Learning Experience</SectionTitle>
          <div className="mt-7 space-y-6">
            <Copy>
              Science Lab is designed to go beyond videos and demonstrations. Students can actively
              interact with the simulations, change parameters, observe outcomes and repeat
              experiments.
            </Copy>
          </div>
        </AnimatedSection>
        <div className="mt-10">
          <FeatureGrid items={interactiveFeatures} />
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>Safe Science Learning</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>
                Some scientific concepts and experiments can be difficult, expensive or hazardous
                to recreate in a conventional school laboratory.
              </Copy>
              <Copy>
                Science Lab provides a controlled environment where students can explore such
                concepts safely.
              </Copy>
              <Copy>
                Students can experience scenarios such as understanding momentum through automobile
                crashes, exploring terminal velocity through a skydiving scenario, working with
                acids or examining contaminated objects—without the physical risks associated with
                recreating these situations in a traditional environment.
              </Copy>
              <Copy>
                This makes virtual simulation a valuable complement to physical laboratory learning.
              </Copy>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <AnimatedSection>
            <SectionTitle>For Students</SectionTitle>
            <h3 className="mt-4 font-heading text-2xl font-semibold text-primary">
              Learn by Doing
            </h3>
            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              Science Lab enables students to actively participate in their learning rather than
              simply observe a demonstration.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <p className="mb-5 text-sm font-bold tracking-[0.14em] text-accent uppercase">
              Students can:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {studentActivities.map((activity) => (
                <li key={activity} className="rounded-xl border border-border bg-card p-4 text-sm leading-6">
                  {activity}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
              The platform is designed to provide students with an opportunity to experiment
              without worrying about laboratory equipment, materials or limited laboratory time.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>For Teachers</SectionTitle>
            <h3 className="mt-4 font-heading text-2xl font-semibold text-primary sm:text-3xl">
              A Powerful Teaching & Demonstration Tool
            </h3>
            <div className="mt-7 space-y-6">
              <Copy>
                Science Lab is not only a student learning platform. It can also become a powerful
                resource for teachers.
              </Copy>
              <Copy>
                Teachers can use simulations to explain difficult concepts, demonstrate experiments
                in the classroom, show real-world applications and create greater student engagement.
              </Copy>
              <Copy>
                The platform can also be used for pre-lab preparation and assessment, allowing
                students to familiarise themselves with experiments before entering a physical
                laboratory and use module quizzes to assess their understanding.
              </Copy>
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                Teachers can use Science Lab for:
              </p>
            </div>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={teacherUses} columns="md:grid-cols-2 lg:grid-cols-3" />
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionTitle>For Schools</SectionTitle>
          <h3 className="mt-4 font-heading text-2xl font-semibold text-primary sm:text-3xl">
            Extending the Science Lab Beyond the Laboratory
          </h3>
          <div className="mt-7 space-y-6">
            <Copy>
              Science Lab allows schools to supplement their existing physical laboratories with a
              digital, interactive learning environment.
            </Copy>
            <Copy>
              It can help schools provide students with additional opportunities to experiment,
              practice and revise concepts without the limitations associated with physical
              laboratory infrastructure.
            </Copy>
            <Copy>
              The platform is designed to work across laptops, desktops, Chromebooks, tablets,
              mobile devices, Smart TVs and Smart Boards, making it suitable for different school
              technology environments. No specialised VR hardware is required.
            </Copy>
          </div>
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-12">
          <AnimatedSection>
            <SectionTitle>Curriculum-Aligned Learning</SectionTitle>
            <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
              Science Lab&apos;s content library is mapped to major school curricula, including:
            </p>
            <p className="mt-5 font-heading text-xl font-semibold text-foreground sm:text-2xl">
              CBSE | ICSE | IGCSE | IB | State Boards
            </p>
            <div className="mt-7 space-y-6">
              <Copy>
                This curriculum mapping helps schools integrate virtual experiments into their
                existing academic structure rather than treating the platform as a completely
                separate learning program.
              </Copy>
              <Copy>
                The platform is also designed around the principles of conceptual understanding,
                practical learning and real-world application, making it relevant to schools looking
                to strengthen STEM education.
              </Copy>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <SectionTitle>Science Lab & NEP 2020</SectionTitle>
            <div className="mt-7">
              <Copy>
                Science Lab supports the adoption of technology-enabled and experiential approaches
                to learning aligned with the direction of National Education Policy 2020.
              </Copy>
              <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
                Its emphasis on practical learning, experimentation, technology-enabled education and
                virtual laboratory experiences can complement schools&apos; efforts to create more
                engaging and experiential STEM learning environments.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionTitle>The Science Lab Advantage</SectionTitle>
          </AnimatedSection>
          <div className="mt-10">
            <FeatureGrid items={advantages} columns="sm:grid-cols-2 lg:grid-cols-3" />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <SectionTitle>From Virtual Experimentation to Real-World Understanding</SectionTitle>
            <div className="mt-7 space-y-6">
              <Copy>
                Science Lab is not intended to replace physical laboratories. Instead, it provides
                a complementary learning environment that enables students to prepare, practice,
                explore and reinforce concepts before, during or after physical laboratory
                experiences.
              </Copy>
              <Copy>
                The ultimate objective is to make science more accessible, interactive and
                application-oriented—helping students move from memorising scientific concepts to
                understanding how science works in the real world.
              </Copy>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection className="max-w-4xl">
          <SectionTitle>Technology That Brings Science to Life</SectionTitle>
          <h3 className="mt-6 font-heading text-3xl font-semibold text-primary">Science Lab</h3>
          <p className="mt-3 font-heading text-2xl font-medium text-foreground">
            The Virtual Lab of Tomorrow
          </p>
          <p className="mt-3 font-heading text-xl font-medium text-secondary">
            Experience. Observe. Learn.
          </p>
          <h3 className="mt-10 font-heading text-2xl font-semibold text-foreground">
            Bring Science to Life in Your School
          </h3>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Request a Demo
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Talk to Our Education Team
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Bring Science Lab to Your School
            </a>
          </div>
           <div className="mt-10 border-t border-border pt-8">
             <p className="text-sm font-bold tracking-[0.14em] text-accent uppercase">Resources</p>
             <div className="mt-4 flex flex-wrap gap-3">
               {scienceLabResources.map((resource) => (
                 <a
                   key={resource.url}
                   href={resource.url}
                   target="_blank"
                   rel="noreferrer"
                   className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 >
                   {resource.title}
                 </a>
               ))}
             </div>
           </div>
        </AnimatedSection>
      </section>
    </>
  );
}