import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CertificationCoursePage } from "@/components/marketing/CertificationCoursePage";
import { getCourseBySlug, LMS_COURSES } from "@/lib/lms-courses";
import { getLmsCourseBySlug } from "@/lib/lms-course-db";
import { generatePageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LMS_COURSES.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const course = await getLmsCourseBySlug(slug).catch(() => null) ?? getCourseBySlug(slug);
  return generatePageMetadata({
    title: course?.title ?? "Course Information",
    path: `/engagements/global-certifications/courses/${course?.slug ?? ""}`,
    description: course?.description ?? "Explore a CITIS learning pathway.",
    noIndex: true,
  });
}

export default async function CertificationCourseRoute({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const course = await getLmsCourseBySlug(slug).catch(() => null) ?? getCourseBySlug(slug);
  if (!course) notFound();

  return <CertificationCoursePage course={course} />;
}