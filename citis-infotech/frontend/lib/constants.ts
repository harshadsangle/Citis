import {
  BarChart3,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Cloud,
  Code2,
  Factory,
  HeartPulse,
  Landmark,
  Lightbulb,
  MessagesSquare,
  MonitorSmartphone,
  Network,
  Newspaper,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

export const SITE_CONFIG = {
  name: "CITIS InfoTech",
  legalName: "CITIS Infotech Pvt. Ltd.",
  description:
    "Technology consulting, digital engineering, cloud, data and AI solutions that move ambitious businesses forward.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.citisinfotech.com",
  email: "info@citisinfotech.com",
  phone: "+91 80 4123 4567",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Engagements", href: "/engagements", megaMenu: "engagements" },
  { label: "Products", href: "/products", megaMenu: "products" },
  { label: "Highlights", href: "/highlights", megaMenu: "highlights" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

export const MEGA_MENUS = {
  engagements: {
    eyebrow: "How we help",
    title: "Engineering outcomes, not just software",
    featured: {
      label: "Explore our capabilities",
      href: "/engagements",
      description: "From strategy to scale, one accountable technology partner.",
    },
    items: [
      { title: "Digital Engineering", href: "/engagements/digital-engineering", description: "Modern web, mobile and platform experiences.", icon: Code2 },
      { title: "Cloud & DevOps", href: "/engagements/cloud-devops", description: "Secure, resilient cloud transformation.", icon: Cloud },
      { title: "Data & AI", href: "/engagements/data-ai", description: "Turn trusted data into intelligent action.", icon: Bot },
      { title: "Cybersecurity", href: "/engagements/cybersecurity", description: "Protect systems, customers and growth.", icon: ShieldCheck },
      { title: "Product Consulting", href: "/engagements/product-consulting", description: "Validate, design and launch faster.", icon: Lightbulb },
      { title: "Dedicated Teams", href: "/engagements/dedicated-teams", description: "Specialist teams that integrate seamlessly.", icon: Users },
    ],
  },
  products: {
    eyebrow: "Our products",
    title: "Purpose-built platforms for modern operations",
    featured: {
      label: "View product portfolio",
      href: "/products",
      description: "Composable solutions designed around real business workflows.",
    },
    items: [
      { title: "CITIS Connect", href: "/products/connect", description: "Unified customer engagement platform.", icon: MessagesSquare },
      { title: "CITIS Insights", href: "/products/insights", description: "Decision intelligence and live analytics.", icon: BarChart3 },
      { title: "CITIS Flow", href: "/products/flow", description: "Automate work across teams and systems.", icon: Network },
      { title: "Commerce Suite", href: "/products/commerce", description: "Scalable omnichannel commerce operations.", icon: ShoppingCart },
      { title: "Industry Cloud", href: "/products/industry-cloud", description: "Secure, ready-to-adapt cloud foundations.", icon: Boxes },
      { title: "Experience Studio", href: "/products/experience-studio", description: "Build consistent digital journeys.", icon: MonitorSmartphone },
    ],
  },
  highlights: {
    eyebrow: "Ideas & impact",
    title: "What we are learning and building",
    featured: {
      label: "See all highlights",
      href: "/highlights",
      description: "Practical insights from our teams and client partnerships.",
    },
    items: [
      { title: "Case Studies", href: "/case-studies", description: "Measurable results from complex challenges.", icon: Rocket },
      { title: "Insights", href: "/insights", description: "Perspectives on technology and transformation.", icon: Sparkles },
      { title: "Newsroom", href: "/news", description: "Company news, announcements and media.", icon: Newspaper },
      { title: "Financial Services", href: "/industries/financial-services", description: "Digital trust for financial institutions.", icon: Landmark },
      { title: "Healthcare", href: "/industries/healthcare", description: "Connected, human-centered care.", icon: HeartPulse },
      { title: "Manufacturing", href: "/industries/manufacturing", description: "Smarter, more resilient operations.", icon: Factory },
    ],
  },
} as const;

export const OFFICES = [
  {
    name: "Bangalore Office",
    address: "No. 48, 2nd Floor, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    phone: "+91 80 4123 4567",
    email: "bangalore@citisinfotech.com",
  },
  {
    name: "Corporate Office",
    address: "CITIS Tech Park, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103",
    phone: "+91 80 4890 1200",
    email: "corporate@citisinfotech.com",
  },
] as const;

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/citis-infotech" },
  { label: "X", href: "https://x.com/citisinfotech" },
  { label: "YouTube", href: "https://www.youtube.com/@citisinfotech" },
  { label: "Instagram", href: "https://www.instagram.com/citisinfotech" },
] as const;

export const STATISTICS = [
  { value: 15, suffix: "+", label: "Years of innovation" },
  { value: 250, suffix: "+", label: "Digital specialists" },
  { value: 180, suffix: "+", label: "Solutions delivered" },
  { value: 12, suffix: "", label: "Countries served" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers", icon: BriefcaseBusiness },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Engagements", href: "/engagements" },
      { label: "Products", href: "/products" },
      { label: "Case studies", href: "/case-studies" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Financial services", href: "/industries/financial-services" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "Retail", href: "/industries/retail" },
      { label: "Manufacturing", href: "/industries/manufacturing", icon: Building2 },
    ],
  },
] as const;
