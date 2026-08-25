"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoleLabel, LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { InstructorCourseManager } from "@/components/lms/InstructorCourseManager";
import { AdminDashboard } from "@/components/lms/AdminDashboard";

function OperationsDashboard({ role, instructorName }: { role: "instructor" | "admin"; instructorName?: string }) {
  if (role === "instructor") return <InstructorCourseManager instructorName={instructorName ?? "LMS Instructor"} />;
  return <AdminDashboard />;
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