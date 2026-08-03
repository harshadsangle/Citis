import { BadgeCheck, BrainCircuit, Database, FlaskConical, Scale, Users } from "lucide-react";
import { AcademyPage, type AcademyConfig } from "@/components/marketing/AcademyPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "AI Future Academy", path: "/products/ai-future-academy", description: "Build practical, responsible AI capability through foundations, applied labs, mentor feedback, and portfolio-ready projects." });

const config: AcademyConfig = {
  name: "AI Future Academy",
  eyebrow: "CITIS InfoTech learning academy",
  tagline: "Understand AI. Build responsibly. Shape what comes next.",
  description: "A progressive academy for learners, educators, and professionals who want to move from AI awareness to confident, ethical application in their discipline.",
  audience: "University learners, faculty, school educators, and working professionals",
  features: [
    { icon: BrainCircuit, title: "Role-based pathways", description: "Foundational, practitioner, builder, and leader journeys mapped to real contexts." },
    { icon: FlaskConical, title: "Applied AI labs", description: "Guided experiments with data, models, prompts, evaluation, and workflow design." },
    { icon: Scale, title: "Responsible practice", description: "Privacy, bias, safety, explainability, integrity, and human oversight throughout." },
    { icon: Users, title: "Expert mentorship", description: "Structured critique from AI practitioners, learning specialists, and domain experts." },
    { icon: Database, title: "Authentic datasets", description: "Context-rich challenges that develop judgment as well as technical fluency." },
    { icon: BadgeCheck, title: "Verified evidence", description: "Assessments, portfolio artefacts, demonstrations, and stackable credentials." },
  ],
  benefits: ["Build shared AI literacy across an institution.", "Connect AI capability to specific disciplines and roles.", "Give faculty practical support for assessment redesign.", "Create portfolio evidence beyond course completion.", "Balance experimentation with clear responsible-use guardrails.", "Offer modular pathways that can carry credit or stand alone."],
  outcomes: ["Explain how contemporary AI systems work, where they fail, and when not to use them.", "Frame a meaningful problem and assess whether AI is an appropriate response.", "Prepare and evaluate data with attention to quality, privacy, and bias.", "Design and test generative-AI workflows using transparent evaluation criteria.", "Communicate risk, evidence, limitations, and human oversight decisions.", "Build and present an applied AI project relevant to a discipline or role."],
  curriculum: [
    { title: "AI foundations & critical literacy", description: "Develop a clear mental model of AI, data, machine learning, and generative systems.", topics: ["AI landscape", "Data foundations", "Model behaviour", "Critical evaluation"] },
    { title: "Prompting, workflows & evaluation", description: "Move beyond prompt tricks to repeatable workflows with useful quality measures.", topics: ["Prompt patterns", "Retrieval", "Evaluation", "Human review"] },
    { title: "Applied machine learning", description: "Explore the end-to-end lifecycle from a well-framed question to validated insight.", topics: ["Problem framing", "Feature thinking", "Model selection", "Metrics"] },
    { title: "Responsible AI by design", description: "Apply ethical, legal, privacy, security, and accessibility considerations in context.", topics: ["Bias", "Privacy", "Safety", "Governance"] },
    { title: "Portfolio capstone", description: "Build, document, test, and present a useful AI application or adoption plan.", topics: ["Prototype", "Evidence", "Documentation", "Demo day"] },
  ],
};

export default function AIFutureAcademyPage() {
  return <AcademyPage config={config} />;
}
