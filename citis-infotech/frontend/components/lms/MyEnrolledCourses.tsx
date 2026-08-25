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

  useEffect(() => {
    const enrolledSlugs = new Set(readEnrolledCourses());
    setCourses(LMS_COURSES.filter((course) => enrolledSlugs.has(course.slug)));
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

      {courses.length === 0 ? (
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
            <Card key={course.slug} className="flex h-full flex-col">
              <CardHeader>
                <Badge variant="outline" className="w-fit">{course.category}</Badge>
                <CardTitle className="mt-3 text-lg">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
              </CardHeader>
              <CardContent className="mt-auto space-y-5">
                <CourseProgress value={course.progress} compact />
                <Button asChild variant="outline" className="w-full"><Link href={`/lms/courses/${course.slug}`}>Continue Learning <ArrowRight /></Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}