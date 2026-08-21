import {
  ArrowRight,
  Briefcase,
  Brain,
  BarChart2,
  Shield,
  Code2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTASection } from "@/components/shared/CTASection";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const placementApproachSteps = [
  "Academic Learning",
  "Skill Development",
  "Industry Exposure",
  "Projects",
  "Certifications",
  "Internships",
  "Career Preparation",
  "Placement",
];

const recruitmentPartnerNames = [
  "Google",
  "Amazon",
  "Microsoft",
  "MRF",
  "Adani Gas",
  "Royal Enfield",
  "Cognizant",
  "Indian Army",
  "Indian Navy",
  "Indian Air Force",
  "Flipkart",
  "Verizon",
  "Cypress",
  "Hyundai",
  "Tata Consultancy Services",
  "Hewlett Packard Enterprise",
  "Deloitte",
  "PayU",
  "SAP",
  "Philips",
  "Danone",
  "VMware",
  "Capgemini",
  "Samsung",
  "ITC",
  "LG",
  "ICICI Bank",
  "Hyatt Regency",
  "The Oberoi",
  "Taj",
  "Vistara",
  "Sun Pharma",
  "Cipla",
  "Saint-Gobain",
  "Oracle",
  "Reliance Industries",
  "Panasonic",
  "EY",
  "IBM",
  "Novartis",
  "HSBC",
  "Mahindra",
] as const;

const recruitmentPartners = recruitmentPartnerNames.map((name, index) => ({
  name,
  logo: `/images/clients/preferred-partner-${String(index + 1).padStart(2, "0")}.png`,
}));

const internshipJourneySteps = [
  "Orientation",
  "Skill Preparation",
  "Industry Matching",
  "Project / Internship",
  "Mentoring",
  "Evaluation",
  "Certification / Experience",
  "Career Readiness",
];

const internshipToPlacementSteps = [
  "Learn",
  "Practice",
  "Intern",
  "Perform",
  "Get Evaluated",
  "Build Experience",
  "Get Hired",
];

const readinessItems = [
  "Technical skill assessment",
  "Aptitude and logical reasoning",
  "Communication skills",
  "Interview preparation",
  "Resume and profile development",
  "Group discussions",
  "Presentation skills",
  "Workplace etiquette",
  "Professional communication",
  "Problem-solving",
  "Digital and technology skills",
  "Mock interviews",
  "Industry interaction",
];

const industryConnectItems = [
  "Industry talks",
  "Guest lectures",
  "Career sessions",
  "Industry visits",
  "Expert mentoring",
  "Technology workshops",
  "Hackathons",
  "Competitions",
  "Industry projects",
  "Internship opportunities",
  "Recruitment drives",
  "Pre-placement interactions",
];

const techDomains = [
  {
    icon: Brain,
    title: "Artificial Intelligence & Generative AI",
    description: "AI, Machine Learning, Generative AI and emerging AI applications.",
  },
  {
    icon: BarChart2,
    title: "Data & Analytics",
    description: "Data Science, Business Analytics, Data Visualisation and related skills.",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Cybersecurity, Network Security, Cloud Security and related domains.",
  },
  {
    icon: Code2,
    title: "Software & Digital Technologies",
    description: "Programming, Full Stack Development, Cloud Computing, Automation and Digital Platforms.",
  },
  {
    icon: Briefcase,
    title: "Business & Professional Skills",
    description: "Digital transformation, business technology, project management, communication and professional skills.",
  },
];

const institutionalSupport = [
  {
    title: "Placement Strategy",
    description: "Assessment of existing placement processes and development of an improved placement framework.",
  },
  {
    title: "Student Employability",
    description: "Identification of skill gaps and deployment of targeted employability programs.",
  },
  {
    title: "Industry Connect",
    description: "Development of relationships with relevant industry and employer networks.",
  },
  {
    title: "Internship Ecosystem",
    description: "Design and facilitation of structured internship opportunities.",
  },
  {
    title: "Pre-Placement Training",
    description: "Technical, aptitude, communication and behavioural preparation.",
  },
  {
    title: "Recruitment Support",
    description: "Coordination of recruitment activities, employer interactions and placement drives.",
  },
  {
    title: "Placement Analytics",
    description: "Tracking participation, skills, internship experience and placement outcomes to help institutions continuously improve their employability strategy.",
  },
];

const studentBenefits = [
  "Practical industry exposure",
  "Understanding of workplace expectations",
  "Opportunities to apply academic learning",
  "Industry-oriented projects",
  "Internship experience",
  "Professional networking",
  "Career guidance",
  "Placement preparation",
  "Technical and soft-skill development",
  "Exposure to emerging technologies",
  "Improved confidence and employability",
];

/* ─── Flow Component ────────────────────────────────────────────────────── */

function FlowDiagram({ steps, label }: { steps: string[]; label: string }) {
  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest">{label}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap">
              {step}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function PlacementsPage() {
  return (
    <div className="pb-24">
      {/* ── Intro ── */}
      <AnimatedSection>
        <section className="container-site max-w-4xl py-16 sm:py-24 space-y-6">
          <p className="text-lg text-foreground/80 leading-relaxed">
            At CITIS Infotech, we believe that the true measure of education is not only what a learner knows, but also how effectively that knowledge can be applied in the workplace. Our Placements and Internships ecosystem is designed to bridge the gap between academic learning and industry requirements by providing learners with opportunities for practical exposure, workplace experience, career preparation and interaction with industry.
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">
             Through our relationships with universities, colleges, industry organizations, technology companies and professional networks, CITIS works towards creating pathways that connect learning, skills, experience and employment. Our approach begins well before the final placement season, with employability development integrated into the learner&apos;s academic and skill-development journey.
          </p>
        </section>
      </AnimatedSection>

      {/* ── Placement Approach ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Our Placement Approach</h2>
              <p className="text-orange-500 font-semibold">From Campus to Career</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Employability is developed over time. CITIS follows a structured approach that helps learners progress from foundational knowledge to industry readiness.
            </p>
            <p className="text-foreground/80 leading-relaxed">Our placement ecosystem can integrate:</p>
            <FlowDiagram steps={placementApproachSteps} label="" />
            <p className="text-foreground/80 leading-relaxed">
              This approach enables students to understand industry expectations early and gives them opportunities to progressively build the technical, professional and behavioural competencies required for the workplace.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Internship Programs ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Internship Programs</h2>
              <p className="text-orange-500 font-semibold">Learn Through Real-World Experience</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
               Internships provide students with an opportunity to experience the professional environment and apply classroom learning to practical situations. CITIS works with institutions and industry partners to facilitate internship opportunities aligned with learners&apos; academic disciplines and career interests.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Depending on the program and partner ecosystem, internships may include industry projects, technology projects, research assignments, virtual internships, on-the-job exposure and structured experiential learning.
            </p>
            <p className="text-foreground/80 leading-relaxed">
               Our objective is to ensure that internships are not treated merely as a mandatory academic requirement, but as an important stage in the learner&apos;s transition from education to employment.
            </p>

            <div className="pt-2">
              <p className="text-base font-semibold mb-4">Internship Journey</p>
              <FlowDiagram steps={internshipJourneySteps} label="" />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Industry Projects ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Industry Projects</h2>
              <p className="text-orange-500 font-semibold">Learning by Solving Real Problems</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Projects provide an important bridge between theoretical learning and workplace application. CITIS encourages learners to participate in practical and industry-oriented projects that allow them to apply their skills to real-world challenges.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Projects may span areas such as Artificial Intelligence, Generative AI, Data Science, Cybersecurity, Cloud Computing, Software Development, Automation, Digital Technologies, Business Analytics and emerging technology applications.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Where appropriate, projects can be undertaken with support from industry professionals, faculty mentors and technology experts.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Placement Readiness ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Placement Readiness</h2>
              <p className="text-orange-500 font-semibold">Preparing Students for the World of Work</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Placement preparation begins with understanding what employers look for in candidates. CITIS supports learners in developing both technical competencies and professional skills required for successful transition into employment.
            </p>
            <p className="text-foreground/80 leading-relaxed">Placement-readiness initiatives may include:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {readinessItems.map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground/80 leading-relaxed">
              The objective is to help students approach recruitment opportunities with greater confidence and preparedness.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Career Guidance ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Career Guidance & Counselling</h2>
              <p className="text-orange-500 font-semibold">Helping Learners Make Informed Career Choices</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Students often have multiple career options but limited visibility into the skills, qualifications and pathways associated with them. CITIS supports learners with career awareness and guidance to help them make informed decisions.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Career-oriented interventions can include understanding career opportunities, identifying relevant technology and professional domains, mapping skills to careers and creating individual learning pathways.
            </p>
            <p className="text-foreground/80 leading-relaxed">
               The focus is on helping learners understand not just &quot;What job can I get?&quot;, but also &quot;What skills and experiences do I need to build the career I want?&quot;
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Industry Connect ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Industry Connect</h2>
              <p className="text-orange-500 font-semibold">Bringing Employers Closer to Learners</p>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Strong industry engagement is an important component of an effective placement ecosystem. CITIS works to facilitate interaction between students and industry through a range of activities.
            </p>
            <p className="text-foreground/80 leading-relaxed">These may include:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {industryConnectItems.map((item) => (
                <div key={item} className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-200/50 dark:border-orange-800/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Such initiatives give learners an opportunity to understand workplace expectations directly from industry professionals.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Placement Partnerships ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-20">
          <div className="container-site max-w-5xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Placement Partnerships</h2>
            <p className="text-foreground/80 leading-relaxed">
              CITIS seeks to develop relationships with organizations across technology, IT services, consulting, BFSI, manufacturing, healthcare, education, retail, digital services and other emerging sectors.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our industry network can support institutions and learners through internships, projects, mentorship, skill development and employment opportunities.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              We work towards developing long-term relationships with employers rather than limiting engagement to individual recruitment drives.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Technology & Emerging Skills ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-24">
          <div className="container-site max-w-5xl space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Technology & Emerging Skills</h2>
              <p className="text-foreground/80 leading-relaxed">
                The employment landscape is changing rapidly. New technologies are creating new roles while transforming existing ones.
              </p>
              <p className="text-foreground/80 leading-relaxed mt-3">
                CITIS focuses on building employability in emerging and high-demand domains such as:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {techDomains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <Card key={domain.title} className="border border-border bg-background h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-orange-500" />
                        </div>
                        <CardTitle className="text-sm leading-snug">{domain.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/70 leading-relaxed">{domain.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-foreground/80 leading-relaxed">
              This technology-focused approach helps learners prepare for a workplace where digital and AI capabilities are increasingly becoming relevant across industries.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Internship-to-Placement Pathway ── */}
      <AnimatedSection>
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20 text-white">
          <div className="container-site max-w-5xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Internship-to-Placement Pathway</h2>
              <p className="text-white/70 leading-relaxed">
                Where opportunities permit, internships can become an important pathway towards employment. Students who demonstrate strong technical capabilities, professional behavior and performance during an internship may be considered for future opportunities by participating organizations.
              </p>
              <p className="text-white/70 leading-relaxed mt-3">CITIS encourages a structured progression:</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {internshipToPlacementSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium whitespace-nowrap">
                    {step}
                  </span>
                  {i < internshipToPlacementSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-white/70 leading-relaxed">
              While employment outcomes depend on individual performance, employer requirements and available opportunities, this approach helps create a stronger bridge between education and the workplace.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Placement Support for Institutions ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-24">
          <div className="container-site max-w-5xl space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Placement Support for Institutions</h2>
              <p className="text-foreground/80 leading-relaxed">
                CITIS can work with universities and colleges to strengthen their overall placement ecosystem rather than focusing only on the final recruitment process.
              </p>
              <p className="text-foreground/80 leading-relaxed mt-3">Our institutional support can include:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {institutionalSupport.map((item) => (
                <Card key={item.title} className="border border-border bg-slate-50 dark:bg-slate-900/50 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-orange-600 dark:text-orange-400">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/75 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Benefits ── */}
      <AnimatedSection>
        <section className="bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-24">
          <div className="container-site max-w-5xl space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Students */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Benefits to Students</h2>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  The CITIS Placements &amp; Internships ecosystem aims to provide learners with:
                </p>
                <ul className="space-y-2">
                  {studentBenefits.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  The objective is to help students graduate with more than a degree or certificate—with a combination of knowledge, skills, experience and career readiness.
                </p>
              </div>

              {/* Institutions */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Benefits to Universities &amp; Colleges</h2>
                <p className="text-foreground/80 leading-relaxed text-sm">
                   An effective placement and internship ecosystem strengthens an institution&apos;s overall value proposition to students and parents.
                </p>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  CITIS can support institutions in building stronger connections between academics, industry, skills and employment, while helping establish a structured and measurable employability framework.
                </p>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  This can contribute to stronger industry engagement, improved student preparedness, better internship participation and a more systematic approach to career development.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Preferred Recruitment and Internship Partners ─────────────── */}
      <AnimatedSection>
        <section id="preferred-recruitment-partners" className="border-y border-border bg-white py-16 sm:py-20">
          <div className="container-site">
            <SectionHeading
              title="Preferred Recruitment and Internship Partners"
              className="mb-10 text-center"
            />
            <div
              aria-label="Preferred recruitment and internship partners"
              className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[#0F4C81]/15 bg-white py-3 shadow-[0_12px_36px_rgba(15,76,129,0.1)] sm:py-4"
            >
              <div className="overflow-hidden">
                <div
                  className="animate-marquee flex w-max motion-reduce:animate-none"
                  style={{ animationDuration: "42s" }}
                >
                  {[0, 1].map((copy) => (
                    <div
                      key={copy}
                      aria-hidden={copy === 1}
                      className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4"
                    >
                      {recruitmentPartners.map((partner) => (
                        <Image
                          key={`${copy}-${partner.name}`}
                          src={partner.logo}
                          alt={copy === 0 ? partner.name : ""}
                          width={156}
                          height={86}
                          sizes="156px"
                          className="h-16 w-auto shrink-0 object-contain sm:h-20"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Beyond Placement ── */}
      <AnimatedSection>
        <section className="py-16 sm:py-20">
          <div className="container-site max-w-4xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Beyond Placement</h2>
            <p className="text-foreground/80 leading-relaxed">
              CITIS believes that placement should not be viewed as the final destination of education. The larger objective is to develop learners who can enter the workforce, perform effectively, continue learning and grow throughout their careers.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Our Placements and Internships ecosystem therefore forms an integral part of the larger CITIS Education Transformation framework—connecting education with skills, skills with experience, experience with opportunity and opportunity with long-term career growth.
            </p>
            <p className="text-xl font-semibold text-orange-600 dark:text-orange-400 pt-2">
              Learn. Experience. Connect. Launch Your Career.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CTA ── */}
      <AnimatedSection>
        <div className="container-site max-w-4xl pt-4 pb-8">
          <CTASection
            title="Build a Stronger Placement Ecosystem"
            description="Partner with CITIS to strengthen employability, internship opportunities and placement outcomes for your institution."
            primaryLabel="Schedule a Consultation"
            primaryHref="/contact"
            secondaryLabel="Download Brochure"
            secondaryHref="mailto:support@citis.in?subject=Placements and Internships Brochure Request"
          />
        </div>
      </AnimatedSection>
    </div>
  );
}
