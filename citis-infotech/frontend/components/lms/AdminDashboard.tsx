"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, CircleUserRound, FileCheck2, GraduationCap, LibraryBig, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { LMS_COURSES, type LmsCourse } from "@/lib/lms-courses";

const INSTRUCTOR_COURSES_KEY = "citis-lms-instructor-courses";

function readManagedCourses() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(INSTRUCTOR_COURSES_KEY) ?? "[]");
    const custom = Array.isArray(stored) ? stored as LmsCourse[] : [];
    const overrides = new Map(custom.map((course) => [course.slug, course]));
    return [...LMS_COURSES.map((course) => overrides.get(course.slug) ?? course), ...custom.filter((course) => !LMS_COURSES.some((base) => base.slug === course.slug))];
  } catch {
    return LMS_COURSES;
  }
}

export function AdminDashboard() {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [localProfile, setLocalProfile] = useState<LmsUser | null>(null);

  useEffect(() => {
    setCourses(readManagedCourses());
    try {
      const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
      if (storedUser) setLocalProfile(JSON.parse(storedUser) as LmsUser);
    } catch {
      setLocalProfile(null);
    }
  }, []);

  const totalStudents = courses.reduce((total, course) => {
    const learners = Number.parseInt(course.learners.replace(/[^0-9]/g, ""), 10);
    return total + (Number.isFinite(learners) ? learners : 0);
  }, 0);
  const totalInstructors = new Set(courses.map((course) => course.instructor)).size;
  const publishedCourses = courses.filter((course) => (course.status ?? "Published") === "Published").length;
  const metrics = [
    { label: "Total Students", value: totalStudents.toLocaleString("en-IN"), icon: UsersRound },
    { label: "Total Instructors", value: totalInstructors.toString().padStart(2, "0"), icon: GraduationCap },
    { label: "Total Courses", value: courses.length.toString().padStart(2, "0"), icon: LibraryBig },
    { label: "Published Courses", value: publishedCourses.toString().padStart(2, "0"), icon: FileCheck2 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => { const Icon = metric.icon; return <Card key={metric.label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 font-heading text-3xl font-bold text-[#123d5c]">{metric.value}</p></div><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span></CardContent></Card>; })}</div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card><CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Administration</p><CardTitle className="mt-2">Course Management</CardTitle></div><BookOpen className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Review course status and programme structure across the LMS.</p></CardHeader><CardContent><div className="space-y-3">{courses.map((course) => <div key={course.slug} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#123d5c]">{course.title}</p><Badge variant={(course.status ?? "Published") === "Published" ? "success" : "outline"}>{course.status ?? "Published"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{course.instructor} · {course.modules.length} modules · {course.duration}</p></div><Button asChild variant="ghost" size="sm"><Link href={`/lms/courses/${course.slug}`}>View <ArrowRight /></Link></Button></div>)}</div></CardContent></Card>
        <Card><CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Access control</p><CardTitle className="mt-2">User Management</CardTitle></div><CircleUserRound className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Monitor LMS roles using the current browser session.</p></CardHeader><CardContent><div className="space-y-4">{["Student", "Instructor", "Admin"].map((role) => { const isCurrent = localProfile && role.toLowerCase() === localProfile.role; return <div key={role} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><UsersRound className="size-4" /></span><div><p className="text-sm font-semibold text-[#123d5c]">{role}</p><p className="text-xs text-muted-foreground">{isCurrent ? localProfile.email : "Role available"}</p></div></div>{isCurrent ? <Badge variant="success"><CheckCircle2 className="size-3.5" />Current</Badge> : <Badge variant="outline"><CircleUserRound className="size-3.5" />Access</Badge>}</div>; })}</div><Button asChild variant="outline" className="mt-6 w-full"><Link href="/lms/register">Add user <ArrowRight /></Link></Button></CardContent></Card>
      </div>
    </div>
  );
}