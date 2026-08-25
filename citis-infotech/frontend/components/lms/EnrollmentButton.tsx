"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { readEnrolledCourses, saveEnrolledCourse } from "@/lib/lms-enrollment";

export function EnrollmentButton({ courseSlug }: { courseSlug: string }) {
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    setEnrolled(readEnrolledCourses().includes(courseSlug));
  }, [courseSlug]);

  function enroll() {
    const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
    let user: LmsUser | null = null;
    try {
      user = storedUser ? JSON.parse(storedUser) as LmsUser : null;
    } catch {
      user = null;
    }
    if (user?.role !== "student") return;
    saveEnrolledCourse(courseSlug);
    setEnrolled(true);
  }

  if (enrolled) {
    return <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />You are enrolled in this course</p><Button asChild variant="accent"><Link href="/lms/dashboard">Go to dashboard</Link></Button></div>;
  }

  return <Button size="lg" variant="accent" onClick={enroll}><GraduationCap />Enroll Now</Button>;
}