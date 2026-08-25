"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProgress } from "@/components/lms/CourseProgress";
import type { CourseModule } from "@/lib/lms-courses";
import { readCompletedLessons, saveCompletedLessons } from "@/lib/lms-progress";

interface LessonViewerProps {
  courseSlug: string;
  modules: CourseModule[];
  initialProgress: number;
}

export function LessonViewer({ courseSlug, modules, initialProgress }: LessonViewerProps) {
  const lessons = useMemo(() => modules.flatMap((module) => module.lessons), [modules]);
  const firstLesson = lessons[0];
  const [activeLessonId, setActiveLessonId] = useState(firstLesson?.id ?? "");
  const [started, setStarted] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = readCompletedLessons(courseSlug);
    const existing = lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id);
    setCompletedIds([...new Set([...existing, ...stored])]);
  }, [courseSlug, lessons]);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? firstLesson;
  const completedCount = completedIds.length;
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : initialProgress;

  function startLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    setStarted(true);
  }

  function markComplete() {
    if (!activeLesson) return;
    const nextCompleted = [...new Set([...completedIds, activeLesson.id])];
    setCompletedIds(nextCompleted);
    saveCompletedLessons(courseSlug, nextCompleted);
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-[#b9d8e6]">
        <CardHeader><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Learning progress</p><CardTitle className="mt-2">Your course journey</CardTitle></div><span className="text-sm font-semibold text-primary">{completedCount} of {lessons.length} complete</span></div></CardHeader>
        <CardContent><CourseProgress value={progress} completedLessons={completedCount} totalLessons={lessons.length} /><div className="mt-6 rounded-2xl bg-[#f5f9fc] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><Badge variant="outline">{activeLesson?.completed || completedIds.includes(activeLesson?.id ?? "") ? "Completed lesson" : started ? "In progress" : "Ready to start"}</Badge><h3 className="mt-3 font-heading text-xl font-bold text-[#123d5c]">{activeLesson?.title ?? "Select a lesson"}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{activeLesson?.duration ?? "Choose a lesson from the curriculum"}</p></div><div className="flex shrink-0 flex-col gap-3 sm:items-end"><Button variant="accent" onClick={() => activeLesson && startLesson(activeLesson.id)}><PlayCircle />{started ? "Continue Lesson" : "Start Lesson"}</Button>{started && activeLesson && !completedIds.includes(activeLesson.id) && <Button variant="outline" onClick={markComplete}><CheckCircle2 />Mark as Complete</Button>}{activeLesson && completedIds.includes(activeLesson.id) && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="size-4" />Lesson completed</p>}</div></div>{started && <p className="mt-5 border-t border-border pt-4 text-sm leading-7 text-muted-foreground">You are viewing this lesson in the CITIS learning space. Work through the lesson material, then mark it complete to update your course progress.</p>}</div></CardContent>
      </Card>

      <div><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Course curriculum</p><h2 className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">Modules &amp; lessons</h2></div><span className="text-sm text-muted-foreground">{modules.length} modules</span></div><div className="space-y-4">{modules.map((module, index) => <Card key={module.id}><CardHeader className="flex-row items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-heading font-bold text-primary">{String(index + 1).padStart(2, "0")}</span><div><CardTitle className="text-lg">{module.title}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p></div></CardHeader><CardContent><div className="divide-y divide-border rounded-xl border border-border">{module.lessons.map((lesson) => { const isComplete = completedIds.includes(lesson.id); const isActive = activeLesson?.id === lesson.id; return <div key={lesson.id} className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${isActive ? "bg-primary/[0.04]" : ""}`}><div className="flex min-w-0 items-center gap-3">{isComplete ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />}<span className={`truncate text-sm ${isComplete ? "text-muted-foreground" : "font-medium text-[#123d5c]"}`}>{lesson.title}</span><span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{lesson.duration}</span></div><Button size="sm" variant={isActive ? "secondary" : "ghost"} onClick={() => startLesson(lesson.id)}>{isComplete ? "Review Lesson" : "Start Lesson"}</Button></div>; })}</div></CardContent></Card>)}</div></div>
    </div>
  );
}