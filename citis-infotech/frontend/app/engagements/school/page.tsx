import { Blocks, Bot, BookOpen, Laptop, Microscope, Presentation, Radio, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FeatureGrid, ProcessTimeline, SplitFeature } from "@/components/marketing/MarketingBlocks";
import { CTASection } from "@/components/shared/CTASection";
import { FAQ } from "@/components/shared/FAQ";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "School Engagement", path: "/engagements/school", description: "Future-ready school programmes from CITIS InfoTech: ICT integration, STEM education, educator development, and digital citizenship." });

export default function SchoolPage() {
  return (
    <>
      <PageHeader eyebrow="School engagement" title="Tomorrow’s schools nurture curious, capable creators" description="We help school communities use technology with purpose—strengthening teaching, inquiry, creativity, wellbeing, and responsible participation." breadcrumbs={[{ label: "Engagements", href: "/engagements" }, { label: "School" }]} />
      <SplitFeature eyebrow="Tomorrow’s schools" title="A whole-school pathway to future readiness" description="Transformation succeeds when vision, pedagogy, teacher confidence, infrastructure, and family engagement advance together." points={["Age-appropriate digital capability", "Inquiry and interdisciplinary projects", "Safe, ethical technology use", "Teacher planning and coaching", "Inclusive learning design", "Evidence for school improvement"]} stat={{ value: "Curiosity → Creation → Confidence", label: "Learners ask better questions, test ideas, explain thinking, and contribute responsibly." }} />
      <FeatureGrid eyebrow="ICT integration" title="Technology that improves the learning experience" items={[
        { icon: Laptop, title: "Digital foundations", description: "Productivity, information literacy, collaboration, accessibility, and responsible online participation." },
        { icon: Presentation, title: "Classroom integration", description: "Subject-specific activities and assessment that make technology meaningful, not distracting." },
        { icon: Bot, title: "AI literacy", description: "Developmentally appropriate understanding of AI, bias, verification, privacy, and human judgment." },
        { icon: Radio, title: "Digital citizenship", description: "Safety, empathy, identity, media literacy, and wellbeing for learners and families." },
        { icon: Users, title: "Teacher capability", description: "Demonstration, co-planning, coaching, and communities of practice that sustain adoption." },
        { icon: BookOpen, title: "Learning evidence", description: "Portfolios and observation tools that make digital progression visible across grades." },
      ]} />
      <FeatureGrid eyebrow="STEM education" title="From wondering to designing" columns={4} items={[
        { icon: Microscope, title: "Inquiry science", description: "Investigate phenomena, gather evidence, and build explanations." },
        { icon: Blocks, title: "Design & making", description: "Define needs, prototype, test, improve, and communicate." },
        { icon: Bot, title: "Coding & robotics", description: "Build computational thinking through physical and digital systems." },
        { icon: Radio, title: "Climate & community", description: "Apply STEM to meaningful local and global challenges." },
      ]} />
      <ProcessTimeline eyebrow="Implementation" title="A school-owned model for sustainable change" steps={[
        { title: "Listen", description: "Understand school vision, learner context, educator confidence, and current resources." },
        { title: "Design", description: "Create a grade-banded pathway, implementation calendar, and evidence framework." },
        { title: "Enable", description: "Prepare teachers and leaders through practical studios, modelling, and coaching." },
        { title: "Improve", description: "Review learner work, classroom practice, participation, and community feedback." },
      ]} />
      <FAQ title="School partnership questions" items={[
        { question: "Can programmes align with our existing board curriculum?", answer: "Yes. We map experiences to your board, grade-level outcomes, timetable, and available resources rather than creating a competing curriculum." },
        { question: "Do you provide teacher training?", answer: "Teacher capability is central to every school engagement. Support can include workshops, co-planning, demonstration lessons, coaching, and lead-teacher development." },
        { question: "Can CITIS set up a STEM or innovation lab?", answer: "Yes. We support needs analysis, space and equipment planning, curriculum, facilitator enablement, operating processes, safety, and impact review." },
      ]} />
      <CTASection title="Design a future-ready pathway for every learner" description="Start with a school readiness conversation and a practical roadmap for your context." primaryLabel="Request a school consultation" secondaryLabel="Explore STEM academies" secondaryHref="/products" />
    </>
  );
}
