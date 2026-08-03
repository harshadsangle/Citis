import { BadgeCheck, BrainCircuit, Lightbulb, MessageCircle, Target, Users } from "lucide-react";
import { AcademyPage, type AcademyConfig } from "@/components/marketing/AcademyPage";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "MoxieMind", path: "/products/moxiemind", description: "Develop communication, critical thinking, collaboration, wellbeing, leadership, and career agency through experiential learning." });

const config: AcademyConfig = {
  name: "MoxieMind",
  eyebrow: "CITIS InfoTech human capability academy",
  tagline: "Think clearly. Connect deeply. Move with courage.",
  description: "An experiential academy for the human capabilities that help learners navigate study, work, relationships, and change with self-awareness, skill, and purpose.",
  audience: "Secondary learners, university students, educators, and early-career teams",
  features: [
    { icon: BrainCircuit, title: "Self-awareness", description: "Recognise strengths, values, emotions, habits, and the conditions needed to do good work." },
    { icon: MessageCircle, title: "Communication", description: "Listen, structure ideas, present with clarity, write purposefully, and navigate difficult dialogue." },
    { icon: Lightbulb, title: "Critical thinking", description: "Question assumptions, evaluate evidence, solve ambiguous problems, and make reasoned decisions." },
    { icon: Users, title: "Collaboration", description: "Build trust, contribute in diverse teams, give feedback, manage conflict, and share accountability." },
    { icon: Target, title: "Career agency", description: "Explore possibilities, tell an evidence-based story, grow networks, and own the next step." },
    { icon: BadgeCheck, title: "Reflective evidence", description: "Demonstrations, peer feedback, journals, scenarios, and portfolios show growth in practice." },
  ],
  benefits: ["Create a shared capability language across learner support and curriculum.", "Help learners transfer soft skills into observable professional behaviour.", "Strengthen confidence without promoting performative certainty.", "Give educators structured activities and useful feedback tools.", "Support wellbeing, belonging, and responsible leadership together.", "Connect reflection to practical action and portfolio evidence."],
  outcomes: ["Communicate ideas clearly across written, spoken, visual, and digital contexts.", "Listen with intent, ask productive questions, and respond constructively.", "Evaluate claims and make decisions using evidence, perspective, and ethics.", "Contribute reliably in diverse teams and work through disagreement.", "Manage attention, emotion, feedback, and setbacks with adaptive strategies.", "Articulate strengths and experiences in a credible career narrative."],
  curriculum: [
    { title: "Self, energy & purpose", description: "Build a realistic understanding of strengths, values, emotions, motivation, and wellbeing.", topics: ["Self-awareness", "Values", "Habits", "Resilience"] },
    { title: "Communication that connects", description: "Practise listening, dialogue, presentation, writing, feedback, and influence.", topics: ["Listening", "Storytelling", "Writing", "Feedback"] },
    { title: "Thinking through complexity", description: "Use questions, evidence, systems, creativity, and ethical reasoning in ambiguous situations.", topics: ["Critical thinking", "Problem solving", "Systems", "Decisions"] },
    { title: "Teams, belonging & leadership", description: "Create trust, collaborate across difference, manage conflict, and lead from any role.", topics: ["Teamwork", "Inclusion", "Conflict", "Leadership"] },
    { title: "Career agency studio", description: "Translate capability into a portfolio, network, career story, and purposeful action plan.", topics: ["Career exploration", "Portfolio", "Networking", "Interviews"] },
  ],
};

export default function MoxieMindPage() {
  return <AcademyPage config={config} />;
}
