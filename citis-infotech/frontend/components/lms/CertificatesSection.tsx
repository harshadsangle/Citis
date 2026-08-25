"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle2, Eye, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { LMS_COURSES } from "@/lib/lms-courses";
import { readCompletedLessons } from "@/lib/lms-progress";
import { readEnrolledCourses } from "@/lib/lms-enrollment";
import { readCertificates, saveCertificates, type LmsCertificate } from "@/lib/lms-certificates";

export function CertificatesSection() {
  const [certificates, setCertificates] = useState<LmsCertificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    let studentName = "Student";
    try {
      const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as LmsUser;
        if (user.name) studentName = user.name;
      }
    } catch {
      // Use the generic name when the mock session is unavailable.
    }

    const existing = readCertificates();
    const enrolled = new Set(readEnrolledCourses());
    const earned = LMS_COURSES.filter((course) => {
      if (!enrolled.has(course.slug)) return false;
      const baseline = course.modules.flatMap((module) => module.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id));
      const completed = new Set([...baseline, ...readCompletedLessons(course.slug)]);
      const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
      return completed.size >= totalLessons;
    });

    const next = earned.map((course) => existing.find((certificate) => certificate.courseSlug === course.slug) ?? {
      courseSlug: course.slug,
      courseName: course.title,
      studentName,
      completionDate: new Date().toISOString(),
      status: "Completed" as const,
    });
    saveCertificates(next);
    setCertificates(next);
  }, []);

  return (
    <Card className="mt-6 overflow-hidden border-[#b9d8e6]">
      <CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Achievements</p><CardTitle className="mt-2">Certificates</CardTitle></div><Award className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Complete a course to earn a verified CITIS learning certificate.</p></CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="rounded-2xl bg-[#f5f9fc] p-6 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Award className="size-5" /></span><p className="mt-3 font-semibold text-[#123d5c]">Your certificates will appear here</p><p className="mt-1 text-sm text-muted-foreground">Reach 100% completion in an enrolled course to unlock your first certificate.</p></div>
        ) : (
          <div className="space-y-4">{certificates.map((certificate) => { const isSelected = selectedCertificate === certificate.courseSlug; return <div key={certificate.courseSlug} className="rounded-2xl border border-border p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span><div><h3 className="font-semibold text-[#123d5c]">{certificate.courseName}</h3><p className="mt-1 text-sm text-muted-foreground">Completed by {certificate.studentName} · {new Date(certificate.completionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div></div><div className="flex items-center gap-3"><Badge variant="success"><CheckCircle2 className="size-3.5" />{certificate.status}</Badge><Button variant="outline" size="sm" onClick={() => setSelectedCertificate(isSelected ? null : certificate.courseSlug)}><Eye />{isSelected ? "Hide Certificate" : "View Certificate"}</Button></div></div>{isSelected && <div className="mt-5 rounded-xl border border-[#d8bf5c] bg-[linear-gradient(120deg,#fffdf1,#f8f0c8)] p-6 text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6c08]">CITIS InfoTech · Certificate of Completion</p><h4 className="mt-3 font-heading text-xl font-bold text-[#123d5c]">{certificate.courseName}</h4><p className="mt-2 text-sm text-muted-foreground">Awarded to {certificate.studentName}</p><p className="mt-1 text-xs text-muted-foreground">Completed on {new Date(certificate.completionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>}</div>; })}</div>
        )}
      </CardContent>
    </Card>
  );
}