import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "LMS Dashboard", path: "/lms/dashboard", description: "View your CITIS learning progress and active courses.", noIndex: true });

const stats = [
  { label: "Active courses", value: "03", icon: BookOpen },
  { label: "Hours learned", value: "24.5", icon: Clock3 },
  { label: "Completion", value: "68%", icon: TrendingUp },
];

export default function LmsDashboardPage() {
  return (
    <section className="bg-[#f5f9fc] py-14 sm:py-20">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Learner dashboard</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">Good morning, learner.</h1><p className="mt-3 text-muted-foreground">Pick up where you left off and keep your learning moving.</p></div>
          <Button asChild variant="accent"><Link href="/lms/courses">Explore courses <ArrowRight /></Link></Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{stats.map((stat) => { const Icon = stat.icon; return <Card key={stat.label}><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 font-heading text-3xl font-bold text-[#123d5c]">{stat.value}</p></div><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span></CardContent></Card>; })}</div>
        <Card className="mt-8"><CardHeader><CardTitle>Continue learning</CardTitle></CardHeader><CardContent><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#123d5c]">AI Foundations for Educators</p><p className="mt-1 text-sm text-muted-foreground">Module 4 of 6 · Responsible AI in practice</p><div className="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-secondary"><div className="h-full w-[68%] rounded-full bg-primary" /></div></div><div className="flex items-center gap-2 text-sm font-semibold text-primary"><CheckCircle2 className="size-4" />68% complete</div></div></CardContent></Card>
      </div>
    </section>
  );
}