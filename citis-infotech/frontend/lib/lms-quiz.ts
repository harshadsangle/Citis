export function quizScoreStorageKey(courseSlug: string) {
  return `citis-lms-quiz-score:${courseSlug}`;
}

export function readQuizScore(courseSlug: string) {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(quizScoreStorageKey(courseSlug));
  if (stored === null) return null;
  const score = Number(stored);
  return Number.isFinite(score) ? score : null;
}