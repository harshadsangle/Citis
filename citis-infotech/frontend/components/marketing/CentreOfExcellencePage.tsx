import {
  Brain,
  Shield,
  Cpu,
  Users,
  FlaskConical,
  Handshake,
  Lightbulb,
  Award,
  ArrowRight,
  Building2,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTASection } from "@/components/shared/CTASection";

/* ─── Services Data ─────────────────────────────────────────────────────── */

const services = [
  {
    num: "01",
    icon: Building2,
    title: "CoE Strategy & Design",
    body: [
      "CITIS works with institutional leadership to define the vision, objectives, technology focus areas and operating model for the Centre of Excellence.",
      "We help institutions develop a roadmap covering infrastructure, curriculum, faculty, students, industry engagement, research and sustainability.",
    ],
  },
  {
    num: "02",
    icon: Cpu,
    title: "Infrastructure & Technology Enablement",
    body: [
      "A successful CoE requires appropriate technology infrastructure. CITIS can support institutions in defining and implementing the technology environment required for AI, cybersecurity and other advanced technology domains.",
      "This may include computing infrastructure, software platforms, cloud environments, specialised labs, cybersecurity environments and learning technologies.",
    ],
  },
  {
    num: "03",
    icon: BookOpen,
    title: "Curriculum & Program Development",
    body: [
      "CITIS can help institutions develop structured learning pathways around the CoE's technology focus areas.",
      "Programs can include certification courses, electives, Minor and Honours programs, advanced technology programs, workshops, bootcamps and project-based learning.",
    ],
  },
  {
    num: "04",
    icon: Users,
    title: "Faculty Development",
    body: [
      "Faculty capability is critical to the sustainability of a Centre of Excellence. CITIS provides faculty development programs designed to build practical capabilities in emerging technologies.",
      "Programs can include faculty workshops, Faculty Development Programs, Train-the-Trainer initiatives, certifications and hands-on technology training.",
    ],
  },
  {
    num: "05",
    icon: FlaskConical,
    title: "Student Training & Projects",
    body: [
      "The CoE can become a platform for students to develop practical technology skills through structured training, projects, hackathons, competitions and innovation challenges.",
      "Students can move progressively from learning concepts to building applications and solving real-world problems.",
    ],
  },
  {
    num: "06",
    icon: Handshake,
    title: "Industry Interaction",
    body: [
      "CITIS facilitates industry engagement through expert sessions, technology workshops, mentoring, industry projects, hackathons, internships and collaborative initiatives.",
      "This helps institutions ensure that the CoE remains connected to evolving industry requirements.",
    ],
  },
  {
    num: "07",
    icon: Lightbulb,
    title: "Research & Innovation",
    body: [
      "Centres of Excellence can provide an environment for faculty and students to explore research and innovation opportunities in emerging technologies.",
      "CITIS can support institutions in identifying research themes, developing projects, conducting innovation challenges and exploring collaborations with industry and technology ecosystems.",
    ],
  },
  {
    num: "08",
    icon: Award,
    title: "Certifications & Career Pathways",
    body: [
      "The CoE can integrate industry-recognised certifications and skill assessments into the learning ecosystem, enabling students and professionals to demonstrate their competencies.",
      "This can strengthen the connection between institutional learning, industry skills and career opportunities.",
    ],
  },
];

const ecosystemPartners = [
  {
    name: "NVIDIA",
    body: "Through the NVIDIA ecosystem, institutions can explore advanced capabilities in AI, accelerated computing, Generative AI and GPU-accelerated technologies. This can support advanced learning, faculty development, research and AI innovation initiatives.",
  },
  {
    name: "Cisco",
    body: "Cisco's technology ecosystem provides opportunities to build capabilities in networking, cybersecurity and digital infrastructure. This can strengthen practical learning and industry-oriented skill development, particularly within cybersecurity-focused initiatives.",
  },
  {
    name: "TCS",
    body: "Through engagement with TCS and the wider industry ecosystem, institutions can explore opportunities around industry exposure, technology skills, projects, employability and real-world applications.",
  },
];

const aiEcosystemSteps = [
  "AI Infrastructure",
  "Faculty Enablement",
  "Student Learning",
  "Projects",
  "Research",
  "Innovation",
  "Industry Collaboration",
];

const innovationSteps = [
  "Learn",
  "Practise",
  "Build",
  "Innovate",
  "Research",
  "Collaborate",
  "Certify",
  "Create Impact",
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function CentreOfExcellencePage() {
  return (
    <div className="pb-24">
      {/* ── Intro ── */}
      <AnimatedSection>
        <section className="container-site max-w-4xl py-16 sm:py-24 space-y-6">
          <p className="text-lg text-foreground/80 leading-relaxed">
            CITIS Infotech helps universities, colleges and other institutions establish Centres of Excellence (CoEs) that create a sustained ecosystem for learning, research, innovation, industry engagement and advanced technology adoption.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            Our Centres of Excellence are designed to go beyond a physical laboratory or training centre. They bring together technology infrastructure, industry partnerships, curriculum, faculty development, student projects, research, certifications and innovation to create an institutional capability that can evolve with technology.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
            CITIS currently offers Centres of Excellence focused on Artificial Intelligence and Cyber Security, with access to industry expertise and technology ecosystems through partnerships and associations with organisations such as NVIDIA, Cisco and TCS.
          </p>
        </section>
      </AnimatedSection>

      {/* ── CoE for AI ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Centre of Excellence for AI</h2>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Artificial Intelligence is becoming a foundational technology across industries. An AI Centre of Excellence provides an institution with the infrastructure, expertise and ecosystem required to build meaningful capabilities in AI and emerging technologies.
            </p>
            <p className="text-foreground/80 leading-relaxed">
               CITIS&apos;s AI CoE can support areas including Artificial Intelligence, Generative AI, Machine Learning, Deep Learning, Computer Vision, Natural Language Processing, Data Science, Agentic AI and AI applications.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              The CoE can serve students, faculty, researchers and industry professionals through training, projects, hackathons, research initiatives, industry interactions and innovation programs.
            </p>
            <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
              <Image
                src="/images/centre-of-excellence-ai-lab.jpg"
                alt="Students learning in an AI Centre of Excellence computer lab"
                width={1600}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            {/* AI CoE Ecosystem flow */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-4">AI CoE Ecosystem</p>
              <div className="flex flex-wrap items-center gap-2">
                {aiEcosystemSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap">
                      {step}
                    </span>
                    {i < aiEcosystemSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CoE for Cyber Security ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Centre of Excellence for Cyber Security</h2>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Cybersecurity has become a strategic requirement for organisations across every sector. A Cyber Security Centre of Excellence enables institutions to build capabilities in cybersecurity education, practical training, awareness, research and industry-oriented skill development.
            </p>
            <p className="text-foreground/80 leading-relaxed">
               CITIS&apos;s Cyber Security CoE can cover areas such as Cybersecurity Fundamentals, Ethical Hacking, Network Security, Cloud Security, Application Security, Digital Forensics, Security Operations and Cyber Risk.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              The CoE can provide hands-on learning environments, practical exercises, simulations, projects, certifications and industry engagement to help learners develop skills relevant to the rapidly evolving cybersecurity landscape.
            </p>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <Image
                src="/images/centre-of-excellence-cyber-lab.jpg"
                alt="Students collaborating in a cyber security laboratory"
                width={1280}
                height={720}
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Services ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-24">
          <div className="container-site max-w-6xl space-y-12">
            <SectionHeading
              title="Services Offered by CITIS"
              align="left"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Card key={svc.num} className="border border-border bg-background h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mt-0.5">
                          <Icon className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-orange-500 mb-0.5">{svc.num}</p>
                          <CardTitle className="text-base leading-snug">{svc.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {svc.body.map((para, i) => (
                        <p key={i} className="text-sm text-foreground/75 leading-relaxed">{para}</p>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Technology & Industry Ecosystem ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-24">
          <div className="container-site max-w-5xl space-y-10">
            <SectionHeading
              title="Our Technology & Industry Ecosystem"
              align="left"
            />
            <p className="text-foreground/80 leading-relaxed -mt-4">
              CITIS believes that a strong Centre of Excellence requires access to the right technology and industry ecosystem. We work with leading technology and industry organisations to bring relevant expertise, platforms, learning resources and industry exposure into institutional environments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {ecosystemPartners.map((partner) => (
                <Card key={partner.name} className="border border-border bg-slate-50 dark:bg-slate-900/50 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-600 dark:text-orange-400">{partner.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/75 leading-relaxed">{partner.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-foreground/80 leading-relaxed pt-2">
              Our objective is to bring technology, academia and industry together to create Centres of Excellence that produce skills, research, innovation and measurable institutional impact.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── From Lab to Innovation Ecosystem ── */}
      <AnimatedSection>
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 text-white">
          <div className="container-site max-w-5xl space-y-10 text-center">
            <div>
              <p className="text-sm font-semibold text-orange-400 uppercase tracking-widest mb-3">From Lab to Innovation Ecosystem</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">A CITIS Centre of Excellence is envisioned as a continuous ecosystem:</h2>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2">
              {innovationSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium whitespace-nowrap">
                    {step}
                  </span>
                  {i < innovationSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-white/75 leading-relaxed max-w-3xl mx-auto">
              The ultimate objective is to establish an institutional capability that remains relevant beyond a single program or academic year—creating a platform for students, faculty, researchers and industry to learn, collaborate and innovate together.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CTA ── */}
      <AnimatedSection>
        <div className="container-site max-w-4xl pt-20">
          <CTASection
            title="Build a Centre of Excellence"
            description="Partner with CITIS to establish an AI or Cyber Security Centre of Excellence at your institution."
            primaryLabel="Schedule a Consultation"
            primaryHref="/contact"
            secondaryLabel="Download Brochure"
            secondaryHref="mailto:support@citis.in?subject=Centre of Excellence Brochure Request"
          />
        </div>
      </AnimatedSection>
    </div>
  );
}
