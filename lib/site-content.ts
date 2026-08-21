import { IMPORTED_BLOG_POSTS } from "@/lib/imported-blog-posts";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  content: Array<{ heading: string; paragraphs: string[] }>;
};

export const BLOG_POSTS: Article[] = [
  ...(IMPORTED_BLOG_POSTS as Article[]),
  {
    slug: "responsible-ai-campus-learning",
    title: "Building responsible AI literacy across the campus",
    excerpt: "A practical framework for helping faculty and students use generative AI critically, ethically, and confidently.",
    category: "Artificial Intelligence",
    date: "2026-07-18",
    readTime: "7 min read",
    author: "Dr. Maya Rao",
    content: [
      { heading: "AI literacy is now a graduate capability", paragraphs: ["Universities do not need another isolated technology workshop. They need a shared language for understanding where AI adds value, where human judgment remains essential, and how evidence should be evaluated.", "A campus-wide model begins with role-specific learning: foundational literacy for every learner, applied labs for each discipline, and advanced pathways for students building AI systems."] },
      { heading: "Design for responsible practice", paragraphs: ["Responsible use becomes real when it is embedded into assignments and assessment. Learners should document prompts, validate outputs, identify bias, and explain where they exercised judgment.", "Faculty communities of practice help educators redesign authentic assessment while keeping academic integrity, privacy, and accessibility at the centre."] },
      { heading: "Measure confidence and application", paragraphs: ["Track more than course completion. Use scenario assessments, project portfolios, faculty adoption, and student reflections to understand whether capability is moving into practice.", "CITIS InfoTech helps institutions establish this baseline, build contextual learning pathways, and create governance that can evolve with the technology."] },
    ],
  },
  {
    slug: "industry-integrated-learning-playbook",
    title: "An industry-integrated learning playbook for universities",
    excerpt: "How curriculum co-design, mentor-led studios, and live briefs can close the distance between classrooms and careers.",
    category: "Higher Education",
    date: "2026-06-24",
    readTime: "6 min read",
    author: "Anil Krishnan",
    content: [
      { heading: "Start with outcomes, not tools", paragraphs: ["Industry alignment works when academic leaders and employers agree on observable capabilities. Role maps, competency rubrics, and authentic tasks provide a stable foundation even as technology changes.", "This shared outcome map should connect course learning outcomes, practice opportunities, and evidence that a learner can present to an employer."] },
      { heading: "Create a progression of practice", paragraphs: ["Students first explore a professional context, then practice in guided labs, contribute to a team brief, and finally own an end-to-end capstone. Industry mentors add context without replacing faculty leadership.", "Short feedback loops and portfolio reviews make progression visible to learners, institutions, and recruiting partners."] },
      { heading: "Build a sustainable partnership", paragraphs: ["A programme office, faculty enablement, mentor standards, and a semester review cadence turn one-off activity into an institutional model.", "The result is not placement training at the end of a degree; it is employability developed throughout the learning journey."] },
    ],
  },
  {
    slug: "stem-labs-beyond-equipment",
    title: "Why effective school STEM labs go beyond equipment",
    excerpt: "Five design principles that turn makerspaces into inclusive environments for inquiry, creativity, and applied learning.",
    category: "School Education",
    date: "2026-05-12",
    readTime: "5 min read",
    author: "Neha Thomas",
    content: [
      { heading: "Begin with the learning experience", paragraphs: ["A room full of devices is not yet a STEM programme. Strong labs begin with age-appropriate challenges that connect science, mathematics, design, and computing to local life.", "Each challenge needs clear concepts, room for exploration, and evidence that lets teachers see how learners reason."] },
      { heading: "Enable every teacher", paragraphs: ["Teacher confidence is the strongest predictor of sustained lab use. Demonstration lessons, co-teaching, planning resources, and peer showcases help teams move from following activities to designing their own.", "Inclusive grouping, accessible materials, and multiple ways to share learning ensure every child can participate."] },
      { heading: "Make improvement routine", paragraphs: ["Track learner questions, iteration, teamwork, and explanation—not only whether a model works. Schools can use this evidence to refine projects and build a coherent pathway across grades.", "CITIS supports schools with lab design, curriculum, facilitator development, and annual impact reviews."] },
    ],
  },
  {
    slug: "microcredentials-workforce-mobility",
    title: "Microcredentials that create real workforce mobility",
    excerpt: "What education and industry leaders should align before launching short, skills-based credentials.",
    category: "Workforce Development",
    date: "2026-04-08",
    readTime: "8 min read",
    author: "Sanjay Menon",
    content: [
      { heading: "Credentials need labour-market meaning", paragraphs: ["A useful microcredential signals a coherent capability that employers recognise and learners can demonstrate. It should be built from role analysis, not simply a shortened course.", "Transparent outcomes, workload, assessment criteria, and progression options give the credential value beyond its badge."] },
      { heading: "Assessment must be authentic", paragraphs: ["Projects, simulations, demonstrations, and structured interviews provide stronger evidence than recall tests. Assessors need calibrated rubrics and moderation to keep decisions consistent.", "Digital portfolios let learners retain evidence and combine credentials over time."] },
      { heading: "Design pathways, not dead ends", paragraphs: ["Recognition of prior learning and credit articulation allow short-form learning to connect to diplomas, degrees, and higher-level roles.", "Education providers and employers should review outcome data together so the pathway remains relevant and equitable."] },
    ],
  },
  {
    slug: "faculty-development-digital-pedagogy",
    title: "Faculty development for lasting digital pedagogy",
    excerpt: "Move from tool demonstrations to supported changes in teaching, assessment, and learner engagement.",
    category: "Faculty Enablement",
    date: "2026-03-20",
    readTime: "6 min read",
    author: "Prof. Kavita Iyer",
    content: [
      { heading: "Professional learning should mirror good pedagogy", paragraphs: ["Faculty learn best through relevant problems, active practice, feedback, and peer dialogue. A sequence of short studios tied to their current courses is more effective than generic platform training.", "Participants should leave each session with a usable learning activity and a clear plan for collecting evidence."] },
      { heading: "Support transfer into classrooms", paragraphs: ["Coaching, observation, student feedback, and departmental showcases help new practices survive workload pressure. Academic leaders also need time and recognition structures that make improvement possible.", "Communities of practice turn individual experimentation into shared institutional capability."] },
      { heading: "Use evidence to guide scale", paragraphs: ["Participation is an input, not impact. Review changes in course design, student engagement, assessment quality, accessibility, and learning outcomes.", "A capability framework makes progress visible while respecting disciplinary differences."] },
    ],
  },
  {
    slug: "skills-first-campus-placements",
    title: "A skills-first approach to campus placements",
    excerpt: "Connect learner evidence, role readiness, and employer engagement to improve placement quality—not only volume.",
    category: "Employability",
    date: "2026-02-11",
    readTime: "5 min read",
    author: "Rahul Bose",
    content: [
      { heading: "Readiness starts early", paragraphs: ["Placement outcomes are shaped long before recruitment season. Role discovery, baseline diagnostics, communication practice, and project work should begin early enough for learners to act on feedback.", "A shared readiness rubric gives faculty, coaches, and students a consistent view of progress."] },
      { heading: "Evidence improves matching", paragraphs: ["Verified projects, technical demonstrations, and structured behavioural examples help employers see capability that a résumé cannot show.", "Mapping this evidence to job families improves shortlisting and helps learners pursue roles that fit their strengths."] },
      { heading: "Close the employer feedback loop", paragraphs: ["Selection data and manager feedback should flow back into learning design. Institutions can then target recurring gaps without turning the curriculum into narrow test preparation.", "The strongest placement ecosystems treat employers as long-term learning partners."] },
    ],
  },
];

export type CaseStudyContent = {
  slug: string;
  title: string;
  client: string;
  sector: string;
  excerpt: string;
  challenge: string;
  solution: string[];
  outcomes: Array<{ value: string; label: string }>;
  services: string[];
  image: string;
};

export const CASE_STUDIES: CaseStudyContent[] = [
  { slug: "ai-readiness-engineering-university", title: "Embedding AI readiness across an engineering university", client: "Leading Technical University", sector: "Higher Education", excerpt: "A faculty-led, credit-aligned AI pathway reached learners across six engineering disciplines.", challenge: "The university wanted every graduate to use AI responsibly while preserving disciplinary depth and academic integrity.", solution: ["Mapped AI capabilities to graduate attributes and programme outcomes.", "Co-designed faculty studios, student labs, and discipline-specific capstones.", "Established assessment rubrics, mentor governance, and an annual curriculum review."], outcomes: [{ value: "4,800+", label: "students reached" }, { value: "210", label: "faculty enabled" }, { value: "86%", label: "project completion" }], services: ["Curriculum co-design", "Faculty development", "AI labs"], image: "/images/case-studies/ai-readiness-university.jpg" },
  { slug: "district-stem-transformation", title: "A scalable STEM pathway for 42 schools", client: "Regional School Network", sector: "School Education", excerpt: "Teacher enablement and challenge-based learning turned new labs into active learning ecosystems.", challenge: "Schools had equipment but lacked a coherent curriculum, trained facilitators, and evidence of learner progression.", solution: ["Designed grade-banded inquiry modules aligned to science and mathematics.", "Developed lead teachers through demonstration, co-teaching, and coaching.", "Introduced showcases and observation rubrics to measure inquiry and collaboration."], outcomes: [{ value: "18,600", label: "learners engaged" }, { value: "540", label: "teachers trained" }, { value: "2.4×", label: "weekly lab use" }], services: ["STEM curriculum", "Teacher enablement", "Impact measurement"], image: "/images/case-studies/district-stem-transformation.jpg" },
  { slug: "industry-4-vocational-academy", title: "Modernising a vocational academy for Industry 4.0", client: "Manufacturing Skills Consortium", sector: "Vocational Education", excerpt: "Modular learning and simulated production environments created pathways into high-demand technician roles.", challenge: "Legacy programmes were not keeping pace with connected manufacturing roles or flexible learner needs.", solution: ["Mapped emerging roles and created stackable competency modules.", "Built simulation-led labs spanning automation, IoT, safety, and quality.", "Trained assessors and created apprenticeship transition agreements."], outcomes: [{ value: "92%", label: "certification rate" }, { value: "78%", label: "job transition" }, { value: "34", label: "employer partners" }], services: ["Skills architecture", "Lab enablement", "Assessment"], image: "/images/case-studies/industry-4-vocational-academy.jpg" },
  { slug: "career-readiness-placement-cell", title: "Reimagining career readiness and placements", client: "Multi-campus Private University", sector: "Employability", excerpt: "A skills-first model connected diagnostics, practice, portfolios, and employer matching.", challenge: "A fast-growing institution needed consistent placement quality across campuses and diverse disciplines.", solution: ["Introduced role-based readiness diagnostics from the second year.", "Created communication, technical, and interview practice pathways.", "Built employer briefs and portfolio reviews into academic capstones."], outcomes: [{ value: "31%", label: "higher quality offers" }, { value: "120+", label: "hiring partners" }, { value: "9,200", label: "learner profiles" }], services: ["Career pathways", "Placement operations", "Employer engagement"], image: "/images/case-studies/career-readiness-placement-cell.jpg" },
];

export type Job = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  experience: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
};

export const JOBS: Job[] = [
  { slug: "learning-experience-designer", title: "Learning Experience Designer", team: "Learning Design", location: "Bengaluru / Hybrid", type: "Full-time", experience: "3–6 years", summary: "Design rigorous, inclusive learning experiences for university and workforce programmes.", responsibilities: ["Translate competency maps into learning journeys, activities, and assessments.", "Co-create with faculty, subject experts, and industry mentors.", "Use learner evidence to iterate content and facilitation guides."], requirements: ["Experience designing adult or higher-education learning.", "Strong portfolio showing outcomes, assessment, and digital pedagogy.", "Clear writing, facilitation, and stakeholder collaboration skills."] },
  { slug: "stem-program-manager", title: "STEM Programme Manager", team: "School Education", location: "Bengaluru with travel", type: "Full-time", experience: "5–8 years", summary: "Lead multi-school STEM implementation from educator onboarding through impact review.", responsibilities: ["Own delivery plans, school relationships, and facilitator quality.", "Coach field teams and coordinate teacher learning communities.", "Track participation, implementation fidelity, and learner outcomes."], requirements: ["Programme management experience in K–12 education.", "Understanding of inquiry-based STEM and teacher development.", "Comfort with data, field travel, and senior stakeholder communication."] },
  { slug: "full-stack-engineer-learning-platforms", title: "Full-stack Engineer — Learning Platforms", team: "Product & Engineering", location: "Bengaluru / Hybrid", type: "Full-time", experience: "4–7 years", summary: "Build accessible, reliable learning products used by educators and learners at scale.", responsibilities: ["Develop product capabilities across modern web services and interfaces.", "Partner with design and learning teams on accessible user experiences.", "Improve observability, security, performance, and release quality."], requirements: ["Production experience with TypeScript, React, Node.js, and relational data.", "Strong API, testing, and cloud engineering fundamentals.", "Care for accessibility, privacy, and maintainable product design."] },
  { slug: "university-partnerships-lead", title: "University Partnerships Lead", team: "Institutional Partnerships", location: "India / Remote", type: "Full-time", experience: "7–10 years", summary: "Build long-term university partnerships around curriculum, capability, and student progression.", responsibilities: ["Discover institutional priorities and shape measurable programmes.", "Coordinate academic, product, delivery, and industry stakeholders.", "Steward partnership reviews, expansion plans, and outcome reporting."], requirements: ["Experience in higher-education partnerships or academic solutions.", "Consultative discovery and proposal development capability.", "Executive communication and complex programme ownership."] },
];
