"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { readEnrolledCourses, saveEnrolledCourse } from "@/lib/lms-enrollment";

export function EnrollmentButton({ courseSlug }: { courseSlug: string }) {
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEnrolled(readEnrolledCourses().includes(courseSlug));
    const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
    let user: LmsUser | null = null;
    try {
      user = storedUser ? JSON.parse(storedUser) as LmsUser : null;
    } catch {
      user = null;
    }
    if (user?.role !== "student") return;
    void fetch("/api/lms/enrollments")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { enrollments?: Array<{ course?: { slug: string } }> };
        if (result.enrollments?.some((enrollment) => enrollment.course?.slug === courseSlug)) setEnrolled(true);
      })
      .catch(() => undefined);
  }, [courseSlug]);

  async function enroll() {
    const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
    let user: LmsUser | null = null;
    try {
      user = storedUser ? JSON.parse(storedUser) as LmsUser : null;
    } catch {
      user = null;
    }
    if (user?.role !== "student") return;
    setError("");
    const response = await fetch("/api/lms/enrollments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseSlug }) }).catch(() => null);
    if (response?.ok || response?.status === 409) {
      saveEnrolledCourse(courseSlug);
      setEnrolled(true);
      return;
    }
    if (!response || response.status === 401) {
      // Preserve the previous browser-only experience for legacy local sessions.
      saveEnrolledCourse(courseSlug);
      setEnrolled(true);
      return;
    }
    const result = await response.json() as { error?: string };
    setError(result.error ?? "Unable to enroll in this course right now.");
  }

  if (enrolled) {
    return <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />You are enrolled in this course</p><Button asChild variant="accent"><Link href="/lms/dashboard">Go to dashboard</Link></Button></div>;
  }

  return <div className="flex flex-col items-start gap-2"><Button size="lg" variant="accent" onClick={enroll}><GraduationCap />Enroll Now</Button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}</div>;
}