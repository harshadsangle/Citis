import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clock3, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LmsCourse } from "@/lib/lms-courses";
import { CourseProgress } from "@/components/lms/CourseProgress";
import { EnrollmentButton } from "@/components/lms/EnrollmentButton";

export function CourseCard({ course }: { course: LmsCourse }) {
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-[#cfe3ea] shadow-[0_8px_24px_rgba(18,61,92,0.05)] hover:-translate-y-1 hover:border-[#9fc6d6] hover:shadow-[0_18px_40px_rgba(18,61,92,0.12)]">
      <div className="relative flex h-36 items-end overflow-hidden bg-[linear-gradient(135deg,#123d5c,#3b6d8c)] p-5 text-white">
        <div className="absolute -right-8 -top-12 size-36 rounded-full border-[18px] border-white/10" />
        <div className="absolute -bottom-16 right-14 size-32 rounded-full border-[12px] border-[#f9e8a2]/20" />
        <div className="flex w-full items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9e8a2]">{course.category}</p><BookOpenCheck className="mt-3 size-7 text-blue-100 transition-transform duration-200 group-hover:scale-110" /></div>
          <Badge className="border-white/20 bg-white/10 text-white">{course.level}</Badge>
        </div>
      </div>
      <CardHeader className="gap-2"><CardTitle className="line-clamp-2 min-h-14">{course.title}</CardTitle><p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{course.description}</p><p className="pt-1 text-xs font-semibold text-[#123d5c]">Instructor: {course.instructor}</p></CardHeader>
      <CardContent className="mt-auto space-y-5">
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-y border-border py-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-primary" />{course.duration}</span><span className="flex items-center gap-1.5"><BookOpenCheck className="size-3.5 text-primary" />{course.modules.length} modules · {lessonCount} lessons</span><span className="flex items-center gap-1.5"><Users className="size-3.5 text-primary" />{course.learners}</span></div>
        <CourseProgress value={course.progress} compact />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Link href={`/lms/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-[#123d5c]">View course details <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link><EnrollmentButton courseSlug={course.slug} /></div>
      </CardContent>
    </Card>
  );
}