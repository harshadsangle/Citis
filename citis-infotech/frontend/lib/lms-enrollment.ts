export const LMS_ENROLLMENTS_KEY = "citis-lms-enrollments";

export function readEnrolledCourses() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(LMS_ENROLLMENTS_KEY) ?? "[]");
    return Array.isArray(stored) && stored.every((slug) => typeof slug === "string") ? stored : [];
  } catch {
    return [];
  }
}

export function saveEnrolledCourse(slug: string) {
  const enrolled = readEnrolledCourses();
  if (!enrolled.includes(slug)) {
    window.localStorage.setItem(LMS_ENROLLMENTS_KEY, JSON.stringify([...enrolled, slug]));
  }
}