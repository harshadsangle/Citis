"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProgress } from "@/components/lms/CourseProgress";
import { LMS_COURSES, type LmsCourse } from "@/lib/lms-courses";
import { readEnrolledCourses } from "@/lib/lms-enrollment";

export function MyEnrolledCourses() {
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localCourses = LMS_COURSES.filter((course) => new Set(readEnrolledCourses()).has(course.slug));
    setCourses(localCourses);
    void fetch("/api/lms/enrollments")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { enrollments?: Array<{ course?: LmsCourse }> };
        const databaseCourses = (result.enrollments ?? []).flatMap((enrollment) => enrollment.course ? [enrollment.course] : []);
        const merged = [...databaseCourses, ...localCourses.filter((localCourse) => !databaseCourses.some((course) => course.slug === localCourse.slug))];
        setCourses(merged);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section aria-labelledby="my-courses-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your learning</p>
          <h2 id="my-courses-heading" className="mt-2 font-heading text-2xl font-bold text-[#123d5c]">My Courses</h2>
        </div>
        <Link href="/lms/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Browse all <ArrowRight className="size-4" /></Link>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-3" aria-label="Loading enrolled courses">{[1, 2, 3].map((item) => <Card key={item} className="space-y-5 p-5"><div className="h-5 w-24 animate-pulse rounded-full bg-muted" /><div className="h-7 w-4/5 animate-pulse rounded-lg bg-muted" /><div className="h-4 w-2/5 animate-pulse rounded-full bg-muted" /><div className="h-2 w-full animate-pulse rounded-full bg-muted" /><div className="h-11 w-full animate-pulse rounded-xl bg-muted" /></Card>)}</div>
      ) : courses.length === 0 ? (
        <Card className="mt-5 border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></span>
            <h3 className="mt-4 font-heading text-lg font-semibold text-[#123d5c]">No enrolled courses yet</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Explore the course catalogue and enroll in a learning path to see it here.</p>
            <Button asChild variant="accent" className="mt-5"><Link href="/lms/courses">Explore courses <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.slug} className="group flex h-full flex-col border-[#cfe3ea] shadow-[0_8px_24px_rgba(18,61,92,0.05)] transition-all hover:-translate-y-1 hover:border-[#9fc6d6] hover:shadow-[0_18px_40px_rgba(18,61,92,0.12)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3"><Badge variant="outline" className="w-fit">{course.category}</Badge><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-4" /></span></div>
                <CardTitle className="mt-3 text-lg">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
              </CardHeader>
              <CardContent className="mt-auto space-y-5">
                <CourseProgress value={course.progress} compact />
                <Button asChild variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary"><Link href={`/lms/courses/${course.slug}`}>Continue Learning <ArrowRight /></Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}