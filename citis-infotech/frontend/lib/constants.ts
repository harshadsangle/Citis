import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Lightbulb,
  Newspaper,
  Rocket,
  School,
  Sparkles,
  Wrench,
} from "lucide-react";

export const SITE_CONFIG = {
  name: "CITIS InfoTech",
  legalName: "CITIS Infotech Pvt. Ltd.",
  description:
    "A leading technology-enabled education company empowering K–12 and Higher Education institutions with future-ready solutions that integrate academic learning with industry relevance.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.citisinfotech.com",
  email: "info@citisinfotech.in",
  phone: "+91 7204992221",
  tagline: "Inspired by Excellence and Innovation",
} as const;

/** Header nav: Home is via brand logo; Careers & Future Academy are not header tabs. */
export const NAV_LINKS = [
  { label: "Engagements", href: "/engagements", megaMenu: "engagements" },
  { label: "Products", href: "/products", megaMenu: "products" },
  { label: "Highlights", href: "/highlights", megaMenu: "highlights" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const MEGA_MENUS = {
  engagements: {
    eyebrow: "Engagements",
    title: "Education solutions across the learning continuum",
    featured: {
      label: "Explore all engagements",
      href: "/engagements",
      description: "University, school, vocational, CoE, and placement programs.",
    },
    items: [
      {
        title: "University Solutions",
        href: "/engagements/university",
        description: "Ways to collaborate, domain expertise, progression model, IILP.",
        icon: GraduationCap,
      },
      {
        title: "School Solutions",
        href: "/engagements/school",
        description: "Tomorrow’s Schools, ICT Integration, STEM Education.",
        icon: School,
      },
      {
        title: "Vocational Education",
        href: "/engagements/vocational",
        description: "Skill pathways aligned to employability.",
        icon: Wrench,
      },
      {
        title: "Centre of Excellence",
        href: "/engagements/centre-of-excellence",
        description: "Centre of Excellence and services offered.",
        icon: Award,
      },
      {
        title: "Placements & Internships",
        href: "/engagements/placements",
        description: "Industry readiness and career outcomes.",
        icon: BriefcaseBusiness,
      },
    ],
  },
  products: {
    eyebrow: "Products",
    title: "Purpose-built academies for next-gen skills",
    featured: {
      label: "View all products",
      href: "/products",
      description: "AI, app development, and entrepreneurship programs.",
    },
    items: [
      {
        title: "AI Future Academy",
        href: "/products/ai-future-academy",
        description: "Practical AI, ML, and intelligent systems learning.",
        icon: Sparkles,
      },
      {
        title: "AppWizz Academy",
        href: "/products/appwizz-academy",
        description: "Full-stack and mobile app development pathways.",
        icon: Rocket,
      },
      {
        title: "MoxieMind Entrepreneurship Academy",
        href: "/products/moxiemind",
        description: "Entrepreneurship, innovation, and venture building.",
        icon: Lightbulb,
      },
    ],
  },
  highlights: {
    eyebrow: "Highlights",
    title: "Case studies and blogs",
    featured: {
      label: "See all highlights",
      href: "/highlights",
      description: "Case studies and blogs from campuses and industry.",
    },
    items: [
      {
        title: "Case Studies",
        href: "/highlights/case-studies",
        description: "Institutional outcomes and programme impact.",
        icon: Rocket,
      },
      {
        title: "Blogs",
        href: "/highlights/blogs",
        description: "Perspectives on EdTech, skills, and pedagogy.",
        icon: Newspaper,
      },
    ],
  },
} as const;

export const OFFICES = [
  {
    name: "Corporate Office",
    address:
      "Plot No. 20, Office No. 201, ‘Vihaan’, Bramhavrunda Colony No. 2, Vishal Nagar, Pimple Nilakh, Pune 411027, Maharashtra, India",
    phone: "+91 7204992221",
    email: "info@citisinfotech.in",
  },
  {
    name: "Bengaluru Office",
    address: "4th Floor, HM Geneva House, Cunningham Road, Bangalore – 560052",
    phone: "+91 7204992221",
    email: "info@citisinfotech.in",
  },
] as const;

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/citis-infotech" },
  { label: "X", href: "https://x.com/citisinfotech" },
  { label: "YouTube", href: "https://www.youtube.com/@citisinfotech" },
  { label: "Instagram", href: "https://www.instagram.com/citisinfotech" },
] as const;

export const STATISTICS = [
  { value: 150, suffix: "+", label: "Partner institutions" },
  { value: 50000, suffix: "+", label: "Learners impacted" },
  { value: 200, suffix: "+", label: "Industry mentors" },
  { value: 95, suffix: "%", label: "Placement readiness" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Engagements",
    links: [
      { label: "University Solutions", href: "/engagements/university" },
      { label: "School Solutions", href: "/engagements/school" },
      { label: "Vocational Education", href: "/engagements/vocational" },
      { label: "Centre of Excellence", href: "/engagements/centre-of-excellence" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "AI Future Academy", href: "/products/ai-future-academy" },
      { label: "AppWizz Academy", href: "/products/appwizz-academy" },
      { label: "CITIS Future Academy", href: "/future-academy" },
      { label: "Blogs", href: "/highlights/blogs" },
    ],
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    name: "Dr. Ananya Rao",
    role: "Dean of Engineering",
    company: "National Institute of Technology",
    content:
      "CITIS transformed our curriculum into an industry-aligned learning journey. Students graduate with portfolios, not just transcripts.",
    rating: 5,
  },
  {
    name: "Rajesh Menon",
    role: "HR Director",
    company: "TechVista Global",
    content:
      "Interns from CITIS programs arrive ready to contribute. The IILP model bridges the gap we used to spend months closing.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Principal",
    company: "Horizon International School",
    content:
      "Their STEM and ICT programs made technology feel accessible and exciting for every learner in our school.",
    rating: 5,
  },
] as const;

export const HOME_CLIENTS = [
  "NIT Consortium",
  "Horizon Schools",
  "TechVista",
  "EduBridge Trust",
  "State Skill Mission",
  "InnoLabs",
  "CampusWorks",
  "FutureSkills Hub",
] as const;

/** Exact Why Choose Us points from the CITIS wireframe. */
export const WHY_CHOOSE_US = [
  {
    title: "Industry-Aligned Curriculum",
    description:
      "CITIS InfoTech designs programs in collaboration with industry experts, ensuring that the curriculum is aligned with current and future job market demands. This helps institutions stay relevant and competitive.",
  },
  {
    title: "Zero-Day Deployment Readiness",
    description:
      "Students are trained with practical skills and real-world exposure, enabling them to contribute effectively from day one in their professional roles, enhancing employability outcomes.",
  },
  {
    title: "Job Role–Based Learning Framework",
    description:
      "Programs are mapped to specific job roles, focusing on skill development that directly translates into career opportunities rather than just theoretical knowledge.",
  },
  {
    title: "Enhanced Placement Outcomes",
    description:
      "With a strong focus on employability, industry certifications, and hands-on learning, institutions can significantly improve their placement rates and student success metrics.",
  },
  {
    title: "Add-On Value to Academic Programs",
    description:
      "CITIS programs seamlessly integrate with existing academic structures, acting as value-added certifications, minors, honours, or integrated learning programs without disrupting core curricula.",
  },
  {
    title: "Access to Global Certifications",
    description:
      "Students gain access to internationally recognized certifications, increasing their global competitiveness and career prospects.",
  },
  {
    title: "Faculty Development & Support",
    description:
      "CITIS provides training, content, and continuous support to faculty, enabling institutions to deliver high-quality, industry-relevant education.",
  },
  {
    title: "Technology-Enabled Learning Ecosystem",
    description:
      "Institutions benefit from advanced learning platforms, digital tools, and blended learning methodologies that enhance student engagement and learning outcomes.",
  },
  {
    title: "Strong Industry Connect",
    description:
      "CITIS bridges the gap between academia and industry by bringing real-world insights, live projects, internships, and expert sessions into the learning environment.",
  },
  {
    title: "Scalable & Structured Implementation",
    description:
      "Programs are designed for seamless deployment across departments and campuses, ensuring consistent quality and scalability.",
  },
  {
    title: "Improved Institutional Branding",
    description:
      "Partnering with a leading technology education company enhances the institution’s reputation as a forward-thinking, industry-aligned learning hub.",
  },
  {
    title: "Outcome-Based Learning Approach",
    description:
      "Focus on measurable outcomes such as skills, certifications, internships, and placements ensures tangible value for students and institutions.",
  },
  {
    title: "NEP-Aligned Skill Development",
    description:
      "Programs are aligned with the vision of India’s National Education Policy (NEP), emphasizing multidisciplinary learning, skill development, and employability.",
  },
  {
    title: "Continuous Curriculum Upgradation",
    description:
      "CITIS ensures that content is regularly updated to reflect emerging technologies, tools, and industry practices.",
  },
  {
    title: "End-to-End Academic Support",
    description:
      "From curriculum design to delivery, assessments, certifications, and placement assistance, CITIS provides comprehensive support to institutions.",
  },
] as const;

export const HOME_COPY = {
  excellence: {
    title: "Inspired by Excellence and Innovation",
    body: "At CITIS InfoTech, we are driven by a commitment to excellence and a passion for innovation, redefining the landscape of education across India. As a leading technology-enabled education company, we empower both K–12 and Higher Education institutions with future-ready solutions that seamlessly integrate academic learning with industry relevance. Our programs are designed in collaboration with industry experts, ensuring that learners are equipped with cutting-edge skills, globally aligned curricula, and practical exposure that enhance employability and career readiness. Through innovative delivery models, digital platforms, and outcome-focused training, CITIS InfoTech enables institutions to elevate their academic standards while fostering creativity, critical thinking, and real-world problem-solving. Inspired by excellence, we strive to deliver impactful learning experiences; driven by innovation, we shape the next generation of skilled professionals for a dynamic, technology-driven world.",
  },
  changingFace: {
    title: "The Changing Face of Education",
    paragraphs: [
      "The education ecosystem in India is undergoing a profound transformation, driven by rapid technological advancements, evolving industry demands, and a growing emphasis on outcome-based learning. Over the next 5 to 7 years, the future of education across K–12 and Higher Education will be shaped by key pillars such as digital-first learning environments, industry-integrated curricula, skills-based education, experiential and project-based learning, and continuous assessment models. Classrooms will extend beyond physical boundaries into immersive, technology-enabled spaces powered by AI, data analytics, and personalized learning pathways. The focus will shift from rote learning to developing critical thinking, creativity, problem-solving abilities, and career readiness from an early stage. Stronger collaboration between academia and industry will become essential, ensuring that education remains relevant, dynamic, and aligned with real-world opportunities.",
      "At CITIS InfoTech, we envision a future where education is not just about knowledge acquisition, but about building competencies for life and work in a rapidly changing world. By integrating advanced technologies, global standards, and industry-driven frameworks into the academic ecosystem, we aim to create future-ready institutions that empower learners to thrive in the digital economy. Our approach is centered on bridging the gap between education and employability, enabling institutions to deliver innovative, scalable, and impactful learning experiences that prepare students to lead, innovate, and succeed in the years to come.",
    ],
  },
  beyondCurriculum: {
    title: "Move Beyond Curriculum",
    body: "At CITIS InfoTech, we believe that true education goes far beyond textbooks and traditional academic frameworks. In today’s dynamic and rapidly evolving world, it is essential for learners to move beyond the boundaries of prescribed curricula and engage in experiences that build real knowledge, practical skills, and future-ready competencies. Our programs for K–12 and Higher Education institutions across India are designed as powerful add-ons to the core academic spectrum—bridging the gap between theoretical learning and real-world application. By integrating industry-relevant modules, hands-on projects, global certifications, and experiential learning opportunities, we enable students to develop critical thinking, creativity, digital fluency, and problem-solving abilities. These programs not only complement academic learning but also play a pivotal role in shaping confident, skilled, and career-ready individuals. At CITIS InfoTech, we are committed to expanding learning horizons—because the future belongs to those who learn beyond the curriculum.",
  },
  industryAcademia: {
    title: "Industry - Academia Collaboration",
    body: "In an increasingly dynamic and skills-driven economy, the alignment between academia and industry has become essential to create meaningful learning outcomes. At CITIS InfoTech, we strongly believe that education must evolve in sync with industry expectations, enabling students to transition seamlessly from the classroom to the workplace. Our Industry–Academia Collaboration model is designed to deliver zero-day deployment readiness—where students are equipped to contribute effectively from their very first day on the job. Through carefully curated, job role–based learning frameworks, industry-aligned curricula, and hands-on practical exposure, we ensure that learners gain not just theoretical understanding but real-world competencies demanded by employers. By partnering with leading industry experts and organizations, CITIS InfoTech brings contemporary skills, tools, and practices into the academic ecosystem, enhancing employability, improving placement outcomes, and building a workforce that is agile, competent, and future-ready.",
  },
} as const;
