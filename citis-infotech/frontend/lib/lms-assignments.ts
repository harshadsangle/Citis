export type AssignmentSubmissions = Record<string, string>;

export function assignmentStorageKey(courseSlug: string) {
  return `citis-lms-assignments:${courseSlug}`;
}

export function readAssignmentSubmissions(courseSlug: string): AssignmentSubmissions {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(assignmentStorageKey(courseSlug)) ?? "{}");
    return stored && typeof stored === "object" ? stored as AssignmentSubmissions : {};
  } catch {
    return {};
  }
}