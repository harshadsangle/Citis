import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Learning Management System",
  path: "/lms",
  description: "Access courses, learning paths, progress, and credentials through the CITIS learning portal.",
});

export default function LmsPage() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)]" />
      <div className="container-site">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">CITIS Learning Portal</p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-[#123d5c] sm:text-5xl">Learn, practise, and grow with purpose.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">A focused learning space for courses, practical projects, mentor guidance, and measurable progress.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg"><Link href="/lms/login">Sign in to LMS <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/lms/courses">Browse courses</Link></Button>
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: BookOpenCheck, title: "Structured learning", text: "Follow clear paths from foundations to future-ready skills." },
            { icon: Sparkles, title: "Practical progress", text: "Build evidence through projects, practice, and reflection." },
            { icon: GraduationCap, title: "Recognised outcomes", text: "Work toward certificates and career-relevant credentials." },
          ].map((item) => {
            const Icon = item.icon;
            return <Card key={item.title}><CardHeader><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><CardTitle>{item.title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{item.text}</p></CardContent></Card>;
          })}
        </div>
      </div>
    </section>
  );
}