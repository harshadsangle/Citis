import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "LMS Courses", path: "/lms/courses", description: "Browse CITIS learning courses and future-ready skill pathways.", noIndex: true });

const courses = [
  { title: "AI Foundations for Educators", category: "Artificial Intelligence", level: "Foundation", duration: "6 weeks", learners: "240 learners", description: "Build practical confidence with responsible AI, digital pedagogy, and classroom-ready applications." },
  { title: "Applied Data & Digital Skills", category: "Digital Technology", level: "Intermediate", duration: "8 weeks", learners: "180 learners", description: "Develop the data fluency and digital problem-solving skills needed in modern academic and professional settings." },
  { title: "Entrepreneurship & Innovation", category: "Future Skills", level: "Foundation", duration: "5 weeks", learners: "320 learners", description: "Move from opportunity discovery to tested ideas through a structured, project-led innovation pathway." },
];

export default function LmsCoursesPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-site">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Learning catalogue</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">Courses for future-ready capability</h1><p className="mt-4 leading-8 text-muted-foreground">Explore structured pathways designed for learners, educators, and professionals building skills that matter.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">{courses.map((course) => <Card key={course.title} className="flex h-full flex-col"><CardHeader><div className="flex items-center justify-between gap-3"><Badge variant="outline">{course.category}</Badge><BookOpenCheck className="size-5 text-primary" /></div><CardTitle className="mt-3">{course.title}</CardTitle></CardHeader><CardContent className="flex flex-1 flex-col"><p className="text-sm leading-7 text-muted-foreground">{course.description}</p><div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{course.duration}</span><span className="flex items-center gap-1.5"><Users className="size-3.5" />{course.learners}</span></div><Link href="/lms/login" className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-primary">View course <ArrowRight className="size-4" /></Link></CardContent></Card>)}</div>
      </div>
    </section>
  );
}