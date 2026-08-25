"use client";

import { useEffect, useState } from "react";
import { BarChart3, BookOpen, ClipboardCheck, FileCheck2, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";
import { LMS_COURSES } from "@/lib/lms-courses";
import { readCompletedLessons } from "@/lib/lms-progress";
import { readEnrolledCourses } from "@/lib/lms-enrollment";
import { readAssignmentSubmissions } from "@/lib/lms-assignments";
import { readQuizScore } from "@/lib/lms-quiz";

type LearnerRow = {
  studentName: string;
  courseName: string;
  progress: number;
  quizScore: string;
  assignmentStatus: "Submitted" | "Not submitted";
};

export function InstructorLearners() {
  const [learners, setLearners] = useState<LearnerRow[]>([]);

  useEffect(() => {
    let studentName = "Demo student";
    try {
      const storedUser = window.localStorage.getItem(LMS_SESSION_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as LmsUser;
        if (user.role === "student" && user.name) studentName = user.name;
      }
    } catch {
      // Keep the local demo learner name when the mock session is unavailable.
    }

    const enrolled = new Set(readEnrolledCourses());
    const rows = LMS_COURSES.filter((course) => enrolled.has(course.slug)).map((course) => {
      const baseline = course.modules.flatMap((module) => module.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id));
      const completed = new Set([...baseline, ...readCompletedLessons(course.slug)]);
      const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
      const progress = totalLessons ? Math.round((completed.size / totalLessons) * 100) : 0;
      const score = readQuizScore(course.slug);
      const assignmentStatus = Object.values(readAssignmentSubmissions(course.slug)).some(Boolean) ? "Submitted" : "Not submitted";
      return { studentName, courseName: course.title, progress, quizScore: score === null ? "Not attempted" : `${Math.round((score / course.quiz.length) * 100)}%`, assignmentStatus };
    });
    setLearners(rows);
  }, []);

  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Learner support</p><CardTitle className="mt-2">My Learners</CardTitle></div><UsersRound className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Track learner activity from the locally saved LMS data.</p></CardHeader>
      <CardContent>
        {learners.length === 0 ? (
          <div className="rounded-2xl bg-[#f5f9fc] p-6 text-center"><UsersRound className="mx-auto size-8 text-primary" /><p className="mt-3 font-semibold text-[#123d5c]">No learner activity yet</p><p className="mt-1 text-sm text-muted-foreground">Enrolled learners will appear here with their course activity.</p></div>
        ) : (
          <div className="space-y-3">{learners.map((learner) => <div key={`${learner.studentName}-${learner.courseName}`} className="rounded-2xl border border-border p-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0 xl:w-[28%]"><p className="font-semibold text-[#123d5c]">{learner.studentName}</p><p className="mt-1 text-xs text-muted-foreground">Student</p></div><div className="flex min-w-0 items-center gap-2 text-sm xl:w-[28%]"><BookOpen className="size-4 shrink-0 text-primary" /><span className="truncate">{learner.courseName}</span></div><div className="flex items-center gap-3 text-sm xl:w-[18%]"><BarChart3 className="size-4 text-primary" /><div className="min-w-24"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{learner.progress}%</span></div><div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${learner.progress}%` }} /></div></div></div><div className="flex items-center gap-2 text-sm xl:w-[13%]"><ClipboardCheck className="size-4 text-primary" /><span>Quiz: <strong>{learner.quizScore}</strong></span></div><div className="flex items-center gap-2 text-sm xl:w-[13%]"><FileCheck2 className="size-4 text-primary" /><Badge variant={learner.assignmentStatus === "Submitted" ? "success" : "outline"}>{learner.assignmentStatus}</Badge></div></div></div>)}</div>
        )}
      </CardContent>
    </Card>
  );
}