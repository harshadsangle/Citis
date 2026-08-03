import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ClientLogoCarousel } from "@/components/shared/ClientLogoCarousel";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatsCounter } from "@/components/shared/StatsCounter";
import { TestimonialsSlider } from "@/components/shared/TestimonialsSlider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HOME_CLIENTS, HOME_TESTIMONIALS, SITE_CONFIG } from "@/lib/constants";

const educationShifts = [
  {
    title: "From content delivery to capability building",
    description: "Learners need applied skills, portfolios, and mentorship — not only lectures and exams.",
  },
  {
    title: "From siloed departments to industry ecosystems",
    description: "Universities and schools thrive when employers co-design pathways and assess outcomes.",
  },
  {
    title: "From one-size curricula to personalized journeys",
    description: "Technology enables adaptive learning paths that respect pace, interest, and career goals.",
  },
];

const beyondCurriculum = [
  "Live industry projects and hackathons",
  "Faculty development and pedagogy labs",
  "Career readiness and soft-skill studios",
  "Incubation support for student ventures",
];

const collaborationPillars = [
  {
    icon: GraduationCap,
    title: "University Solutions",
    description: "Curriculum modernization, CoEs, and IILP programs that raise employability.",
    href: "/engagements/university",
  },
  {
    icon: School,
    title: "School Solutions",
    description: "ICT integration, STEM labs, and tomorrow’s classroom experiences.",
    href: "/engagements/school",
  },
  {
    icon: BriefcaseBusiness,
    title: "Placements & Internships",
    description: "Structured pipelines from campus to career with mentor-led readiness.",
    href: "/engagements/placements",
  },
  {
    icon: Award,
    title: "Centres of Excellence",
    description: "Domain labs that become lasting institutional capability hubs.",
    href: "/engagements/centre-of-excellence",
  },
];

const whyChoose = [
  {
    title: "Industry-first pedagogy",
    description: "Programs co-created with practitioners so learning maps to real roles.",
  },
  {
    title: "Measurable learner outcomes",
    description: "We track skills, projects, certifications, and placement readiness — not vanity metrics.",
  },
  {
    title: "Institutional partnership model",
    description: "Flexible collaboration for universities, schools, skilling bodies, and enterprises.",
  },
  {
    title: "Premium learning experiences",
    description: "Academies in AI, app development, and entrepreneurship with mentor networks.",
  },
];

const featuredProducts = [
  {
    title: "AI Future Academy",
    description: "Hands-on AI, ML, and generative intelligence pathways for students and professionals.",
    href: "/products/ai-future-academy",
    icon: Sparkles,
  },
  {
    title: "AppWizz Academy",
    description: "Full-stack and mobile development with portfolio-driven project studios.",
    href: "/products/appwizz-academy",
    icon: BookOpen,
  },
  {
    title: "MoxieMind Academy",
    description: "Entrepreneurship, design thinking, and venture building for campus innovators.",
    href: "/products/moxiemind",
    icon: Lightbulb,
  },
];

const latestBlogs = [
  {
    title: "Building industry-ready graduates in the age of AI",
    category: "Higher Education",
    href: "/highlights/blogs/industry-ready-graduates-ai",
  },
  {
    title: "How STEM labs transform school learning outcomes",
    category: "Schools",
    href: "/highlights/blogs/stem-labs-school-outcomes",
  },
  {
    title: "Designing Centres of Excellence that actually last",
    category: "Institutions",
    href: "/highlights/blogs/centres-of-excellence-that-last",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#e8f1fa_45%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#10233e_55%,#0f172a_100%)]" />
        <div className="absolute top-[-12rem] right-[-6rem] -z-10 size-[36rem] rounded-full bg-[#0F4C81]/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] -z-10 size-[28rem] rounded-full bg-[#FF7A00]/10 blur-3xl" />
        <div className="container-site grid min-h-[calc(100vh-var(--header-height))] items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <AnimatedSection>
            <p className="mb-5 font-heading text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              {SITE_CONFIG.name}
            </p>
            <h1 className="max-w-4xl font-heading text-5xl leading-[1.06] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-7xl">
              Empowering education.{" "}
              <span className="text-gradient">Enabling futures.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              CITIS InfoTech partners with universities, schools, industries, and learners to deliver
              technology-enabled education that builds skills, careers, and institutional excellence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href="/partner">
                  Partner with us
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/future-academy">Explore Future Academy</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {["Industry–academia collaboration", "Skill-first academies", "Placement-ready pathways"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.12} className="relative hidden lg:block">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#0F4C81_0%,#1e3a5f_45%,#0f172a_100%)] p-8 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,122,0,.45),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(37,99,235,.5),transparent_40%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-semibold tracking-wide">CITIS InfoTech</span>
                  <Badge className="border-white/20 bg-white/10 text-white">EdTech</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-blue-100 uppercase">Learn. Build. Lead.</p>
                  <p className="mt-4 font-heading text-3xl leading-tight font-semibold">
                    Bridging classrooms to careers with technology-enabled learning.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Universities", "Schools", "Industry"].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-4 text-center text-xs font-semibold backdrop-blur-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="About CITIS"
            title="Technology-enabled education for institutions that lead"
            description="We help educational institutions and industry partners design learning ecosystems that develop future-ready talent."
          />
        </AnimatedSection>
        <AnimatedSection delay={0.08} className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            { title: "Our vision", body: "A world where every learner has access to industry-relevant, technology-powered education." },
            { title: "Our mission", body: "To connect academia and industry through scalable programs, academies, and Centres of Excellence." },
            { title: "Our promise", body: "Premium learning experiences with measurable outcomes for students, faculty, and employers." },
          ].map((item) => (
            <Card key={item.title} className="border-primary/10 bg-card/80">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="text-base leading-7">{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </AnimatedSection>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/about">
              Discover our story
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-slate-100/70 py-20 dark:bg-slate-900/50 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              align="center"
              eyebrow="The changing picture of education"
              title="Learning is being rewritten — institutions must move with it"
              description="CITIS helps partners navigate the shift from traditional instruction to capability-led, industry-connected education."
            />
          </AnimatedSection>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {educationShifts.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.08}>
                <Card className="h-full">
                  <CardHeader>
                    <span className="mb-2 font-heading text-sm font-semibold text-accent">0{index + 1}</span>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="text-base leading-7">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Move beyond curriculum"
              title="Experiences that turn knowledge into competence"
              description="We extend academic programs with projects, mentoring, and career studios that prepare learners for real workplaces."
            />
            <ul className="mt-8 space-y-3">
              {beyondCurriculum.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="rounded-[1.75rem] border border-border bg-[linear-gradient(145deg,#0F4C81_0%,#163a5f_100%)] p-8 text-white sm:p-10">
              <Users className="mb-6 size-10 text-orange-300" />
              <h3 className="font-heading text-2xl font-semibold">Industry–Academia Collaboration</h3>
              <p className="mt-4 text-blue-100 leading-7">
                Through IILP and partnership models, employers shape curricula, mentor cohorts, and open internship
                pipelines — while institutions strengthen reputation and graduate outcomes.
              </p>
              <Button asChild variant="accent" className="mt-8">
                <Link href="/engagements/university">
                  Explore university programs
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-slate-50 py-20 dark:bg-slate-950/40 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Engagements"
              title="Solutions across universities, schools, and skilling"
              description="One partner for institutional transformation — from classroom technology to career outcomes."
            />
          </AnimatedSection>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {collaborationPillars.map((item, index) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={index * 0.06}>
                  <Card className="group h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <CardHeader>
                      <span className="mb-3 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={item.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Learn more
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Why choose us"
            title="A premium partner for education transformation"
            description="Institutions choose CITIS for depth in pedagogy, industry networks, and delivery excellence."
          />
        </AnimatedSection>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {whyChoose.map((item, index) => (
            <AnimatedSection key={item.title} delay={index * 0.06}>
              <div className="flex gap-4 rounded-2xl border border-border bg-card p-6">
                <span className="font-heading text-2xl font-semibold text-primary/40">0{index + 1}</span>
                <div>
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-7">{item.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[linear-gradient(180deg,#0F4C81_0%,#0c3a63_100%)] py-20 text-white sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              align="center"
              className="[&_*]:text-white [&_p]:text-blue-100"
              eyebrow="Impact in numbers"
              title="Trusted by institutions shaping tomorrow’s workforce"
              description="Our programs scale across campuses while staying personal for every learner."
            />
          </AnimatedSection>
          <AnimatedSection delay={0.1} className="mt-12">
            <StatsCounter />
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            align="center"
            eyebrow="Testimonials"
            title="Voices from campuses and industry"
            description="Leaders who partner with CITIS to raise learning and employability outcomes."
          />
        </AnimatedSection>
        <AnimatedSection delay={0.1} className="mt-12">
          <TestimonialsSlider items={HOME_TESTIMONIALS} />
        </AnimatedSection>
      </section>

      <section className="border-y border-border bg-slate-100/60 py-16 dark:bg-slate-900/40">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              align="center"
              eyebrow="Partners"
              title="Institutions and organizations we work with"
              description="A growing network of universities, schools, and industry collaborators."
            />
          </AnimatedSection>
          <AnimatedSection delay={0.08} className="mt-10">
            <ClientLogoCarousel logos={HOME_CLIENTS} />
          </AnimatedSection>
        </div>
      </section>

      <section className="container-site py-20 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Featured products"
            title="Academies that build tomorrow’s skills"
            description="Structured learning experiences for AI, software, and entrepreneurship."
          />
        </AnimatedSection>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product, index) => {
            const Icon = product.icon;
            return (
              <AnimatedSection key={product.title} delay={index * 0.07}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-11 place-items-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{product.title}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={product.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      View academy
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-slate-50 py-20 dark:bg-slate-950/30 sm:py-24">
        <div className="container-site">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <AnimatedSection>
              <SectionHeading
                eyebrow="Latest insights"
                title="Ideas shaping the future of learning"
                description="Perspectives from our education, industry, and product teams."
              />
            </AnimatedSection>
            <Button asChild variant="outline">
              <Link href="/highlights/blogs">View all blogs</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {latestBlogs.map((blog, index) => (
              <AnimatedSection key={blog.title} delay={index * 0.06}>
                <Link href={blog.href} className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                  <Badge variant="secondary">{blog.category}</Badge>
                  <h3 className="mt-4 font-heading text-lg font-semibold leading-snug group-hover:text-primary">
                    {blog.title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Read article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Ready to transform learning?"
        title="Let’s build the next chapter of your institution’s education journey"
        description="Talk to our team about partnerships, academies, Centres of Excellence, or placement programs."
        primaryHref="/contact"
        primaryLabel="Contact us"
        secondaryHref="/partner"
        secondaryLabel="Partnership inquiry"
      />
    </>
  );
}
