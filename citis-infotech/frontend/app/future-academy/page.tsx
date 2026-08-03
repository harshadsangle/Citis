import Link from "next/link";
import { ArrowRight, Award, Bot, BrainCircuit, CheckCircle2, Cloud, Code2, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import { FeatureGrid, ProcessTimeline } from "@/components/marketing/MarketingBlocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TestimonialsSlider } from "@/components/shared/TestimonialsSlider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";
import type { Testimonial } from "@/types";

export const metadata = generatePageMetadata({ title: "Future Academy", path: "/future-academy", description: "Join CITIS Future Academy for mentor-led courses, role-based learning paths, applied projects, and industry-recognised credentials." });

const testimonials: Testimonial[] = [
  { id: 1, name: "Aditi N.", role: "Engineering student", company: "AI Builder Pathway", quote: "The mentors kept asking for evidence, not just a working demo. I learned to evaluate my AI workflow and explain its limitations.", rating: 5 },
  { id: 2, name: "Joseph D.", role: "Career transitioner", company: "Application Developer Pathway", quote: "I went from tutorials to shipping a complete product with a team. My portfolio finally shows how I think and build.", rating: 5 },
  { id: 3, name: "Prof. Lakshmi S.", role: "Faculty champion", company: "Institutional Cohort", quote: "The academy connected faculty support, student projects, and industry mentors without disconnecting learning from our curriculum.", rating: 5 },
];

export default function FutureAcademyPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc_0%,#eaf4ff_62%,#fff7ed_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#10233e_62%,#26170c_100%)]" />
        <div className="container-site grid min-h-[42rem] items-center gap-12 py-20 lg:grid-cols-[1.12fr_0.88fr]">
          <AnimatedSection>
            <Badge variant="secondary" className="mb-6"><Sparkles className="size-3.5" />CITIS Future Academy</Badge>
            <h1 className="max-w-4xl font-heading text-5xl leading-[1.06] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">Learn what’s next. <span className="text-gradient">Prove what you can do.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Mentor-led pathways in AI, software products, cloud, cybersecurity, and human capability—built around real practice and credible evidence.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="accent" size="lg"><Link href="#courses">Explore courses<ArrowRight /></Link></Button><Button asChild variant="outline" size="lg"><Link href="/contact">Talk to an advisor</Link></Button></div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground">{["Live mentorship", "Applied projects", "Verified credentials"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" />{item}</span>)}</div>
          </AnimatedSection>
          <AnimatedSection delay={0.12}><div className="brand-gradient relative overflow-hidden rounded-3xl p-9 text-white shadow-2xl"><div className="absolute -top-24 -right-20 size-72 rounded-full border border-white/15" /><p className="text-xs font-bold tracking-[0.2em] text-orange-300 uppercase">Next cohort</p><p className="mt-4 font-heading text-4xl font-semibold">Applications open</p><p className="mt-3 leading-7 text-blue-100">Choose a focused course or follow a complete role pathway with mentor feedback and a showcase capstone.</p><div className="mt-9 grid grid-cols-2 gap-3">{[["8–20", "weeks"], ["6:1", "mentor ratio"], ["100%", "project-led"], ["Live", "demo day"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-4"><p className="font-heading text-2xl font-semibold">{value}</p><p className="text-xs text-blue-100">{label}</p></div>)}</div></div></AnimatedSection>
        </div>
      </section>
      <div id="courses" className="scroll-mt-20">
        <FeatureGrid eyebrow="Courses" title="Focused learning for in-demand capability" items={[
          { icon: Bot, title: "Applied Generative AI", meta: "10 weeks", description: "Design useful AI workflows, evaluate quality, manage risk, and build a portfolio solution." },
          { icon: Code2, title: "Full-stack Product Builder", meta: "16 weeks", description: "Discover, design, engineer, test, deploy, and present a production-style application." },
          { icon: Cloud, title: "Cloud & DevOps Foundations", meta: "12 weeks", description: "Build secure cloud foundations and automate a reliable path from source to production." },
          { icon: ShieldCheck, title: "Cybersecurity Practitioner", meta: "14 weeks", description: "Develop defensive thinking through labs in identity, networks, applications, and incident response." },
          { icon: BrainCircuit, title: "Data & Machine Learning", meta: "16 weeks", description: "Frame questions, work with data, build models, evaluate evidence, and communicate responsibly." },
          { icon: Users, title: "MoxieMind Career Studio", meta: "8 weeks", description: "Strengthen communication, teamwork, critical thinking, portfolio storytelling, and interview practice." },
        ]} />
      </div>
      <ProcessTimeline eyebrow="Learning paths" title="Choose a destination; build evidence at every stage" steps={[
        { meta: "Start", title: "Explorer", description: "Gain domain literacy, try guided labs, and identify a pathway that fits your goals." },
        { meta: "Build", title: "Practitioner", description: "Develop core capability through structured practice, critique, and authentic tasks." },
        { meta: "Prove", title: "Specialist", description: "Complete advanced challenges and a portfolio capstone with expert review." },
        { meta: "Lead", title: "Innovator", description: "Mentor peers, solve partner briefs, and lead responsible adoption in context." },
      ]} />
      <FeatureGrid eyebrow="Certifications" title="Credentials backed by demonstrated capability" columns={4} items={[
        { icon: Award, title: "Module badges", description: "Granular evidence for a coherent set of assessed skills." },
        { icon: GraduationCap, title: "Academy certificate", description: "Awarded after all pathway outcomes and assessments are met." },
        { icon: Code2, title: "Verified portfolio", description: "Projects, feedback, demonstrations, and reflections in one record." },
        { icon: Users, title: "Industry endorsement", description: "Selected capstones reviewed by practitioners and challenge partners." },
      ]} />
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24">
        <div className="container-site">
          <AnimatedSection><SectionHeading eyebrow="Faculty & mentors" title="Learn with people who build and teach" description="Academy teams combine experienced practitioners, learning designers, faculty, and career coaches." /></AnimatedSection>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{[["Dr. Maya Rao", "Academic Director", "Curriculum, digital pedagogy, and responsible AI"], ["Arjun Desai", "Lead Engineering Mentor", "Product engineering, cloud, and technical leadership"], ["Neha Thomas", "Learner Success Lead", "Coaching, inclusive facilitation, and career progression"]].map(([name, role, bio], index) => <AnimatedSection key={name} delay={index * 0.06}><Card className="h-full"><CardContent className="p-7"><span className="brand-gradient grid size-14 place-items-center rounded-2xl font-heading font-bold text-white">{name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><h3 className="mt-5 font-heading text-xl font-semibold">{name}</h3><p className="mt-1 text-sm font-semibold text-primary">{role}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{bio}</p></CardContent></Card></AnimatedSection>)}</div>
        </div>
      </section>
      <section className="container-site py-16 sm:py-24"><AnimatedSection><SectionHeading align="center" eyebrow="Learner voices" title="Growth you can feel—and show" /></AnimatedSection><AnimatedSection className="mt-10"><TestimonialsSlider testimonials={testimonials} /></AnimatedSection></section>
      <CTASection title="Your next capability starts here" description="Tell us your current experience and destination. A learning advisor will help you choose a course or pathway." primaryLabel="Ask about enrollment" secondaryLabel="Explore all academies" secondaryHref="/products" />
    </>
  );
}
