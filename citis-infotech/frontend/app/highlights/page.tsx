import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { CTASection } from "@/components/shared/CTASection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOG_POSTS, CASE_STUDIES } from "@/lib/site-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Highlights", path: "/highlights", description: "Explore CITIS InfoTech ideas, practical education insights, and case studies from institution and industry partnerships." });

export default function HighlightsPage() {
  const sections = [
    { icon: BookOpen, title: "Blogs & perspectives", count: BLOG_POSTS.length, description: "Practical thinking on AI literacy, digital pedagogy, STEM, workforce pathways, faculty capability, and employability.", href: "/highlights/blogs", label: "Explore articles" },
    { icon: TrendingUp, title: "Case studies", count: CASE_STUDIES.length, description: "Stories of universities, schools, skills organisations, and employers turning strategy into measurable learner outcomes.", href: "/highlights/case-studies", label: "View impact stories" },
  ];
  return (
    <>
      <PageHeader eyebrow="Ideas & impact" title="What we are learning with our partners" description="Evidence, field notes, and practical frameworks for leaders shaping education, capability, and workforce opportunity." breadcrumbs={[{ label: "Highlights" }]} />
      <section className="container-site py-16 sm:py-24">
        <AnimatedSection><SectionHeading eyebrow="Explore highlights" title="Insight grounded in the work" description="Our teams share useful patterns and honest lessons from designing, delivering, and improving learning ecosystems." /></AnimatedSection>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return <AnimatedSection key={section.title} delay={index * 0.08}><Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"><div className="brand-gradient relative h-48 p-8 text-white"><div className="absolute -top-16 -right-12 size-56 rounded-full border border-white/15" /><Icon className="size-10 text-orange-300" /><p className="absolute bottom-7 text-sm text-blue-100">{section.count} featured resources</p></div><CardHeader><CardTitle className="text-2xl">{section.title}</CardTitle><CardDescription className="leading-7">{section.description}</CardDescription></CardHeader><CardContent><Link href={section.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">{section.label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></CardContent></Card></AnimatedSection>;
          })}
        </div>
      </section>
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24"><div className="container-site text-center"><AnimatedSection><Lightbulb className="mx-auto size-10 text-accent" /><h2 className="mx-auto mt-5 max-w-3xl font-heading text-3xl font-semibold text-balance sm:text-4xl">Have an education challenge worth exploring together?</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">We welcome conversations with academic leaders, educators, employers, and researchers working on consequential learning questions.</p></AnimatedSection></div></section>
      <CTASection title="Turn insight into an achievable first step" description="Talk with our team about your context, evidence, and the outcome you want to improve." primaryLabel="Start a conversation" secondaryLabel="Explore engagements" secondaryHref="/engagements" />
    </>
  );
}
