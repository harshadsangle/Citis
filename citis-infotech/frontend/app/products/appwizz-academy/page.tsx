import { BadgeCheck, Cloud, Code2, GitBranch, Layout, Lightbulb } from "lucide-react";
import { AcademyPage, type AcademyConfig } from "@/components/marketing/AcademyPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "AppWizz Academy", path: "/products/appwizz-academy", description: "Learn product thinking, UX, full-stack application development, cloud delivery, and professional engineering through real projects." });

const config: AcademyConfig = {
  name: "AppWizz Academy",
  eyebrow: "CITIS InfoTech builder academy",
  tagline: "From an idea to a product people can use.",
  description: "An immersive software-product pathway where aspiring developers learn to discover real needs, make sound technical decisions, ship reliable applications, and work like a modern product team.",
  audience: "University students, aspiring developers, career changers, and campus cohorts",
  features: [
    { icon: Lightbulb, title: "Product discovery", description: "Research users, define outcomes, test assumptions, and choose a valuable first release." },
    { icon: Layout, title: "Human-centred UX", description: "Information architecture, responsive interfaces, accessibility, and evidence-led iteration." },
    { icon: Code2, title: "Full-stack engineering", description: "Modern frontend, APIs, data, authentication, testing, and maintainable architecture." },
    { icon: Cloud, title: "Cloud delivery", description: "Environments, automation, observability, security, performance, and reliable releases." },
    { icon: GitBranch, title: "Team practice", description: "Agile planning, source control, code review, documentation, and constructive critique." },
    { icon: BadgeCheck, title: "Portfolio launch", description: "A deployed product, technical case study, live demonstration, and verified skills profile." },
  ],
  benefits: ["Learn the whole product lifecycle—not isolated syntax.", "Build a production-style application with a real audience.", "Receive regular code, design, and product feedback.", "Practise collaboration in accountable delivery teams.", "Understand quality, accessibility, privacy, and security by design.", "Graduate with credible evidence for interviews and internships."],
  outcomes: ["Investigate a user problem and translate evidence into a focused product brief.", "Design accessible, responsive interfaces and validate core user journeys.", "Build tested frontend, backend, and data capabilities using modern patterns.", "Implement secure identity, permissions, validation, and error handling.", "Deploy, observe, and improve a cloud-hosted application.", "Explain technical decisions and demonstrate a complete portfolio product."],
  curriculum: [
    { title: "Product thinking & discovery", description: "Begin with people, context, and outcomes before committing to features or technology.", topics: ["User research", "Problem framing", "Value proposition", "MVP"] },
    { title: "UX & frontend foundations", description: "Design clear journeys and build responsive, accessible, component-based interfaces.", topics: ["Figma", "Accessibility", "React", "Design systems"] },
    { title: "Backend, APIs & data", description: "Model information and create reliable services for real application behaviour.", topics: ["TypeScript", "APIs", "SQL", "Authentication"] },
    { title: "Quality & cloud delivery", description: "Treat testing, security, performance, observability, and deployment as product work.", topics: ["Testing", "CI/CD", "Cloud", "Monitoring"] },
    { title: "Launch studio", description: "Work in a product team to plan, build, validate, deploy, and present a complete release.", topics: ["Sprints", "Code review", "Analytics", "Demo day"] },
  ],
};

export default function AppWizzAcademyPage() {
  return <AcademyPage config={config} />;
}
