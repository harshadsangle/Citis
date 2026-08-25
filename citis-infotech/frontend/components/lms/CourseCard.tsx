import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LmsCourse } from "@/lib/lms-courses";
import { CourseProgress } from "@/components/lms/CourseProgress";

export function CourseCard({ course }: { course: LmsCourse }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="flex h-32 items-end bg-[linear-gradient(135deg,#123d5c,#3b6d8c)] p-5 text-white">
        <div className="flex w-full items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9e8a2]">{course.category}</p><BookOpenCheck className="mt-3 size-7 text-blue-100" /></div>
          <Badge className="border-white/20 bg-white/10 text-white">{course.level}</Badge>
        </div>
      </div>
      <CardHeader><CardTitle>{course.title}</CardTitle><p className="text-sm leading-6 text-muted-foreground">{course.description}</p></CardHeader>
      <CardContent className="mt-auto space-y-5">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{course.duration}</span><span className="flex items-center gap-1.5"><Users className="size-3.5" />{course.learners}</span></div>
        <CourseProgress value={course.progress} compact />
        <Link href={`/lms/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">View course details <ArrowRight className="size-4" /></Link>
      </CardContent>
    </Card>
  );
}