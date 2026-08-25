import { CourseCard } from "@/components/lms/CourseCard";
import { LMS_COURSES } from "@/lib/lms-courses";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "LMS Courses", path: "/lms/courses", description: "Browse CITIS learning courses and future-ready skill pathways.", noIndex: true });

export default function LmsCoursesPage() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-site">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Learning catalogue</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">Courses for future-ready capability</h1><p className="mt-4 leading-8 text-muted-foreground">Explore structured pathways designed for learners, educators, and professionals building skills that matter.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">{LMS_COURSES.map((course) => <CourseCard key={course.slug} course={course} />)}</div>
      </div>
    </section>
  );
}