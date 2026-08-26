import { CourseCard } from "@/components/lms/CourseCard";
import { LMS_COURSES } from "@/lib/lms-courses";
import { getPublishedLmsCourses } from "@/lib/lms-course-db";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "LMS Courses", path: "/lms/courses", description: "Browse CITIS learning courses and future-ready skill pathways.", noIndex: true });

export default async function LmsCoursesPage() {
  let courses = LMS_COURSES;
  try {
    courses = await getPublishedLmsCourses();
  } catch (error) {
    console.error("Falling back to the local LMS course catalogue", error);
  }

  return (
    <section className="bg-[#f5f9fc] py-12 sm:py-16">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-5 border-b border-[#cfe3ea] pb-8 sm:flex-row sm:items-end"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Learning catalogue</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">Courses for future-ready capability</h1><p className="mt-4 leading-8 text-muted-foreground">Explore structured pathways designed for learners, educators, and professionals building skills that matter.</p></div><p className="shrink-0 text-sm font-semibold text-primary">{courses.length} learning pathways</p></div>
        {courses.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#9fc6d6] bg-white p-10 text-center"><p className="font-heading text-lg font-semibold text-[#123d5c]">Courses are being prepared</p><p className="mt-2 text-sm text-muted-foreground">Check back soon for new CITIS learning pathways.</p></div> : <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course.slug} course={course} />)}</div>}
      </div>
    </section>
  );
}