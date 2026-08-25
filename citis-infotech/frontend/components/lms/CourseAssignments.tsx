"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseAssignment } from "@/lib/lms-courses";
import { assignmentStorageKey, type AssignmentSubmissions } from "@/lib/lms-assignments";

export function CourseAssignments({ courseSlug, assignments }: { courseSlug: string; assignments: CourseAssignment[] }) {
  const [answers, setAnswers] = useState<AssignmentSubmissions>({});
  const [submitted, setSubmitted] = useState<AssignmentSubmissions>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(assignmentStorageKey(courseSlug)) ?? "{}") as SubmissionMap;
      setAnswers(stored);
      setSubmitted(stored);
    } catch {
      setAnswers({});
      setSubmitted({});
    }
  }, [courseSlug]);

  function submitAssignment(assignmentId: string) {
    const answer = answers[assignmentId]?.trim();
    if (!answer) return;
    const next = { ...submitted, [assignmentId]: answer };
    setSubmitted(next);
    setAnswers(next);
    window.localStorage.setItem(assignmentStorageKey(courseSlug), JSON.stringify(next));
  }

  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Show your work</p><CardTitle className="mt-2">Assignments</CardTitle></div><ClipboardList className="size-6 text-primary" /></div><p className="text-sm leading-6 text-muted-foreground">Complete the practical task and submit your response when you are ready.</p></CardHeader>
      <CardContent className="space-y-5">
        {assignments.map((assignment) => {
          const isSubmitted = Boolean(submitted[assignment.id]);
          return <div key={assignment.id} className="rounded-2xl border border-border p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-semibold text-[#123d5c]">{assignment.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{assignment.instructions}</p></div><Badge variant={isSubmitted ? "success" : "outline"}>{isSubmitted ? "Submitted" : "Not submitted"}</Badge></div><label htmlFor={`assignment-${assignment.id}`} className="mt-5 block text-sm font-semibold text-[#123d5c]">Your answer</label><textarea id={`assignment-${assignment.id}`} value={answers[assignment.id] ?? ""} onChange={(event) => setAnswers((current) => ({ ...current, [assignment.id]: event.target.value }))} placeholder="Write your response here…" rows={5} className="mt-2 flex w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none" /><div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center"><Button type="button" variant="accent" onClick={() => submitAssignment(assignment.id)} disabled={!answers[assignment.id]?.trim()}><Send />{isSubmitted ? "Update Submission" : "Submit Answer"}</Button>{isSubmitted && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />Your answer is saved</p>}</div></div>;
        })}
      </CardContent>
    </Card>
  );
}