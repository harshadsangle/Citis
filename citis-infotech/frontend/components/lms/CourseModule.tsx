import { CheckCircle2, ChevronDown, Circle, Clock3 } from "lucide-react";
import type { CourseModule as CourseModuleData } from "@/lib/lms-courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseModule({ module, index }: { module: CourseModuleData; index: number }) {
  const completed = module.lessons.filter((lesson) => lesson.completed).length;
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-heading font-bold text-primary">{String(index + 1).padStart(2, "0")}</span><div><CardTitle className="text-lg">{module.title}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p></div></div>
        <ChevronDown className="mt-1 size-5 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{completed} of {module.lessons.length} lessons complete</span><span>{module.lessons.length} lessons</span></div><div className="divide-y divide-border rounded-xl border border-border">{module.lessons.map((lesson) => <div key={lesson.id} className="flex items-center justify-between gap-4 px-4 py-3.5"><div className="flex min-w-0 items-center gap-3">{lesson.completed ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600" /> : <Circle className="size-4 shrink-0 text-muted-foreground" />}<span className={`truncate text-sm ${lesson.completed ? "text-muted-foreground" : "font-medium text-[#123d5c]"}`}>{lesson.title}</span></div><span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{lesson.duration}</span></div>)}</div></CardContent>
    </Card>
  );
}