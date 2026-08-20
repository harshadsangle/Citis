import Link from "next/link";
import {
  Award,
  BarChart2,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Download,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Monitor,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FeatureGrid, OutcomesList, ProcessTimeline } from "@/components/marketing/MarketingBlocks";
import { CTASection } from "@/components/shared/CTASection";
import type { MarketingItem } from "@/components/marketing/MarketingBlocks";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const progressionModel: (MarketingItem & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    icon: GraduationCap,
    title: "Academic Innovation",
    description:
      "Curriculum modernization aligned with emerging technologies, multidisciplinary education, and future workforce requirements.",
  },
  {
    icon: Briefcase,
    title: "Industry Integrated Learning",
    description:
      "Programs developed jointly with industry experts to ensure students acquire practical, job-ready competencies.",
  },
  {
    icon: Award,
    title: "Centres of Excellence",
    description:
      "State-of-the-art Centres of Excellence in Artificial Intelligence, Cyber Security, Data Science, Cloud Computing, Robotics, IoT, Blockchain, and other emerging technologies.",
  },
  {
    icon: Users,
    title: "Faculty Empowerment",
    description:
      "Continuous Faculty Development Programs (FDPs), Train-the-Trainer initiatives, curriculum workshops, and academic consulting.",
  },
  {
    icon: Monitor,
    title: "Digital Learning Ecosystem",
    description:
      "Learning Management Systems (LMS), AI-enabled learning, virtual laboratories, digital content, assessments, analytics, and blended learning environments.",
  },
  {
    icon: Rocket,
    title: "Career Development",
    description:
      "Internships, live projects, career mentoring, placement readiness, recruitment drives, and entrepreneurship development.",
  },
];

const engagementModels: (MarketingItem & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    icon: Briefcase,
    title: "Industry Integrated Learning Programs (IILP)",
    description:
      "Enable students to gain practical knowledge alongside their university curriculum through industry-designed learning pathways that combine academic concepts with real-world application. Programs include instructor-led sessions, digital learning resources, assessments, projects, internships, and industry-recognized certifications.",
  },
  {
    icon: Award,
    title: "Honours Degree Programs",
    description:
      "Support universities in offering specialized Honours Programs that allow students to build advanced competencies in high-demand domains such as Artificial Intelligence, Cyber Security, Data Science, Cloud Computing, Digital Marketing, and Full Stack Development. Students graduate with deeper specialization and enhanced employability.",
  },
  {
    icon: BookOpen,
    title: "Minor Degree Programs",
    description:
      "Offer multidisciplinary learning opportunities through Minor Degree Programs that enable students to develop expertise outside their primary discipline while enhancing career flexibility.",
  },
  {
    icon: GraduationCap,
    title: "Credit-Based Skill Courses",
    description:
      "Integrate industry-relevant certification courses within university curricula as credit-bearing academic components, allowing students to earn both academic credits and practical skills.",
  },
  {
    icon: LayoutDashboard,
    title: "Open Elective Courses",
    description:
      "Provide students with the flexibility to choose industry-oriented electives from emerging technology domains, entrepreneurship, business, design, and digital skills.",
  },
  {
    icon: Sparkles,
    title: "Value Added Certification Programs",
    description:
      "Short-duration, high-impact certification programs that complement university education by developing practical competencies and preparing students for professional certification examinations.",
  },
  {
    icon: Handshake,
    title: "Industry Curriculum Integration",
    description:
      "Collaborate with academic departments to design curricula aligned with current industry standards, employer expectations, and technological advancements.",
  },
  {
    icon: Monitor,
    title: "Digital Transformation Consulting",
    description:
      "Support institutions in implementing AI-enabled teaching, Learning Management Systems, digital classrooms, analytics, virtual laboratories, and blended learning environments.",
  },
];

const techDomains: (MarketingItem & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    icon: Brain,
    title: "Artificial Intelligence & Machine Learning",
    description:
      "Develop intelligent systems using AI, Generative AI, Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision.",
  },
  {
    icon: Shield,
    title: "Cyber Security",
    description:
      "Build expertise in ethical hacking, digital forensics, penetration testing, cloud security, cyber defence, governance, and information security.",
  },
  {
    icon: BarChart2,
    title: "Data Science & Analytics",
    description:
      "Master data visualization, business intelligence, predictive analytics, Python, Power BI, Tableau, and data-driven decision making.",
  },
  {
    icon: Cloud,
    title: "Cloud Computing",
    description:
      "Gain expertise in Microsoft Azure, AWS, Google Cloud Platform, cloud architecture, DevOps, virtualization, and cloud security.",
  },
  {
    icon: Code2,
    title: "Software Engineering",
    description:
      "Learn Full Stack Development, Mobile App Development, Web Technologies, APIs, Microservices, DevOps, UI/UX, and software engineering best practices.",
  },
  {
    icon: Cpu,
    title: "Industry 4.0 Technologies",
    description:
      "Explore IoT, Robotics, Automation, Digital Twins, Smart Manufacturing, Blockchain, AR/VR, and emerging industrial technologies.",
  },
];

const coeItems = [
  "Industry-designed curriculum",
  "Advanced laboratory setup",
  "Faculty training",
  "Student certifications",
  "Research support",
  "Innovation challenges",
  "Hackathons",
  "Live projects",
  "Startup mentoring",
  "Corporate engagement",
  "Internship opportunities",
];

const fdpItems = [
  "AI for Educators",
  "Outcome-Based Education",
  "Curriculum Design",
  "Emerging Technologies",
  "Digital Pedagogy",
  "Research Methodology",
  "Academic Leadership",
  "Assessment Design",
  "Industry Exposure",
  "Technology Tools for Teaching",
];

const employabilityItems = [
  "Career Assessments",
  "Resume Development",
  "Interview Preparation",
  "Soft Skills",
  "Technical Assessments",
  "Industry Certifications",
  "Mock Interviews",
  "Corporate Networking",
  "Campus Recruitment Drives",
  "Internship Programs",
  "Entrepreneurship Development",
];

const whyChooseItems: (MarketingItem & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    icon: Zap,
    title: "Future-Ready Academic Programs",
    description: "Designed around current and emerging industry requirements.",
    backgroundImage: "/images/future-ready-academic-programs.jpg",
  },
  {
    icon: BookOpen,
    title: "NEP 2020 Alignment",
    description:
      "Supports multidisciplinary education, flexibility, experiential learning, skill development, and holistic student growth.",
    backgroundImage: "/images/nep-2020-alignment.jpg",
  },
  {
    icon: Handshake,
    title: "Industry Partnerships",
    description: "Curriculum co-created with technology leaders and industry experts.",
    backgroundImage: "/images/industry-partnerships.jpg",
  },
  {
    icon: Globe,
    title: "Global Certifications",
    description:
      "International certification pathways that enhance employability and global career opportunities.",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description:
      "Digital learning ecosystem with AI-enabled tools, analytics, adaptive learning, and virtual learning environments.",
    backgroundImage: "/images/ai-powered-learning.jpg",
  },
  {
    icon: CheckCircle2,
    title: "End-to-End Academic Support",
    description:
      "From planning and implementation to assessments, faculty enablement, certifications, internships, and placement support.",
    backgroundImage: "/images/end-to-end-academic-support.jpg",
  },
];

const benefitItems = [
  "Strengthen academic reputation",
  "Improve student employability",
  "Enhance placement outcomes",
  "Increase admissions through differentiated offerings",
  "Introduce industry-relevant academic pathways",
  "Foster innovation and research",
  "Empower faculty with modern pedagogical practices",
  "Build stronger industry collaborations",
  "Support accreditation and quality initiatives",
  "Create sustainable academic value",
];

const implementationSteps: MarketingItem[] = [
  {
    title: "Discover",
    description:
      "Understand institutional goals, academic structure, and strategic priorities.",
    backgroundImage: "/images/implementation-discover.jpg",
  },
  {
    title: "Design",
    description:
      "Develop customized academic solutions aligned with institutional objectives.",
    backgroundImage: "/images/implementation-design.jpg",
  },
  {
    title: "Deploy",
    description:
      "Implement programs through structured project planning, faculty enablement, and technology integration.",
    backgroundImage: "/images/implementation-deploy.jpg",
  },
  {
    title: "Measure",
    description:
      "Track learner engagement, certifications, academic performance, internships, placements, and institutional outcomes.",
    backgroundImage: "/images/implementation-measure.jpg",
  },
  {
    title: "Improve",
    description:
      "Continuously review and enhance academic delivery based on stakeholder feedback and emerging trends.",
    backgroundImage: "/images/implementation-improve.jpg",
  },
];

type EngagementDetail = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  paragraphs: string[];
  listTitle?: string;
  listItems?: string[];
};

const collaborationModels: EngagementDetail[] = [
  {
    id: "iilp",
    title: "Industry Integrated Learning Programs (IILP)",
    subtitle: "Bridge the Gap Between Education and Industry",
    icon: Briefcase,
    paragraphs: [
      "Our flagship Industry Integrated Learning Programs combine academic learning with practical industry knowledge. Designed in collaboration with technology experts and corporate partners, these programs enable students to acquire future-ready skills while pursuing their regular degree.",
      "The programs include instructor-led learning, digital content, hands-on projects, assessments, industry certifications, and internship opportunities, ensuring that graduates are equipped with both academic knowledge and workplace competencies.",
    ],
    listTitle: "Key Benefits",
    listItems: [
      "Industry-designed curriculum",
      "Practical and project-based learning",
      "Global certifications",
      "Live industry sessions",
      "Internship opportunities",
      "Enhanced placement readiness",
      "Academic credit integration",
    ],
  },
  {
    id: "honours",
    title: "Honours Degree Programs",
    subtitle: "Create Specialized Graduates",
    icon: Award,
    paragraphs: [
      "Enable students to earn an Honours Degree by pursuing advanced learning in emerging technology and professional domains alongside their regular degree program.",
      "CITIS designs and delivers complete Honours curricula aligned with university regulations and industry requirements, helping institutions offer differentiated academic pathways.",
    ],
    listTitle: "Popular Honours Domains",
    listItems: [
      "Artificial Intelligence",
      "Data Science",
      "Cyber Security",
      "Cloud Computing",
      "Business Analytics",
      "FinTech",
      "Robotics",
      "Internet of Things",
      "Digital Marketing",
      "Full Stack Development",
    ],
  },
  {
    id: "minor",
    title: "Minor Degree Programs",
    subtitle: "Encourage Multidisciplinary Learning",
    icon: BookOpen,
    paragraphs: [
      "In line with the vision of multidisciplinary education, Minor Degree Programs allow students to gain expertise in complementary disciplines beyond their core specialization.",
      "These programs help learners broaden their career opportunities while developing cross-functional knowledge and skills that are highly valued by employers.",
    ],
  },
  {
    id: "credit-skill",
    title: "Credit-Based Skill Courses",
    subtitle: "Integrate Industry Skills into Academic Credits",
    icon: GraduationCap,
    paragraphs: [
      "CITIS supports universities in embedding industry-relevant certification programs within the curriculum as credit-bearing courses.",
      "Students earn academic credits while simultaneously acquiring practical skills and globally recognized certifications, creating greater academic value without disrupting the existing curriculum.",
    ],
  },
  {
    id: "open-elective",
    title: "Open Elective Programs",
    subtitle: "Give Students the Freedom to Explore Emerging Technologies",
    icon: LayoutDashboard,
    paragraphs: [
      "Offer a wide range of industry-oriented elective courses that allow students to pursue their interests in cutting-edge technologies and interdisciplinary domains.",
      "Our elective portfolio includes Artificial Intelligence, Data Science, Blockchain, Entrepreneurship, Cyber Security, Digital Marketing, Cloud Computing, UI/UX Design, and many more.",
    ],
  },
  {
    id: "certificate",
    title: "Certificate Programs",
    subtitle: "Build Skills Beyond the Classroom",
    icon: Sparkles,
    paragraphs: [
      "Short-term certification programs designed to enhance employability and provide practical expertise in high-demand industry domains.",
      "These programs are ideal for students seeking additional credentials, professionals pursuing upskilling opportunities, and institutions aiming to strengthen their academic offerings.",
    ],
  },
  {
    id: "coe-detail",
    title: "Centre of Excellence (CoE)",
    subtitle: "Build Innovation Hubs Within Your Campus",
    icon: Building2,
    paragraphs: [
      "A Centre of Excellence transforms the campus into an industry-driven innovation ecosystem by combining modern infrastructure, advanced laboratories, expert mentorship, research initiatives, faculty development, and student innovation programs.",
      "Each Centre of Excellence is customized to align with the institution's academic priorities and future vision.",
    ],
    listTitle: "Areas of Excellence",
    listItems: [
      "Artificial Intelligence",
      "Cyber Security",
      "Cloud Computing",
      "Robotics",
      "Data Science",
      "IoT",
      "AR/VR",
      "Blockchain",
      "Electric Vehicles",
      "Industry 4.0 Technologies",
    ],
  },
  {
    id: "fdp-detail",
    title: "Faculty Development Programs (FDP)",
    subtitle: "Empower Educators to Lead Academic Innovation",
    icon: Users,
    paragraphs: [
      "Faculty play a pivotal role in transforming education. Our Faculty Development Programs equip educators with contemporary teaching methodologies, emerging technology knowledge, digital pedagogy, research capabilities, and outcome-based education practices.",
    ],
    listTitle: "Programs include:",
    listItems: [
      "AI for Educators",
      "Digital Teaching & Learning",
      "Outcome-Based Education",
      "Curriculum Design",
      "Emerging Technologies",
      "Research Methodology",
      "Innovation & Entrepreneurship",
      "Assessment & Evaluation Techniques",
    ],
  },
  {
    id: "curriculum-consulting",
    title: "Curriculum Design & Academic Consulting",
    subtitle: "Design Academic Programs That Meet Tomorrow's Needs",
    icon: Handshake,
    paragraphs: [
      "Our academic experts work closely with universities to design curricula that are aligned with industry expectations, regulatory frameworks, and emerging technology trends.",
    ],
    listTitle: "Services include:",
    listItems: [
      "Curriculum Mapping",
      "Course Design",
      "Academic Framework Development",
      "Outcome-Based Education (OBE)",
      "Learning Outcome Mapping",
      "Assessment Framework Design",
      "Academic Quality Enhancement",
    ],
  },
  {
    id: "lms",
    title: "Learning Management System (LMS) & Digital Learning",
    subtitle: "Create a Connected Digital Campus",
    icon: Monitor,
    paragraphs: [
      "CITIS enables institutions to deliver seamless blended and online learning experiences through a comprehensive digital learning ecosystem.",
    ],
    listTitle: "Our platform supports:",
    listItems: [
      "AI-enabled learning",
      "Digital classrooms",
      "Course content management",
      "Student analytics",
      "Assessments",
      "Virtual laboratories",
      "Faculty dashboards",
      "Mobile learning",
      "Learning analytics",
    ],
  },
  {
    id: "industry-connect",
    title: "Industry Connect & Internships",
    subtitle: "Connect Students with the Real World",
    icon: Globe,
    paragraphs: [
      "We facilitate strong engagement between academia and industry through:",
    ],
    listItems: [
      "Guest lectures by industry experts",
      "Live industry projects",
      "Corporate mentoring",
      "Industrial visits",
      "Hackathons",
      "Innovation challenges",
      "Internship opportunities",
      "Campus recruitment initiatives",
    ],
    listTitle: "",
  },
  {
    id: "placement",
    title: "Placement & Career Development",
    subtitle: "Enhancing Employability Through Structured Career Support",
    icon: TrendingUp,
    paragraphs: [
      "CITIS offers comprehensive career development services designed to improve student employability and placement outcomes.",
    ],
    listTitle: "Our services include:",
    listItems: [
      "Career guidance",
      "Employability assessments",
      "Resume development",
      "Interview preparation",
      "Soft skills training",
      "Technical assessments",
      "Mock interviews",
      "Placement readiness",
      "Campus recruitment support",
    ],
  },
  {
    id: "research",
    title: "Research, Innovation & Entrepreneurship",
    subtitle: "Cultivating the Next Generation of Innovators",
    icon: FlaskConical,
    paragraphs: [
      "We support institutions in fostering a culture of research, innovation, and entrepreneurship through incubation support, innovation labs, startup mentoring, intellectual property awareness, and industry-sponsored research initiatives.",
      "Students are encouraged to transform ideas into impactful solutions while developing entrepreneurial capabilities that contribute to economic and societal growth.",
    ],
  },
  {
    id: "customized",
    title: "Customized Academic Partnerships",
    subtitle: undefined,
    icon: Sparkles,
    paragraphs: [
      "Every institution is unique. CITIS offers tailored engagement models based on your academic goals, student profile, regulatory requirements, and institutional vision.",
      "Whether you are looking to introduce a single certification course or undertake a comprehensive academic transformation, we develop a partnership model that aligns with your long-term strategic objectives.",
    ],
  },
];

const whyPartnerItems = [
  "Flexible engagement models",
  "NEP 2020-aligned academic solutions",
  "Industry-integrated curriculum",
  "Global certification pathways",
  "End-to-end implementation support",
  "Faculty development and mentoring",
  "AI-powered digital learning ecosystem",
  "Internship and placement enablement",
  "Outcome-based academic delivery",
  "Long-term institutional partnership",
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export function UniversityPage() {
  return (
    <>
      {/* ── Hero intro strip ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-[#f4f7fb] py-12 dark:bg-slate-900/50 sm:py-16">
        <div className="container-site max-w-4xl">
          <AnimatedSection>
            <p className="text-base leading-8 text-muted-foreground sm:text-lg">
              Empowering Universities and Higher Education Institutions through Industry Integrated
              Learning Programs, Academic Innovation, Centres of Excellence, Artificial Intelligence,
              Global Certifications, Faculty Development, and Outcome-Based Education aligned with
              NEP 2020.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">
                  Schedule a Consultation
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  href={`mailto:support@citis.in?subject=${encodeURIComponent("University Brochure Request")}&body=${encodeURIComponent("Please send me the University Solutions brochure.")}`}
                >
                  <Download className="size-4" />
                  Download University Brochure
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Redefining Higher Education ──────────────────────────────────── */}
      <section className="container-site max-w-4xl py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Redefining Higher Education" />
          <div className="mt-7 space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              The future of higher education demands institutions that are agile, innovative,
              industry-connected, and technology-driven. Universities are expected to produce graduates
              who are not only academically competent but also equipped with practical skills,
              professional certifications, entrepreneurial thinking, and global employability.
            </p>
            <p>
              At CITIS Infotech LLP, we partner with universities to create comprehensive academic
              ecosystems that bridge the gap between education and industry. Our University Solutions
              are designed to support institutions in implementing multidisciplinary education, digital
              transformation, experiential learning, and career-oriented academic pathways while
              complementing the intent of NEP 2020 and institutional academic frameworks.
            </p>
            <p>
              From curriculum design and Industry Integrated Learning Programs to Centres of
              Excellence, AI-powered learning platforms, internships, faculty development, and
              placement support, CITIS serves as a long-term strategic partner in transforming higher
              education.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ── CITIS University Progression Model™ ──────────────────────────── */}
      <section id="university-progression-model" className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="One Partner. Complete Academic Transformation."
              title={
                <>
                  The CITIS University Progression Model
                  <sup className="ml-1 inline-flex size-4 -translate-y-0.5 items-center justify-center rounded-full border border-black text-[0.5rem] font-semibold leading-none align-super sm:size-5 sm:text-[0.6rem]">
                    ™
                  </sup>
                </>
              }
            />
            <div className="mt-5 max-w-3xl space-y-3 text-base leading-8 text-muted-foreground">
              <p>
                Our University Progression Model is a comprehensive framework that enables
                institutions to modernize academic delivery while improving student outcomes,
                institutional reputation, and industry engagement.
              </p>
              <p>
                The model integrates every essential component required for a future-ready university
                ecosystem.
              </p>
            </div>
          </AnimatedSection>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {progressionModel.map((item, index) => {
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

      {/* ── Our University Engagement Models ────────────────────────────── */}
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading title="Our University Engagement Models" />
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            Every university has unique academic goals and institutional priorities. CITIS offers
            flexible collaboration models that can be customized to meet regulatory requirements,
            academic structures, and learner needs.
          </p>
        </AnimatedSection>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engagementModels.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                  <CardHeader>
                    <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="leading-7">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      {/* ── Emerging Technology Domains ───────────────────────────────────── */}
      <FeatureGrid
        eyebrow="Emerging Technology Domains"
        title="Our academic portfolio spans more than 100 future-focused domains designed to meet evolving industry needs."
        items={techDomains}
        columns={3}
      />

      {/* ── Centre of Excellence (overview) ──────────────────────────────── */}
      <OutcomesList
        eyebrow="Centre of Excellence"
        title="Transform your campus into an innovation hub through dedicated Centres of Excellence."
        description="Each CoE provides:"
        outcomes={coeItems}
      />

      {/* ── Faculty Development Programs (overview) ──────────────────────── */}
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Faculty Development Programs"
              title="Empowering educators is central to institutional excellence."
            />
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Our Faculty Development Programs include:
            </p>
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2">
            {fdpItems.map((item, index) => (
              <AnimatedSection key={item} delay={index * 0.05}>
                <Card className="h-full">
                  <CardContent className="flex gap-3 p-5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                    <p className="text-sm leading-6">{item}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Placement & Employability (overview) ─────────────────────────── */}
      <OutcomesList
        eyebrow="Placement & Employability"
        title="Learning is complete only when it leads to meaningful career opportunities."
        description="Our employability framework includes:"
        outcomes={employabilityItems}
      />

      {/* ── Why Universities Choose CITIS ────────────────────────────────── */}
      <FeatureGrid
        eyebrow="Why Universities Choose CITIS"
        title="Why Universities Choose CITIS"
        items={whyChooseItems}
        columns={3}
      />

      {/* ── Benefits for Universities ────────────────────────────────────── */}
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Benefits for Universities"
              title="Partnering with CITIS enables institutions to:"
            />
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefitItems.map((item, index) => (
              <AnimatedSection key={item} delay={index * 0.05}>
                <Card className="h-full">
                  <CardContent className="flex gap-3 p-5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                    <p className="text-sm leading-6">{item}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Implementation Approach ───────────────────────────────────── */}
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <SectionHeading
            align="center"
            eyebrow="Our Implementation Approach"
            title="Our Implementation Approach"
          />
        </AnimatedSection>
        <div className="relative mx-auto mt-12 max-w-6xl">
          <div className="absolute top-8 bottom-8 left-6 w-px bg-border md:top-6 md:right-8 md:bottom-auto md:left-8 md:h-px md:w-auto" />
          <div className="relative grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {implementationSteps.map((step, index) => (
              <AnimatedSection key={step.title} delay={index * 0.08}>
                <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                  {step.backgroundImage && (
                    <>
                      <Image
                        src={step.backgroundImage}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        className="z-0 object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#071221]/90 via-[#0F4C81]/78 to-[#0F4C81]/58" />
                    </>
                  )}
                  <span className="relative z-10 mb-5 grid size-10 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground ring-8 ring-background">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative z-10 font-heading text-lg font-semibold text-white">{step.title}</h3>
                  <p className="relative z-10 mt-2 text-sm leading-6 text-blue-50">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner with CITIS (mid-page CTA) ───────────────────────────── */}
      <section className="container-site py-4 pb-16 sm:pb-24">
        <AnimatedSection>
          <div className="brand-gradient relative overflow-hidden rounded-2xl px-6 py-12 text-white shadow-[0_24px_80px_rgba(15,76,129,.25)] sm:px-12 lg:px-16 lg:py-16">
            <div className="absolute -top-20 -right-20 size-72 rounded-full border border-white/10" />
            <div className="absolute -right-4 -bottom-32 size-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
                Let&rsquo;s Build the University of Tomorrow
              </h2>
              <div className="mt-5 max-w-3xl space-y-4 leading-7 text-blue-100">
                <p>
                  Whether your institution seeks to establish a Centre of Excellence, introduce
                  Honours and Minor Degree Programs, strengthen industry engagement, or implement
                  comprehensive academic transformation, CITIS Infotech LLP is ready to collaborate.
                </p>
                <p>
                  Together, we can build universities that inspire innovation, empower educators,
                  and prepare graduates to lead in the global knowledge economy.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="accent" size="lg">
                  <Link href="/contact">
                    Schedule a Consultation
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contact">Request a Proposal</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Ways to Collaborate ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#f4f7fb] py-16 dark:bg-slate-900/50 sm:py-24">
        <div className="container-site">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Flexible Partnership Models for Future-Ready Institutions"
              title="Ways to Collaborate"
            />
            <div className="mt-6 max-w-4xl space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                At CITIS Infotech LLP, we understand that every educational institution has its own
                vision, academic structure, regulatory framework, and strategic objectives. Therefore,
                we offer flexible collaboration models that seamlessly integrate with existing academic
                systems while delivering measurable outcomes in student success, institutional
                excellence, and industry readiness.
              </p>
              <p>
                Whether your institution is looking to implement Industry Integrated Learning Programs
                (IILP), establish a Centre of Excellence, introduce Honours and Minor Degree Programs,
                strengthen faculty capabilities, or enhance student employability, CITIS serves as
                your long-term academic transformation partner.
              </p>
            </div>
          </AnimatedSection>

          {/* 14 detailed engagement model cards */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {collaborationModels.map((model, index) => {
              const Icon = model.icon;
              return (
                <AnimatedSection key={model.id} delay={(index % 2) * 0.08}>
                  <Card className="h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </span>
                        <div>
                          {model.subtitle && (
                            <p className="mb-1 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                              {model.subtitle}
                            </p>
                          )}
                          <CardTitle className="text-lg leading-tight">{model.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {model.paragraphs.map((para, i) => (
                        <p key={i} className="text-sm leading-7 text-muted-foreground">
                          {para}
                        </p>
                      ))}
                      {model.listItems && model.listItems.length > 0 && (
                        <div>
                          {model.listTitle && (
                            <p className="mb-3 text-xs font-bold tracking-[0.14em] text-foreground uppercase">
                              {model.listTitle}
                            </p>
                          )}
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {model.listItems.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm leading-6">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Industry Connect note after list */}
                      {model.id === "industry-connect" && (
                        <p className="text-sm leading-7 text-muted-foreground">
                          This collaboration ensures students gain valuable workplace exposure before
                          graduation.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Partner with CITIS? ───────────────────────────────────────── */}
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <AnimatedSection>
            <SectionHeading title="Why Partner with CITIS?" />
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyPartnerItems.map((item, index) => (
              <AnimatedSection key={item} delay={index * 0.05}>
                <Card className="h-full">
                  <CardContent className="flex gap-3 p-5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                    <p className="text-sm leading-6">{item}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Let's Shape the Future of Higher Education Together ──────────── */}
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection>
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeading
              align="center"
              title="Let's Shape the Future of Higher Education Together"
            />
            <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>
                At CITIS Infotech LLP, collaboration is more than a partnership—it is a shared
                commitment to creating transformative educational experiences that prepare learners
                for success in an ever-evolving world.
              </p>
              <p>
                Whether your institution seeks to modernize its curriculum, establish a Centre of
                Excellence, introduce Honours and Minor Degree Programs, strengthen faculty
                capabilities, or improve graduate employability, our team is ready to collaborate and
                co-create a future-ready academic ecosystem.
              </p>
              <p className="font-semibold text-foreground">
                Start your transformation journey with CITIS today.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/contact">
                  Schedule a Consultation
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Request a Proposal</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
