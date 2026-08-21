import {
  Award,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Handshake,
  Images,
  Lightbulb,
  Newspaper,
  Rocket,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wrench,
} from "lucide-react";

export const SITE_CONFIG = {
  name: "CITIS InfoTech",
  legalName: "CITIS Infotech LLP",
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
  { label: "Contact", href: "/contact", megaMenu: "contact" },
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
      {
        title: "Global Certifications",
        href: "/engagements/global-certifications",
        description: "Industry-recognized certification pathways through EtrainIndia.",
        icon: Award,
      },
    ],
  },
  products: {
    eyebrow: "Products",
    title: "CITIS academies",
    featured: {
      label: "View all products",
      href: "/products",
      description: "AI Academy, AppWizz Academy, MoxieMind Entrepreneurship Academy.",
    },
    items: [
      {
        title: "AI Academy",
        href: "/products/ai-future-academy",
        description: "AI Academy",
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
        title: "Management Team",
        href: "/about/management-team",
        description: "Management Team",
        icon: BriefcaseBusiness,
      },
      {
        title: "Advisory Board",
        href: "/about/advisory-board",
        description: "Advisory Board",
        icon: Users,
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
      {
        title: "Gallery",
        href: "/about/gallery",
        description: "Gallery",
        icon: Images,
      },
      {
        title: "Media",
        href: "/about/media",
        description: "Media",
        icon: Video,
      },
    ],
  },
  contact: {
    eyebrow: "Contact Us",
    title: "Connect with CITIS InfoTech",
    featured: {
      label: "Contact Us",
      href: "/contact",
      description: "Get in touch with CITIS InfoTech.",
    },
    items: [
      {
        title: "Contact Us",
        href: "/contact",
        description: "Get in touch with CITIS InfoTech.",
        icon: Handshake,
      },
      {
        title: "Career",
        href: "/careers",
        description: "Explore career opportunities at CITIS InfoTech.",
        icon: BriefcaseBusiness,
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
      { label: "Global Certifications", href: "/engagements/global-certifications" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "AI Academy", href: "/products/ai-future-academy" },
      { label: "Science Lab", href: "/products/appwizz-academy" },
      { label: "MoxieMind Entrepreneurship Academy", href: "/products/moxiemind" },
      { label: "CITIS Future Academy", href: "/future-academy" },
      { label: "Case Studies", href: "/highlights/case-studies" },
      { label: "Blogs", href: "/highlights/blogs" },
    ],
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    category: "Higher Education Programs – Testimonial",
    name: "Dr. S. Vidyashankar",
    role: "Vice Chancellor",
    company: "VTU, Belagavi",
    attribution: "Vice Chancellor\nVTU, Belagavi",
    content:
      "CITIS Infotech has demonstrated a clear understanding of the changing requirements of higher education and the growing need to connect academic learning with industry and emerging technologies. Their approach to Honours, Minor, certification and industry-integrated programs provides institutions with an opportunity to offer students learning pathways that complement their core degree programs. We appreciate CITIS's collaborative approach and their focus on building meaningful academic and industry partnerships.",
  },
  {
    category: "Computational Thinking, AI & Coding – School Leader",
    name: "Dr. C T Kunjir",
    role: "Founder",
    company: "Cambridge Group of Schools",
    attribution: "Founder – Cambridge Group of Schools",
    content:
      "Technology education must begin by developing the ability to think, create and solve problems—not simply by teaching students how to use technology. The CITIS approach to computational thinking, coding and Artificial Intelligence gives our students an opportunity to explore technology in a structured and engaging manner. The combination of coding, AI and project-based learning is helping our students develop curiosity, creativity and confidence in working with technology.",
  },
  {
    category: "Science Lab – Parent",
    name: "Subhash Kumbhar",
    role: "Parent of Shubham Kumbhar",
    company: "Potdar International School, Pune",
    attribution: "Parent of Shubham Kumbhar, Potdar International School, Pune",
    content:
      "My child has always enjoyed science, but the Science Lab experience has made the subject much more interactive and interesting. Being able to explore experiments and scientific concepts through a digital and visual environment has encouraged my child to ask more questions and understand concepts beyond what is taught in the textbook. I feel that technology-enabled practical learning can make a significant difference to how children experience science.",
  },
  {
    category: "Science Lab – Science Teacher",
    name: "Ms. Meera Mirchandani",
    role: "Science Teacher",
    company: "",
    attribution: "Science Teacher",
    content:
      "The Science Lab solution has been a valuable complement to our classroom teaching. It gives students an opportunity to visualise concepts, explore experiments and learn through interaction rather than depending entirely on theoretical explanations. From a teacher's perspective, it also provides an additional resource to explain complex concepts and engage students more effectively. The combination of classroom teaching and virtual practical learning creates a much richer science-learning experience.",
  },
  {
    category: "Vocational Education & Skill Development",
    name: "Dr. Manoj Chavan",
    role: "Udyog Vikas Skills Councile.",
    company: "",
    attribution: "Udyog Vikas Skills Councile.",
    content:
      "The biggest challenge facing higher education today is ensuring that students graduate with skills that are relevant to the workplace. CITIS Infotech's approach to vocational education and skill development brings academic learning closer to industry requirements through practical learning, technology exposure, certifications and industry-oriented programs. Their focus on Industry Integrated Learning and employability provides institutions with a valuable framework for preparing students for the transition from campus to career.",
  },
  {
    name: "Dr. Prashant Kulkarni",
    role: "Academic Expert",
    company: "University Advisor – YCMOU",
    attribution: "Academic Expert\nUniversity Advisor – YCMOU",
    content:
      "CITIS Infotech has developed a compelling approach to education that brings together academic learning, technology, skills and industry exposure. Their focus on emerging areas such as Artificial Intelligence, digital learning and future skills is aligned with the changing needs of education. CITIS has the potential to become a meaningful partner for institutions seeking to prepare their students for the future.",
  },
  {
    name: "Franxan Stanley",
    role: "Co Founder",
    company: "Aye Labs, India",
    attribution: "Co Founder – Aye Labs, India",
    content:
      "What stands out about CITIS Infotech is its focus on connecting education with practical application. Whether it is technology-enabled learning, skill development, vocational education or industry-integrated programs, the emphasis is on creating meaningful learning experiences for students. This integrated approach can help institutions move beyond traditional models and create more relevant and future-ready education ecosystems.",
  },
  {
    name: "Gaurav Sharma",
    role: "Recruitment Specialist and HR Leader",
    company: "Education Technology & Institutional Development",
    attribution: "Recruitment Specialist and HR Leader\nEducation Technology & Institutional Development",
    content:
      "The education landscape is undergoing a significant transformation, driven by Artificial Intelligence, emerging technologies and changing industry requirements. CITIS Infotech is responding to this transformation by bringing together technology, academic programs, faculty development and industry collaboration. Its ecosystem-oriented approach is particularly relevant for institutions looking to build sustainable capabilities rather than adopt isolated technology solutions.",
  },
] as const;

export const HOME_CLIENTS = [
  {
    name: "Bharati Vidyapeeth Deemed to be University",
    logo: "/images/clients/bharati-vidyapeeth.jpeg",
  },
  {
    name: "Lovely Professional University",
    logo: "/images/clients/lovely-professional-university.jpeg",
  },
  {
    name: "Visvesvaraya Research and Innovation Foundation",
    logo: "/images/clients/visvesvaraya-research-innovation-foundation.jpeg",
  },
  {
    name: "Tilak Maharashtra Vidyapeeth",
    logo: "/images/clients/tilak-maharashtra-vidyapeeth.png",
  },
  {
    name: "MIT-ADT University",
    logo: "/images/clients/mit-adt-university.jpeg",
  },
  {
    name: "D. Y. Patil University",
    logo: "/images/clients/dy-patil-university.jpeg",
  },
  {
    name: "Amity University",
    logo: "/images/clients/amity-university.png",
  },
  {
    name: "Sandip University",
    logo: "/images/clients/sandip-university.png",
  },
  {
    name: "Sir Sri Ravishankar Vidya Mandir",
    logo: "/images/clients/sir-sriravishankar-vidya-mandir.png",
  },
  {
    name: "Challenger Public School",
    logo: "/images/clients/challenger-public-school.png",
  },
  {
    name: "My Rich Dad's Academy",
    logo: "/images/clients/my-rich-dads-academy.png",
  },
  {
    name: "Aditya Horizon School & Junior College",
    logo: "/images/clients/aditya-horizon-school-junior-college.png",
  },
  {
    name: "Vidya Valley",
    logo: "/images/clients/vidya-valley.png",
  },
  {
    name: "Jnana Prabodhini",
    logo: "/images/clients/jnana-prabodhini.png",
  },
  {
    name: "Podar International School",
    logo: "/images/clients/podar-international-school.png",
  },
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
