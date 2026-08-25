import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, BookOpenCheck, CheckCircle2, Clock3, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentButton } from "@/components/lms/EnrollmentButton";
import { LessonViewer } from "@/components/lms/LessonViewer";
import { CourseQuiz } from "@/components/lms/CourseQuiz";
import { CourseAssignments } from "@/components/lms/CourseAssignments";
import { getCourseBySlug, LMS_COURSES } from "@/lib/lms-courses";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LMS_COURSES.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourseBySlug((await params).slug);
  return generatePageMetadata({ title: course ? course.title : "Course Details", path: `/lms/courses/${course?.slug ?? ""}`, description: course?.description ?? "Explore this CITIS learning course.", noIndex: true });
}

export default async function LmsCourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourseBySlug((await params).slug);
  if (!course) notFound();

  return (
    <section className="bg-[#f5f9fc] py-12 sm:py-16">
      <div className="container-site">
        <Link href="/lms/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Back to courses</Link>
        <div className="mt-7 overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#123d5c,#3b6d8c)] p-7 text-white shadow-xl sm:p-10">
          <div className="max-w-4xl"><div className="flex flex-wrap items-center gap-3"><Badge className="border-white/20 bg-white/10 text-white">{course.category}</Badge><span className="text-sm text-blue-100">{course.level} level</span></div><h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-5xl">{course.title}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">{course.description}</p><div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100"><span className="flex items-center gap-2"><Clock3 className="size-4" />{course.duration}</span><span className="flex items-center gap-2"><Users className="size-4" />{course.learners}</span><span className="flex items-center gap-2"><BookOpenCheck className="size-4" />{course.modules.length} modules</span></div></div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-8">
            <Card><CardHeader><CardTitle>What you will learn</CardTitle></CardHeader><CardContent><ul className="grid gap-4 sm:grid-cols-2">{course.outcomes.map((outcome) => <li key={outcome} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{outcome}</li>)}</ul></CardContent></Card>
            <LessonViewer courseSlug={course.slug} modules={course.modules} initialProgress={course.progress} />
            <CourseQuiz courseSlug={course.slug} questions={course.quiz} />
            <CourseAssignments courseSlug={course.slug} assignments={course.assignments} />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <Card><CardContent className="p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Award className="size-5" /></span><div><p className="text-xs text-muted-foreground">Course instructor</p><p className="font-semibold text-[#123d5c]">{course.instructor}</p></div></div><div className="mt-6"><EnrollmentButton courseSlug={course.slug} /></div></CardContent></Card>
            <Link href="/lms/dashboard" className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 text-sm font-semibold text-primary">View your dashboard <ArrowRight className="size-4" /></Link>
          </aside>
        </div>
      </div>
    </section>
  );
}