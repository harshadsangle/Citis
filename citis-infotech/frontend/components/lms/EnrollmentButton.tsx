"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EnrollmentButton() {
  const [enrolled, setEnrolled] = useState(false);

  if (enrolled) {
    return <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />You are enrolled in this course</p><Button asChild variant="accent"><Link href="/lms/dashboard">Go to dashboard</Link></Button></div>;
  }

  return <Button size="lg" variant="accent" onClick={() => setEnrolled(true)}><GraduationCap />Enroll in this course</Button>;
}