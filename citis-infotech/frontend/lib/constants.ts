import {
  Award,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Handshake,
  Lightbulb,
  Newspaper,
  Rocket,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

export const SITE_CONFIG = {
  name: "CITIS InfoTech",
  legalName: "CITIS Infotech Pvt. Ltd.",
  description:
    "A leading technology-enabled education company empowering K–12 and Higher Education institutions with future-ready solutions that integrate academic learning with industry relevance.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.citisinfotech.com",
  email: "support@citis.in",
  phone: "+91 7204992221",
  phoneE164: "917204992221",
  whatsappUrl: "https://wa.me/917204992221",
  tagline: "Inspired by Excellence and Innovation",
} as const;

/** Header: no Home / Careers / Partner / Future Academy tabs. About before Contact. */
export const NAV_LINKS = [
  { label: "Engagements", href: "/engagements", megaMenu: "engagements" },
  { label: "Products", href: "/products", megaMenu: "products" },
  { label: "Highlights", href: "/highlights", megaMenu: "highlights" },
  { label: "About", href: "/about", megaMenu: "about" },
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
        description: "Ways to Collaborate, Domain Expertise, Progression Model, IILP.",
        icon: GraduationCap,
      },
      {
        title: "School Solutions",
        href: "/engagements/school",
        description: "Tomorrow’s Schools, ICT Integration, STEM Education Solution.",
        icon: School,
      },
      {
        title: "Vocational Education",
        href: "/engagements/vocational",
        description: "Vocational education pathways.",
        icon: Wrench,
      },
      {
        title: "Centre of Excellence",
        href: "/engagements/centre-of-excellence",
        description: "Centre of Excellence and Services offered by Us.",
        icon: Award,
      },
      {
        title: "Placements and Internships",
        href: "/engagements/placements",
        description: "Placements and internships.",
        icon: BriefcaseBusiness,
      },
    ],
  },
  products: {
    eyebrow: "Products",
    title: "CITIS academies",
    featured: {
      label: "View all products",
      href: "/products",
      description: "AI Future Academy, AppWizz Academy, MoxieMind Entrepreneurship Academy.",
    },
    items: [
      {
        title: "AI Future Academy",
        href: "/products/ai-future-academy",
        description: "AI Future Academy",
        icon: Sparkles,
      },
      {
        title: "Science Lab",
        href: "/products/appwizz-academy",
        description: "AppWizz Academy",
        icon: Rocket,
      },
      {
        title: "MoxieMind Entrepreneurship Academy",
        href: "/products/moxiemind",
        description: "MoxieMind Entrepreneurship Academy",
        icon: Lightbulb,
      },
    ],
  },
  highlights: {
    eyebrow: "Highlights",
    title: "Case Studies and Blogs",
    featured: {
      label: "See all highlights",
      href: "/highlights",
      description: "Case Studies and Blogs.",
    },
    items: [
      {
        title: "Case Studies",
        href: "/highlights/case-studies",
        description: "Case Studies",
        icon: Rocket,
      },
      {
        title: "Blogs",
        href: "/highlights/blogs",
        description: "Blogs",
        icon: Newspaper,
      },
    ],
  },
  about: {
    eyebrow: "About",
    title: "About CITIS InfoTech",
    featured: {
      label: "About Us",
      href: "/about",
      description: "About Us, Vision and Mission, Quality Policy, Our Associations.",
    },
    items: [
      {
        title: "About Us",
        href: "/about",
        description: "About Us",
        icon: Users,
      },
      {
        title: "Vision and Mission",
        href: "/about/vision-mission",
        description: "Vision and Mission",
        icon: Compass,
      },
      {
        title: "Quality Policy",
        href: "/about/quality-policy",
        description: "Quality Policy",
        icon: ShieldCheck,
      },
      {
        title: "Our Associations",
        href: "/about/associations",
        description: "Our Associations",
        icon: Handshake,
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
    email: "support@citis.in",
    lat: 18.5868,
    lng: 73.7809,
  },
  {
    name: "Bengaluru Office",
    address: "4th Floor, HM Geneva House, Cunningham Road, Bangalore – 560052",
    phone: "+91 7204992221",
    email: "support@citis.in",
    lat: 12.9864,
    lng: 77.5953,
  },
] as const;

/** Google Maps search / directions URL for an office address (no API key). */
export function googleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

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
      { label: "About Us", href: "/about" },
      { label: "Vision and Mission", href: "/about/vision-mission" },
      { label: "Quality Policy", href: "/about/quality-policy" },
      { label: "Our Associations", href: "/about/associations" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Engagements",
    links: [
      { label: "University Solutions", href: "/engagements/university" },
      { label: "School Solutions", href: "/engagements/school" },
      { label: "Vocational Education", href: "/engagements/vocational" },
      { label: "Centre of Excellence", href: "/engagements/centre-of-excellence" },
      { label: "Placements and Internships", href: "/engagements/placements" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "AI Future Academy", href: "/products/ai-future-academy" },
      { label: "AppWizz Academy", href: "/products/appwizz-academy" },
      { label: "MoxieMind Entrepreneurship Academy", href: "/products/moxiemind" },
      { label: "CITIS Future Academy", href: "/future-academy" },
      { label: "Case Studies", href: "/highlights/case-studies" },
      { label: "Blogs", href: "/highlights/blogs" },
    ],
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    name: "Partner Institution",
    role: "Academic Leader",
    company: "Higher Education",
    content:
      "CITIS InfoTech programs help our students gain industry-aligned skills and career readiness.",
    rating: 5,
  },
  {
    name: "Industry Partner",
    role: "Talent Lead",
    company: "Technology Sector",
    content:
      "Students from CITIS programs demonstrate practical competencies and zero-day deployment readiness.",
    rating: 5,
  },
  {
    name: "School Partner",
    role: "Principal",
    company: "K–12 Institution",
    content:
      "CITIS school solutions support ICT integration and STEM education for future-ready learners.",
    rating: 5,
  },
] as const;

export const HOME_CLIENTS = [
  { name: "University Partners", logo: "/images/clients/university-partners.svg" },
  { name: "School Networks", logo: "/images/clients/school-networks.svg" },
  { name: "Industry Partners", logo: "/images/clients/industry-partners.svg" },
  { name: "Skill Missions", logo: "/images/clients/skill-missions.svg" },
  { name: "Centres of Excellence", logo: "/images/clients/centres-of-excellence.svg" },
  { name: "Vocational Institutes", logo: "/images/clients/vocational-institutes.svg" },
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
