import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "LMS Dashboard",
  path: "/lms/dashboard",
  description: "View your CITIS learning progress, courses, quizzes, assignments, and certificates.",
  noIndex: true,
});

const stats = [
  { label: "Active courses", value: "03", icon: BookOpen, note: "2 in progress" },
  { label: "Hours learned", value: "24.5", icon: Clock3, note: "This month" },
  { label: "Overall progress", value: "68%", icon: TrendingUp, note: "+12% this week" },
  { label: "Learning streak", value: "07", icon: Flame, note: "Days in a row" },
];

const myCourses = [
  { title: "AI Foundations for Educators", category: "Artificial Intelligence", progress: 68, lesson: "Module 4 · Responsible AI in practice", color: "bg-primary" },
  { title: "Applied Data & Digital Skills", category: "Digital Technology", progress: 42, lesson: "Module 3 · Finding patterns in data", color: "bg-[#d19a14]" },
  { title: "Entrepreneurship & Innovation", category: "Future Skills", progress: 18, lesson: "Module 1 · From idea to opportunity", color: "bg-[#568aa7]" },
];

const availableCourses = [
  { title: "Cyber Security Essentials", level: "Intermediate", duration: "6 weeks", icon: ClipboardCheck },
  { title: "Cloud Computing Fundamentals", level: "Foundation", duration: "5 weeks", icon: Sparkles },
  { title: "Full Stack Web Development", level: "Advanced", duration: "10 weeks", icon: GraduationCap },
];

const quizzes = [
  { title: "Responsible AI checkpoint", course: "AI Foundations", due: "Due today", score: "—" },
  { title: "Data visualisation practice", course: "Applied Data Skills", due: "Due in 3 days", score: "82%" },
  { title: "Innovation mindset quiz", course: "Entrepreneurship", due: "Completed", score: "91%" },
];

const assignments = [
  { title: "Design an AI classroom policy", course: "AI Foundations", status: "In progress", deadline: "26 Aug 2026" },
  { title: "Build a learner insights dashboard", course: "Applied Data Skills", status: "Submitted", deadline: "22 Aug 2026" },
];

export default function LmsDashboardPage() {
  return (
    <section className="bg-[#f5f9fc] py-12 sm:py-16">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Learner dashboard</p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">Good morning, learner.</h1>
            <p className="mt-3 text-muted-foreground">Pick up where you left off and keep your learning moving.</p>
          </div>
          <Button asChild variant="accent"><Link href="/lms/courses">Explore courses <ArrowRight /></Link></Button>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return <Card key={stat.label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 font-heading text-3xl font-bold text-[#123d5c]">{stat.value}</p><p className="mt-1 text-xs text-primary">{stat.note}</p></div><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span></CardContent></Card>;
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your learning</p><h2 className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">My Courses</h2></div>
          <Link href="/lms/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">View all <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {myCourses.map((course) => <Card key={course.title} className="flex h-full flex-col"><CardHeader><div className="flex items-start justify-between gap-3"><Badge variant="outline">{course.category}</Badge><PlayCircle className="size-5 text-primary" /></div><CardTitle className="mt-3 text-lg">{course.title}</CardTitle><p className="text-xs text-muted-foreground">{course.lesson}</p></CardHeader><CardContent className="mt-auto"><div className="flex items-center justify-between text-xs font-semibold"><span className="text-muted-foreground">Progress</span><span className="text-primary">{course.progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} /></div><Button variant="outline" size="sm" className="mt-5 w-full">Continue course <ArrowRight /></Button></CardContent></Card>)}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card><CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Discover</p><CardTitle className="mt-2">Available Courses</CardTitle></div><BookOpenCheck className="size-6 text-primary" /></div></CardHeader><CardContent><div className="divide-y divide-border">{availableCourses.map((course) => { const Icon = course.icon; return <div key={course.title} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span><div><p className="font-semibold text-[#123d5c]">{course.title}</p><p className="mt-1 text-xs text-muted-foreground">{course.level} · {course.duration}</p></div></div><Button asChild variant="ghost" size="sm"><Link href="/lms/courses">View course <ArrowRight /></Link></Button></div>; })}</div></CardContent></Card>
          <Card><CardHeader><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your standing</p><CardTitle className="mt-2">Progress</CardTitle></div><TrendingUp className="size-6 text-primary" /></div></CardHeader><CardContent><div className="flex items-center gap-5"><div className="relative grid size-24 place-items-center rounded-full" style={{ background: "conic-gradient(#0f4c81 68%, #dbeaf0 0)" }}><div className="grid size-16 place-items-center rounded-full bg-white font-heading text-xl font-bold text-[#123d5c]">68%</div></div><div><p className="font-semibold text-[#123d5c]">On track</p><p className="mt-1 text-sm leading-6 text-muted-foreground">You are ahead of 72% of learners this month.</p></div></div><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Lessons completed</span><span className="font-semibold">18 / 26</span></div><div className="flex justify-between"><span className="text-muted-foreground">Quiz average</span><span className="font-semibold">86%</span></div><div className="flex justify-between"><span className="text-muted-foreground">Assignments</span><span className="font-semibold">4 / 6</span></div></div></CardContent></Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Check your knowledge</p><CardTitle className="mt-2">Quizzes</CardTitle></div><ClipboardCheck className="size-6 text-primary" /></div></CardHeader><CardContent><div className="space-y-3">{quizzes.map((quiz) => <div key={quiz.title} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#123d5c]">{quiz.title}</p><p className="mt-1 text-xs text-muted-foreground">{quiz.course}</p></div><span className="text-sm font-bold text-primary">{quiz.score}</span></div><p className={`mt-3 text-xs ${quiz.due === "Completed" ? "text-emerald-600" : "text-muted-foreground"}`}>{quiz.due}</p></div>)}</div></CardContent></Card>
          <Card><CardHeader><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Show your work</p><CardTitle className="mt-2">Assignments</CardTitle></div><FileText className="size-6 text-primary" /></div></CardHeader><CardContent><div className="space-y-3">{assignments.map((assignment) => <div key={assignment.title} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4"><div><p className="font-semibold text-[#123d5c]">{assignment.title}</p><p className="mt-1 text-xs text-muted-foreground">{assignment.course} · {assignment.deadline}</p></div><Badge variant={assignment.status === "Submitted" ? "secondary" : "outline"}>{assignment.status}</Badge></div>)}</div><Button variant="outline" className="mt-5 w-full">View assignments <ArrowRight /></Button></CardContent></Card>
        </div>

        <Card className="mt-6 overflow-hidden border-[#b9d8e6] bg-[linear-gradient(110deg,#123d5c,#0f4c81)] text-white"><CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15 text-[#f9e8a2]"><Award className="size-6" /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f9e8a2]">Achievements</p><h2 className="mt-2 font-heading text-xl font-bold">Certificates</h2><p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Your verified credentials and completed learning milestones will appear here.</p></div></div><Button variant="accent">View certificates <ArrowRight /></Button></CardContent></Card>
      </div>
    </section>
  );
}