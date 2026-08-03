import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Lightbulb,
  Newspaper,
  Rocket,
  School,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

export const SITE_CONFIG = {
  name: "CITIS InfoTech",
  legalName: "CITIS Infotech Pvt. Ltd.",
  description:
    "Technology-enabled education solutions for universities, schools, industries, and learners — bridging academia and industry for future-ready talent.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.citisinfotech.com",
  email: "info@citisinfotech.com",
  phone: "+91 80 4123 4567",
  tagline: "Empowering Education. Enabling Futures.",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Engagements", href: "/engagements", megaMenu: "engagements" },
  { label: "Products", href: "/products", megaMenu: "products" },
  { label: "Highlights", href: "/highlights", megaMenu: "highlights" },
  { label: "Future Academy", href: "/future-academy" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

export const MEGA_MENUS = {
  engagements: {
    eyebrow: "Who we serve",
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
        description: "Curriculum, labs, and industry-integrated learning.",
        icon: GraduationCap,
      },
      {
        title: "School Solutions",
        href: "/engagements/school",
        description: "ICT, STEM, and tomorrow’s classroom models.",
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
        description: "Domain labs and capability centers.",
        icon: Award,
      },
      {
        title: "Placements & Internships",
        href: "/engagements/placements",
        description: "Industry readiness and career outcomes.",
        icon: BriefcaseBusiness,
      },
      {
        title: "Partner With Us",
        href: "/partner",
        description: "Collaboration models for institutions and industry.",
        icon: Users,
      },
    ],
  },
  products: {
    eyebrow: "Learning academies",
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
        title: "MoxieMind Academy",
        href: "/products/moxiemind",
        description: "Entrepreneurship, innovation, and venture building.",
        icon: Lightbulb,
      },
      {
        title: "CITIS Future Academy",
        href: "/future-academy",
        description: "Courses, certifications, and learning paths.",
        icon: BookOpen,
      },
    ],
  },
  highlights: {
    eyebrow: "Ideas & impact",
    title: "Stories from campuses, classrooms, and industry",
    featured: {
      label: "See all highlights",
      href: "/highlights",
      description: "Blogs, case studies, and institutional success stories.",
    },
    items: [
      {
        title: "Blogs",
        href: "/highlights/blogs",
        description: "Perspectives on EdTech, skills, and pedagogy.",
        icon: Newspaper,
      },
      {
        title: "Case Studies",
        href: "/highlights/case-studies",
        description: "Measurable outcomes from university and school programs.",
        icon: Rocket,
      },
      {
        title: "About CITIS",
        href: "/about",
        description: "Vision, mission, and associations.",
        icon: Building2,
      },
      {
        title: "Careers",
        href: "/careers",
        description: "Join our education transformation team.",
        icon: BriefcaseBusiness,
      },
    ],
  },
} as const;

export const OFFICES = [
  {
    name: "Corporate Office",
    address: "CITIS Tech Park, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103",
    phone: "+91 80 4890 1200",
    email: "corporate@citisinfotech.com",
  },
  {
    name: "Bangalore Office",
    address: "No. 48, 2nd Floor, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    phone: "+91 80 4123 4567",
    email: "bangalore@citisinfotech.com",
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
      { label: "Careers", href: "/careers", icon: BriefcaseBusiness },
      { label: "Partner with us", href: "/partner" },
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
      { label: "Future Academy", href: "/future-academy" },
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
