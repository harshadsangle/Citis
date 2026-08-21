import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const opportunities = [
  {
    title: "1. Technology Trainers",
    tagline: "Help learners discover the power of technology.",
    description:
      "We are looking for enthusiastic trainers who can deliver technology and future-skills programs to schools, colleges and learning institutions.",
    listTitle: "Key areas may include:",
    list: [
      "Artificial Intelligence & Generative AI",
      "Coding & Programming",
      "Computational Thinking",
      "Python",
      "App Development",
      "Emerging Technologies",
      "Digital Skills",
      "STEM & Technology Projects",
    ],
    requirementsTitle: "What we're looking for:",
    requirements: [
      "Strong technical knowledge in one or more relevant domains",
      "Good communication and presentation skills",
      "Ability to engage students and make technical concepts easy to understand",
      "Passion for teaching and mentoring",
      "Willingness to travel to educational institutions, where required",
    ],
    closing:
      "Ideal for: Technology professionals, educators, trainers, engineering graduates and technology enthusiasts.",
  },
  {
    title: "2. Content Developers",
    tagline: "Turn knowledge into engaging learning experiences.",
    description:
      "CITIS is looking for creative and technically strong content developers to create curriculum, learning resources and digital educational content.",
    listTitle: "Key responsibilities:",
    list: [
      "Develop course curriculum and learning pathways",
      "Create lesson plans, presentations, assignments and assessments",
      "Develop technology and AI learning content",
      "Convert complex concepts into simple, learner-friendly formats",
      "Create project-based and experiential learning activities",
      "Research emerging technologies and education trends",
      "Work with academic and technology teams to continuously improve content",
    ],
    requirementsTitle: "What we're looking for:",
    requirements: [
      "Strong written and communication skills",
      "Good understanding of education and instructional design",
      "Knowledge of technology, AI, coding or STEM is an advantage",
      "Ability to research, structure and simplify information",
      "Creativity and attention to detail",
    ],
  },
  {
    title: "3. Data Analyst",
    tagline: "Turn data into insights that drive better decisions.",
    description:
      "We are looking for analytical professionals who can transform educational, operational and business data into meaningful insights.",
    listTitle: "Key responsibilities:",
    list: [
      "Collect, clean and analyse data",
      "Develop dashboards and management reports",
      "Identify trends, patterns and performance indicators",
      "Analyse student, institutional and business data",
      "Support data-driven decision-making",
      "Develop performance metrics and analytical models",
      "Work with technology, academic and business teams",
    ],
    requirementsTitle: "What we're looking for:",
    requirements: [
      "Strong analytical and problem-solving skills",
      "Proficiency in Excel and data analysis tools",
      "Knowledge of SQL, Power BI/Tableau, Python or similar tools is an advantage",
      "Ability to communicate insights clearly",
      "Curiosity and attention to detail",
    ],
  },
  {
    title: "4. Business Development & Sales",
    tagline: "Take future-ready education solutions to institutions across India.",
    description:
      "We are looking for ambitious professionals who can help CITIS expand its presence across schools, colleges, universities and organizations.",
    listTitle: "Key responsibilities:",
    list: [
      "Identify and develop new business opportunities",
      "Connect with schools, colleges and educational institutions",
      "Present CITIS products and solutions to decision-makers",
      "Build and manage institutional relationships",
      "Generate leads and manage the sales pipeline",
      "Conduct product demonstrations and presentations",
      "Develop partnerships and institutional collaborations",
      "Achieve defined business development and revenue targets",
    ],
    requirementsTitle: "What we're looking for:",
    requirements: [
      "Strong communication and relationship-building skills",
      "Sales or business development experience",
      "Experience in education, EdTech, technology or institutional sales is an advantage",
      "Confidence in making presentations and conducting meetings",
      "Willingness to travel",
      "Strong ownership and target orientation",
    ],
  },
] as const;

const reasonsToJoin = [
  {
    title: "Work at the Intersection of Education & Technology",
    description:
      "Be part of initiatives involving AI, EdTech, coding, digital learning, skill development and education transformation.",
  },
  {
    title: "Learn & Grow",
    description:
      "Work with multidisciplinary teams and continuously develop your professional and technical capabilities.",
  },
  {
    title: "Build Meaningful Solutions",
    description:
      "Your work can directly contribute to creating better learning experiences for students and educators.",
  },
  {
    title: "Be Part of an Innovation-Driven Team",
    description:
      "CITIS brings together education, technology, content, data and business to create future-ready solutions.",
  },
] as const;

const values = [
  "Curious — always willing to learn.",
  "Creative — willing to challenge conventional approaches.",
  "Collaborative — comfortable working across teams.",
  "Responsible — committed to quality and outcomes.",
  "Adaptable — ready to work in a rapidly changing technology environment.",
  "Future-focused — excited about what technology can do for education.",
];

function OpportunityCard({
  opportunity,
  index,
}: {
  opportunity: (typeof opportunities)[number];
  index: number;
}) {
  return (
    <AnimatedSection delay={index * 0.05}>
      <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h3 className="font-heading text-2xl font-semibold">{opportunity.title}</h3>
        <p className="mt-3 font-heading text-lg font-medium text-primary">{opportunity.tagline}</p>
        <p className="mt-5 text-base leading-8 text-muted-foreground">{opportunity.description}</p>

        <h4 className="mt-7 font-heading text-lg font-semibold">{opportunity.listTitle}</h4>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          {opportunity.list.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-secondary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h4 className="mt-7 font-heading text-lg font-semibold">{opportunity.requirementsTitle}</h4>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
          {opportunity.requirements.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {"closing" in opportunity && (
          <p className="mt-7 border-t border-border pt-5 text-sm font-medium leading-7 text-foreground">
            {opportunity.closing}
          </p>
        )}
        <Button asChild variant="accent" className="mt-8">
          <Link
            href={`/careers/apply?role=${encodeURIComponent(opportunity.title.replace(/^\d+\.\s*/, ""))}`}
          >
            Apply Now
          </Link>
        </Button>
      </article>
    </AnimatedSection>
  );
}

export function CareersPage() {
  return (
    <>
      <section className="border-b border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <div className="space-y-6">
              <p className="font-heading text-2xl font-medium text-primary sm:text-3xl">
                Build the Future of Learning with Us
              </p>
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                At CITIS, we believe that education is being transformed by technology, Artificial
                Intelligence, skills and innovation. We are building solutions that help students,
                educators, institutions and organizations become future-ready.
              </p>
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                If you are passionate about technology, education, content, data, sales or
                innovation, we invite you to join our growing team.
              </p>
            </div>
            <p className="mt-10 font-heading text-xl font-semibold text-primary sm:text-2xl">
              Be part of the transformation.
            </p>
            <p className="mt-3 font-heading text-lg font-medium text-foreground sm:text-xl">
              Learn. Create. Innovate. Grow with CITIS.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Current Opportunities
          </h2>
        </AnimatedSection>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {opportunities.map((opportunity, index) => (
            <OpportunityCard key={opportunity.title} opportunity={opportunity} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-16 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Why Join CITIS?
            </h2>
          </AnimatedSection>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {reasonsToJoin.map((reason, index) => (
              <AnimatedSection key={reason.title} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-heading text-xl font-semibold">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{reason.description}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <AnimatedSection>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Who We Are Looking For
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              We value people who are:
            </p>
            <ul className="mt-6 space-y-4">
              {values.map((value) => (
                <li key={value} className="text-base leading-8 text-muted-foreground sm:text-lg">
                  {value}
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-[#e8f4f8] py-16 sm:py-24">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to Build the Future with CITIS?
            </h2>
            <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">
              Whether you are an educator, technologist, content creator, analyst or business
              professional, there could be a place for you at CITIS.
            </p>
            <h3 className="mt-10 font-heading text-2xl font-semibold text-primary">
              Send us your profile
            </h3>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Email:{" "}
              <a
                href="mailto:careers@citis.in"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                careers@citis.in
              </a>
            </p>
            <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">
              Please mention the position you are applying for in the subject line.
            </p>
            <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">
              Subject: Application – [Position Name] – [Your Name]
            </p>
            <p className="mt-10 font-heading text-xl font-semibold text-primary sm:text-2xl">
              Join CITIS.
            </p>
            <p className="mt-3 font-heading text-lg font-medium text-foreground sm:text-xl">
              Build skills. Create impact. Shape the future.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}