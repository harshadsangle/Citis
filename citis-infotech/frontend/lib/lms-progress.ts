export function progressStorageKey(courseSlug: string) {
  return `citis-lms-progress:${courseSlug}`;
}

export function readCompletedLessons(courseSlug: string) {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(progressStorageKey(courseSlug)) ?? "[]");
    return Array.isArray(stored) && stored.every((lessonId) => typeof lessonId === "string") ? stored : [];
  } catch {
    return [];
  }
}

export function saveCompletedLessons(courseSlug: string, lessonIds: string[]) {
  window.localStorage.setItem(progressStorageKey(courseSlug), JSON.stringify([...new Set(lessonIds)]));
}