"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, FileCheck2, GraduationCap, LogOut, Settings2, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleLabel, LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { InstructorCourseManager } from "@/components/lms/InstructorCourseManager";

function OperationsDashboard({ role, instructorName }: { role: "instructor" | "admin"; instructorName?: string }) {
  if (role === "instructor") return <InstructorCourseManager instructorName={instructorName ?? "LMS Instructor"} />;
  const isAdmin = role === "admin";
  const metrics = isAdmin
    ? [{ label: "Total learners", value: "1,248", icon: UsersRound }, { label: "Active courses", value: "42", icon: BookOpen }, { label: "Completion rate", value: "76%", icon: FileCheck2 }]
    : [{ label: "My learners", value: "186", icon: UsersRound }, { label: "Published courses", value: "08", icon: BookOpen }, { label: "Pending reviews", value: "14", icon: ClipboardList }];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => { const Icon = metric.icon; return <Card key={metric.label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 font-heading text-3xl font-bold text-[#123d5c]">{metric.value}</p></div><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span></CardContent></Card>; })}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>{isAdmin ? "Platform activity" : "Teaching activity"}</CardTitle></CardHeader><CardContent><div className="space-y-4 text-sm"><div className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">{isAdmin ? "Learners enrolled this week" : "Assignments awaiting review"}</span><span className="font-semibold text-[#123d5c]">{isAdmin ? "84" : "14"}</span></div><div className="flex items-center justify-between border-b border-border pb-3"><span className="text-muted-foreground">{isAdmin ? "New course requests" : "Active discussion threads"}</span><span className="font-semibold text-[#123d5c]">{isAdmin ? "06" : "23"}</span></div><div className="flex items-center justify-between"><span className="text-muted-foreground">{isAdmin ? "Certificates issued" : "Learner completion this month"}</span><span className="font-semibold text-[#123d5c]">{isAdmin ? "129" : "72%"}</span></div></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Quick actions</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><Button asChild variant="outline"><Link href="/lms/courses">{isAdmin ? "Manage courses" : "View my courses"} <ArrowRight /></Link></Button><Button variant="outline"><Settings2 />Account settings</Button></CardContent></Card>
      </div>
    </div>
  );
}

export function LmsDashboardGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LmsUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LMS_SESSION_KEY);
      if (stored) setUser(JSON.parse(stored) as LmsUser);
    } catch {
      window.localStorage.removeItem(LMS_SESSION_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  function signOut() {
    window.localStorage.removeItem(LMS_SESSION_KEY);
    setUser(null);
  }

  if (!ready) return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading your learning workspace…</div>;
  if (!user) return <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 text-center shadow-sm"><GraduationCap className="mx-auto size-10 text-primary" /><h1 className="mt-4 font-heading text-2xl font-bold text-[#123d5c]">Sign in to access your dashboard</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Choose your LMS role and sign in to continue.</p><Button asChild variant="accent" className="mt-6"><Link href="/lms/login">Go to LMS sign in <ArrowRight /></Link></Button></div>;

  const isStudent = user.role === "student";
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#b9d8e6] bg-white p-5 shadow-sm sm:flex-row sm:items-center"><div><div className="flex items-center gap-3"><h1 className="font-heading text-xl font-bold text-[#123d5c]">{user.name}&apos;s workspace</h1><Badge variant="outline">{getRoleLabel(user.role)}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{isStudent ? "Continue your learning journey." : user.role === "instructor" ? "Create impact through teaching and mentorship." : "Monitor and manage the learning platform."}</p></div><Button variant="ghost" size="sm" onClick={signOut}><LogOut />Sign out</Button></div>
       {isStudent ? children : <OperationsDashboard role={user.role as "instructor" | "admin"} instructorName={user.name} />}
    </div>
  );
}