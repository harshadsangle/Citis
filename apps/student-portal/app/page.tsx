"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lmsHomepageUrl } from "./lms-homepage";

async function fetchDashboardList<T>(path: string): Promise<T[]> {
  const response = await fetch(path, { credentials: "include" });
  const body = await response.json().catch(() => null) as { data?: T[]; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(body?.error?.message || "We couldn't load your learning progress.");
  return body?.data || [];
}

type Progress = {
  course: { id: string; title: string; code: string; description?: string | null; programme_name?: string | null };
  state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  percentage: number;
  lessons: { completed: number; total: number };
  assessments: { completed: number; total: number };
  modules: Array<{
    id: string;
    title: string;
    sequence: number;
    state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    percentage: number;
    lessons: { completed: number; total: number };
    assessments: { completed: number; total: number };
    lessonItems: Array<{
      id: string;
      title: string;
      description?: string | null;
      sequence: number;
      estimatedDuration?: number | null;
    }>;
  }>;
};

type LearningResource = {
  id: string;
  lesson_id: string;
  resource_type: string;
  title: string;
  url?: string | null;
  file_path?: string | null;
  duration?: number | null;
  sequence: number;
  status?: string;
};

type VideoWatchState = {
  duration: number;
  watchedRanges: Array<[number, number]>;
  completed: boolean;
};

type VideoRequirementState = {
  hasVideo: boolean;
  completed: boolean;
  percentage: number;
  watchedSeconds: number;
  totalSeconds: number;
};

type Assignment = {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  description?: string | null;
  course_title?: string;
  module_title?: string;
  due_at?: string | null;
  max_marks: number;
  status: "PUBLISHED";
};

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED";
  submission_text: string;
  grade?: number | null;
  feedback?: string | null;
  is_late: boolean;
  submitted_at: string;
};
type Assessment = {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  assessment_type: string;
  total_marks?: number | null;
  passing_marks?: number | null;
  attempt_limit?: number | null;
  module_title?: string;
};
type AssessmentQuestion = {
  id: string;
  prompt: string;
  question_type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_TEXT" | "NUMERIC";
  marks: number;
  options: Array<{ id: string; value: string; label: string }>;
};
type AssessmentAttempt = {
  id: string;
  assessment: { id: string; title: string; assessment_type: string; duration_minutes?: number | null };
  questions: AssessmentQuestion[];
  status: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
  expires_at?: string | null;
  started_at?: string;
  draft_answers?: Array<{ question_id: string; answer_json: { value?: string | string[] } }>;
  score?: number | null;
  max_score?: number | null;
  passed?: boolean | null;
  grading_status?: "NOT_REQUIRED" | "PENDING" | "GRADED";
  results?: Array<{ questionId: string; correct: boolean | null; awardedMarks: number }>;
};
type AssessmentHistoryItem = {
  attempt_id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  course_title: string;
  course_code: string;
  module_title: string;
  attempt_number: number;
  score?: number | null;
  max_score?: number | null;
  passed?: boolean | null;
  grading_status: "NOT_REQUIRED" | "PENDING" | "GRADED";
  grading_feedback?: string | null;
  submitted_at: string;
};
type Certificate = {
  id: string;
  course_id: string;
  certificate_number: string;
  verification_id: string;
  learner_name: string;
  course_title: string;
  course_code: string;
  institution_name: string;
  issue_date: string;
  status: "ISSUED";
  document_format: "svg";
};

const stateLabel: Record<Progress["state"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

type LmsCourseProvider = "adobe" | "autodesk" | "cisco" | "comptia" | "ic3" | "intuit" | "its" | "meta" | "microsoft" | "pmi" | "unity";

function normalizeLmsCourseProvider(value: string | null): LmsCourseProvider | null {
  return value === "adobe" || value === "autodesk" || value === "cisco" || value === "comptia" || value === "ic3" || value === "intuit" || value === "its" || value === "meta" || value === "microsoft" || value === "pmi" || value === "unity" ? value : null;
}

function providerForProgrammeName(value?: string | null): LmsCourseProvider | null {
  const name = value?.trim().toLowerCase() || "";
  if (name.includes("adobe")) return "adobe";
  if (name.includes("autodesk")) return "autodesk";
  if (name.includes("cisco")) return "cisco";
  if (name.includes("comptia")) return "comptia";
  if (name.includes("ic3") || name.includes("digital literacy")) return "ic3";
  if (name.includes("intuit") || name.includes("quickbooks")) return "intuit";
  if (name.includes("it specialist")) return "its";
  if (name.includes("meta")) return "meta";
  if (name.includes("microsoft")) return "microsoft";
  if (name.includes("pmi") || name.includes("project management institute")) return "pmi";
  if (name.includes("unity")) return "unity";
  return null;
}

function providerLabel(provider: LmsCourseProvider | null) {
  if (provider === "its") return "IT Specialist";
  if (provider === "pmi") return "Project Management Institute";
  return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "CITIS";
}

type CatalogueCategory = "Career Pathway" | "Specializations" | "Certificate Programs" | "Global Certifications";
type CatalogueFilter = "all" | CatalogueCategory;
type CatalogueSort = "recommended" | "title" | "progress" | "modules";

const catalogueCategories: Array<{ value: CatalogueFilter; label: string }> = [
  { value: "all", label: "All courses" },
  { value: "Career Pathway", label: "Career pathways" },
  { value: "Specializations", label: "Specializations" },
  { value: "Certificate Programs", label: "Certificates" },
  { value: "Global Certifications", label: "Global certifications" },
];

function categoryForCourse(programmeName?: string | null): CatalogueCategory {
  const name = programmeName?.toLowerCase() || "";
  if (name.includes("career pathway")) return "Career Pathway";
  if (name.includes("specialization")) return "Specializations";
  if (name.includes("certificate")) return "Certificate Programs";
  return "Global Certifications";
}

type CourseNarrative = {
  overview: string;
  objectives: string[];
  objectiveIntro: string;
  outcomes: string[];
  outcomeIntro: string;
  industry: string;
  roles: string[];
  certification: string;
  section: string;
  group: string;
  freeform: string;
};

function parseCourseNarrative(description?: string | null): CourseNarrative {
  const narrative: CourseNarrative = {
    overview: "",
    objectives: [],
    objectiveIntro: "",
    outcomes: [],
    outcomeIntro: "",
    industry: "",
    roles: [],
    certification: "",
    section: "",
    group: "",
    freeform: "",
  };
  const sections: Record<string, string[]> = {};
  const labels = new Set(["Overview", "Course Objectives", "Course Outcomes", "Key Content", "Industry Opportunity", "Job Roles Mapping"]);
  let activeSection = "";

  for (const rawLine of (description || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (labels.has(line)) {
      activeSection = line;
      sections[activeSection] = [];
    } else if (line.startsWith("Section ")) {
      narrative.section = line;
    } else if (line.startsWith("Program group:")) {
      narrative.group = line.replace(/^Program group:\s*/, "");
    } else if (line.startsWith("Aligned to ")) {
      narrative.certification = line;
    } else if (activeSection) {
      sections[activeSection].push(line);
    } else if (!narrative.freeform) {
      narrative.freeform = line;
    } else {
      narrative.freeform += ` ${line}`;
    }
  }

  narrative.overview = (sections.Overview || []).join(" ");
  narrative.industry = (sections["Industry Opportunity"] || []).join(" ");
  narrative.objectives = sections["Course Objectives"] || [];
  narrative.outcomes = sections["Course Outcomes"] || [];
  narrative.roles = sections["Job Roles Mapping"] || [];
  if (narrative.objectives[0]?.endsWith(":")) narrative.objectiveIntro = narrative.objectives.shift() || "";
  if (narrative.outcomes[0]?.endsWith(":")) narrative.outcomeIntro = narrative.outcomes.shift() || "";
  return narrative;
}

function shortCourseDescription(narrative: CourseNarrative, fallback?: string | null) {
  const source = narrative.overview || narrative.freeform || narrative.certification || fallback || "A CITIS course designed around practical, career-ready learning.";
  const firstSentence = source.match(/^(.+?[.!?])(?:\s|$)/)?.[1] || source;
  return firstSentence.length > 190 ? `${firstSentence.slice(0, 187).trimEnd()}…` : firstSentence;
}

function sortRank(state: Progress["state"]) {
  return state === "IN_PROGRESS" ? 0 : state === "NOT_STARTED" ? 1 : 2;
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="progress-track" aria-label={`${percentage}% complete`} style={{ background: "#e6edf3", borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{ background: "#0f766e", borderRadius: 999, height: "100%", transition: "width 240ms ease", width: `${percentage}%` }} />
    </div>
  );
}

function answerHasValue(value?: string | string[]) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
}

function assessmentTypeLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function answerDisplay(question: AssessmentQuestion, value?: string | string[]) {
  if (!answerHasValue(value)) return "No response";
  const values = Array.isArray(value) ? value : [value];
  return values.map((item) => question.options.find((option) => option.value === item)?.label || item).join(", ");
}

function CourseCard({
  progress,
  expanded,
  onToggle,
  onContinue,
}: {
  progress: Progress;
  expanded: boolean;
  onToggle: () => void;
  onContinue: () => void;
}) {
  const category = categoryForCourse(progress.course.programme_name);
  const narrative = parseCourseNarrative(progress.course.description);
  const categoryClass = category.toLowerCase().replaceAll(" ", "-");
  const actionLabel = progress.state === "NOT_STARTED" ? "Start learning" : "Continue learning";
  const objectiveItems = narrative.objectives.length ? narrative.objectives : ["Explore the course outline and build practical capability at your own pace."];
  const outcomeItems = narrative.outcomes.length ? narrative.outcomes : ["Work through the published modules and lessons in this course."];

  return (
    <article className={`catalogue-course-card ${expanded ? "is-expanded" : ""}`} id={`course-card-${progress.course.id}`}>
      <div className={`course-card-art course-card-art-${categoryClass}`}>
        <span className="course-card-art-kicker">{category === "Career Pathway" ? "IILP" : category === "Global Certifications" ? "CITIS" : "PATHWAY"}</span>
        <span className="course-card-art-number">{String(progress.modules.length).padStart(2, "0")}</span>
        <span className="course-card-art-grid" aria-hidden="true" />
      </div>
      <div className="course-card-body">
        <div className="course-card-topline">
          <span className={`catalogue-category category-${categoryClass}`}>{category}</span>
          <span className={`course-state course-state-${progress.state.toLowerCase()}`}>{stateLabel[progress.state]}</span>
        </div>
        <p className="course-code">{progress.course.code}</p>
        <h3>{progress.course.title}</h3>
        <p className="course-short-description">{shortCourseDescription(narrative, progress.course.description)}</p>
        <div className="course-card-meta">
          <span><strong>{progress.modules.length}</strong> modules</span>
          <span><strong>{progress.lessons.total}</strong> lessons</span>
          <span><strong>{progress.assessments.total}</strong> checks</span>
        </div>
        <div className="course-card-progress">
          <div className="course-progress-label"><span>Course progress</span><strong>{progress.percentage}%</strong></div>
          <ProgressBar percentage={progress.percentage} />
          <span className="course-progress-caption">{progress.lessons.completed} of {progress.lessons.total} lessons complete</span>
        </div>
        <div className="course-card-actions">
          <button className="course-details-button" type="button" aria-expanded={expanded} onClick={onToggle}>
            {expanded ? "Close details" : "Open course page"} <span aria-hidden="true">{expanded ? "↑" : "→"}</span>
          </button>
          <button className="course-primary-button" type="button" onClick={onContinue}>
            {actionLabel} <span aria-hidden="true">↗</span>
          </button>
        </div>

        {expanded && (
          <div className="course-detail-panel" id={`course-outline-${progress.course.id}`}>
            <div className="course-detail-heading">
              <div>
                <span className="course-detail-eyebrow">Course details</span>
                <h4>{progress.course.title}</h4>
              </div>
              <button className="course-detail-close" type="button" onClick={onToggle} aria-label={`Close ${progress.course.title} details`}>×</button>
            </div>
            <div className="course-detail-grid">
              <section className="course-detail-section course-detail-overview">
                <span className="course-detail-label">Overview</span>
                <p>{narrative.overview || narrative.freeform || "This CITIS course combines structured lessons with an industry-focused learning path."}</p>
              </section>
              <section className="course-detail-section">
                <span className="course-detail-label">Objectives</span>
                {narrative.objectiveIntro && <p className="course-detail-intro">{narrative.objectiveIntro}</p>}
                <ul className="course-bullet-list">{objectiveItems.map((item) => <li key={item}><span aria-hidden="true">+</span>{item}</li>)}</ul>
              </section>
              <section className="course-detail-section">
                <span className="course-detail-label">Outcomes</span>
                {narrative.outcomeIntro && <p className="course-detail-intro">{narrative.outcomeIntro}</p>}
                <ul className="course-bullet-list">{outcomeItems.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
              </section>
              <section className="course-detail-section">
                <span className="course-detail-label">Industry opportunities</span>
                <p>{narrative.industry || "Build skills that can transfer into contemporary technology and professional roles."}</p>
                {narrative.group && <span className="course-detail-context">{narrative.group}</span>}
              </section>
              <section className="course-detail-section">
                <span className="course-detail-label">Job roles</span>
                {narrative.roles.length ? <div className="course-role-list">{narrative.roles.map((role) => <span key={role}>{role}</span>)}</div> : <p>Explore role pathways connected to this course as you progress.</p>}
              </section>
              <section className="course-detail-section course-certification-section">
                <span className="course-detail-label">Certification alignment</span>
                <p>{narrative.certification || "CITIS learning pathway"}</p>
                {narrative.section && <span className="course-detail-context">{narrative.section}</span>}
              </section>
            </div>
            <div className="course-roadmap">
              <div className="course-roadmap-heading">
                <div><span className="course-detail-label">Course roadmap</span><h4>Modules & lessons</h4></div>
                <span>{progress.modules.length} modules · {progress.lessons.total} lessons</span>
              </div>
              <div className="course-module-list">
                {progress.modules.map((module) => (
                  <details className="course-module" key={module.id} open={module.sequence === 1}>
                    <summary>
                      <span className="course-module-number">{String(module.sequence).padStart(2, "0")}</span>
                      <span className="course-module-name"><strong>{module.title}</strong><small>{module.lessons.total} lessons · {module.assessments.total} assessments</small></span>
                      <span className="course-module-progress">{module.percentage}% <span aria-hidden="true">⌄</span></span>
                    </summary>
                    <div className="course-module-content">
                      <div className="module-progress-line"><span>{module.lessons.completed} of {module.lessons.total} lessons complete</span><strong>{module.state === "COMPLETED" ? "Complete" : stateLabel[module.state]}</strong></div>
                      <ProgressBar percentage={module.percentage} />
                      <div className="course-lesson-list">
                        {module.lessonItems.map((lesson) => (
                          <div className="course-lesson" key={lesson.id}>
                            <span className="course-lesson-status" aria-hidden="true">○</span>
                            <span><strong>{lesson.title}</strong>{lesson.description && <small>{lesson.description}</small>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
            <button className="course-detail-continue" type="button" onClick={onContinue}>{actionLabel} <span aria-hidden="true">→</span></button>
          </div>
        )}
      </div>
    </article>
  );
}

function firstLessonId(progress: Progress) {
  const firstIncompleteModule = progress.modules.find((module) => module.state !== "COMPLETED" && module.lessonItems.length > 0);
  return firstIncompleteModule?.lessonItems[0]?.id || progress.modules[0]?.lessonItems[0]?.id || "";
}

function resourceTypeLabel(resourceType: string) {
  return resourceType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resourceUrl(resource: LearningResource) {
  const value = resource.url?.trim();
  if (value) {
    try {
      const parsed = new URL(value, typeof window === "undefined" ? "http://localhost" : window.location.origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return value;
    } catch {
      // Invalid persisted URLs fall through to the managed-file route.
    }
  }
  return `/api/v1/learning-resources/${resource.id}/file`;
}

function videoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}` : value;
    }
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed${url.pathname}?enablejsapi=1&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;
    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}?api=1&title=0&byline=0&portrait=0` : value;
    }
  } catch {
    return value;
  }
  return value;
}

function embeddedVideoProvider(value: string): "youtube" | "vimeo" | null {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    if (hostname.includes("youtube.com") || hostname === "youtu.be") return "youtube";
    if (hostname.includes("vimeo.com")) return "vimeo";
  } catch {
    return null;
  }
  return null;
}

function resourceIsVideo(resource: LearningResource) {
  return resource.resource_type.toUpperCase().includes("VIDEO") || /\.(mp4|webm|ogg)(?:$|\?)/i.test(resource.url || "");
}

function resourceIsDocument(resource: LearningResource) {
  const type = resource.resource_type.toUpperCase();
  return type.includes("PDF") || type.includes("DOCUMENT") || type.includes("PRESENTATION") || type === "FILE";
}

function resourceIsScorm(resource: LearningResource) {
  return resource.resource_type.toUpperCase() === "SCORM";
}

function videoProgressStorageKey(lessonId: string, resourceId: string) {
  return `citis:learner-video-progress:v1:${lessonId}:${resourceId}`;
}

function emptyVideoWatchState(duration = 0): VideoWatchState {
  return { duration: Math.max(0, duration), watchedRanges: [], completed: false };
}

function readVideoWatchState(lessonId: string, resource: LearningResource) {
  const fallback = emptyVideoWatchState(resource.duration || 0);
  if (typeof window === "undefined") return fallback;
  try {
    const stored = JSON.parse(window.localStorage.getItem(videoProgressStorageKey(lessonId, resource.id)) || "null") as Partial<VideoWatchState> | null;
    if (!stored || !Array.isArray(stored.watchedRanges)) return fallback;
    return {
      duration: Math.max(Number(stored.duration) || 0, resource.duration || 0),
      watchedRanges: stored.watchedRanges
        .filter((range): range is [number, number] => Array.isArray(range) && range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1]) && range[1] > range[0])
        .map(([start, end]) => [Math.max(0, start), Math.max(0, end)] as [number, number]),
      completed: stored.completed === true,
    };
  } catch {
    return fallback;
  }
}

function mergeWatchedRange(state: VideoWatchState, start: number, end: number, duration?: number) {
  const safeStart = Math.max(0, Math.min(start, end));
  const safeEnd = Math.max(safeStart, end);
  if (safeEnd - safeStart < 0.05) return state;
  const ranges = [...state.watchedRanges, [safeStart, safeEnd] as [number, number]]
    .sort((left, right) => left[0] - right[0])
    .reduce<Array<[number, number]>>((merged, range) => {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1] + 0.25) {
        previous[1] = Math.max(previous[1], range[1]);
      } else {
        merged.push([...range]);
      }
      return merged;
    }, []);
  const nextDuration = Math.max(state.duration, duration || 0, safeEnd);
  const watchedSeconds = ranges.reduce((total, [rangeStart, rangeEnd]) => total + (rangeEnd - rangeStart), 0);
  return {
    duration: nextDuration,
    watchedRanges: ranges,
    completed: nextDuration > 0 && watchedSeconds >= nextDuration - 0.5,
  };
}

function watchedSeconds(state?: VideoWatchState) {
  return state?.watchedRanges.reduce((total, [start, end]) => total + (end - start), 0) || 0;
}

function LearningResourceViewer({
  lessonId,
  resources,
  loading,
  error,
  onVideoStateChange,
}: {
  lessonId: string;
  resources: LearningResource[];
  loading: boolean;
  error: string;
  onVideoStateChange: (state: VideoRequirementState) => void;
}) {
  const [activeResourceId, setActiveResourceId] = useState("");
  const [videoStates, setVideoStates] = useState<Record<string, VideoWatchState>>({});
  const [scormLaunchUrl, setScormLaunchUrl] = useState("");
  const [scormError, setScormError] = useState("");
  const [scormLoading, setScormLoading] = useState(false);
  const videoTracker = useRef<{ resourceId: string; lastTime: number; duration: number; seeking: boolean }>({ resourceId: "", lastTime: 0, duration: 0, seeking: false });
  const embeddedVideoFrame = useRef<HTMLIFrameElement | null>(null);
  const activeResource = resources.find((resource) => resource.id === activeResourceId) || resources[0];

  useEffect(() => {
    setActiveResourceId(resources[0]?.id || "");
    setScormLaunchUrl("");
    setScormError("");
    const nextVideoStates: Record<string, VideoWatchState> = {};
    resources.filter(resourceIsVideo).forEach((resource) => {
      nextVideoStates[resource.id] = readVideoWatchState(lessonId, resource);
    });
    setVideoStates(nextVideoStates);
    videoTracker.current = { resourceId: resources[0]?.id || "", lastTime: 0, duration: 0, seeking: false };
  }, [lessonId, resources]);

  useEffect(() => {
    if (!activeResource || !resourceIsScorm(activeResource) || activeResource.url?.trim()) {
      setScormLoading(false);
      return;
    }
    const controller = new AbortController();
    setScormLoading(true);
    setScormError("");
    fetch(`/api/v1/learning-resources/${encodeURIComponent(activeResource.id)}/scorm/launch`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as { data?: { launchUrl?: string }; error?: { message?: string } } | null;
        if (!response.ok || !body?.data?.launchUrl) throw new Error(body?.error?.message || "This SCORM resource is unavailable.");
        setScormLaunchUrl(body.data.launchUrl);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setScormError(reason instanceof Error ? reason.message : "This SCORM resource is unavailable.");
        setScormLaunchUrl("");
      })
      .finally(() => {
        if (!controller.signal.aborted) setScormLoading(false);
      });
    return () => controller.abort();
  }, [activeResource?.id, activeResource?.resource_type, activeResource?.url]);

  useEffect(() => {
    if (loading || error) return;
    const videoResources = resources.filter(resourceIsVideo);
    const states = videoResources.map((resource) => videoStates[resource.id] || emptyVideoWatchState(resource.duration || 0));
    const totalSeconds = states.reduce((total, state) => total + state.duration, 0);
    const watched = states.reduce((total, state) => total + watchedSeconds(state), 0);
    const completed = videoResources.length > 0 && states.every((state) => state.completed);
    onVideoStateChange({
      hasVideo: videoResources.length > 0,
      completed: videoResources.length === 0 || completed,
      percentage: totalSeconds > 0 ? Math.min(100, Math.round((watched / totalSeconds) * 100)) : completed ? 100 : 0,
      watchedSeconds: watched,
      totalSeconds,
    });
  }, [error, loading, onVideoStateChange, resources, videoStates]);

  const persistVideoState = useCallback((resourceId: string, state: VideoWatchState) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(videoProgressStorageKey(lessonId, resourceId), JSON.stringify(state));
    } catch {
      // Browser storage may be unavailable; the in-memory state still gates completion.
    }
  }, [lessonId]);

  const recordVideoProgress = useCallback((resourceId: string, currentTime: number, duration: number) => {
    setVideoStates((current) => {
      const nextState = mergeWatchedRange(current[resourceId] || emptyVideoWatchState(duration), videoTracker.current.lastTime, currentTime, duration);
      persistVideoState(resourceId, nextState);
      return { ...current, [resourceId]: nextState };
    });
  }, [persistVideoState]);

  function activeVideoState() {
    if (!activeResource || !resourceIsVideo(activeResource)) return undefined;
    return videoStates[activeResource.id] || emptyVideoWatchState(activeResource.duration || 0);
  }

  function handleVideoTimeUpdate(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const resourceId = activeResource?.id || "";
    if (!resourceId || videoTracker.current.resourceId !== resourceId) {
      videoTracker.current = { resourceId, lastTime: video.currentTime, duration: video.duration, seeking: false };
      return;
    }
    const previousTime = videoTracker.current.lastTime;
    const delta = video.currentTime - previousTime;
    if (!videoTracker.current.seeking && delta >= 0 && delta <= 1.5) {
      recordVideoProgress(resourceId, video.currentTime, video.duration);
    }
    videoTracker.current.lastTime = video.currentTime;
    videoTracker.current.duration = video.duration;
    videoTracker.current.seeking = false;
  }

  function handleVideoLoadedMetadata(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const resourceId = activeResource?.id || "";
    if (!resourceId) return;
    videoTracker.current = { resourceId, lastTime: video.currentTime, duration: video.duration, seeking: false };
    setVideoStates((current) => {
      const existing = current[resourceId] || emptyVideoWatchState();
      const nextState = {
        ...existing,
        duration: Math.max(existing.duration, video.duration || 0),
        completed: existing.completed || (video.duration > 0 && watchedSeconds(existing) >= video.duration - 0.5),
      };
      persistVideoState(resourceId, nextState);
      return { ...current, [resourceId]: nextState };
    });
  }

  function handleVideoSeeked(event: React.SyntheticEvent<HTMLVideoElement>) {
    videoTracker.current.lastTime = event.currentTarget.currentTime;
    videoTracker.current.seeking = false;
  }

  function handleVideoEnded(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (!videoTracker.current.seeking && videoTracker.current.lastTime >= video.duration - 1.5) {
      recordVideoProgress(activeResource?.id || "", video.duration, video.duration);
    }
  }

  const handleEmbeddedVideoTime = useCallback((resourceId: string, currentTime: number, duration: number) => {
    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return;
    if (videoTracker.current.resourceId !== resourceId) {
      videoTracker.current = { resourceId, lastTime: currentTime, duration, seeking: false };
      return;
    }
    const delta = currentTime - videoTracker.current.lastTime;
    if (!videoTracker.current.seeking && delta >= 0 && delta <= 2.25) {
      recordVideoProgress(resourceId, currentTime, duration);
    }
    videoTracker.current.lastTime = currentTime;
    videoTracker.current.duration = duration;
    videoTracker.current.seeking = false;
  }, [recordVideoProgress]);

  const activeResourceUrl = activeResource
    ? resourceIsScorm(activeResource) && !activeResource.url?.trim()
      ? scormLaunchUrl
      : resourceUrl(activeResource)
    : "";
  const activeResourceIsEmbed = Boolean(activeResource && resourceIsVideo(activeResource) && /^https?:\/\//i.test(activeResourceUrl) && !/\.(mp4|webm|ogg)(?:$|\?)/i.test(activeResourceUrl));

  useEffect(() => {
    const frame = embeddedVideoFrame.current;
    const provider = activeResourceIsEmbed ? embeddedVideoProvider(activeResourceUrl) : null;
    if (loading || error || !frame || !activeResource?.id || !provider) return;
    const resourceId = activeResource.id;
    const targetOrigin = provider === "youtube" ? "https://www.youtube.com" : "https://player.vimeo.com";
    const send = (message: Record<string, unknown>) => {
      frame.contentWindow?.postMessage(JSON.stringify(message), targetOrigin);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      let data: { event?: string; info?: { currentTime?: number; duration?: number } | number; data?: { seconds?: number; duration?: number } } | null = null;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data) return;
      if (provider === "youtube" && data.event === "infoDelivery" && typeof data.info === "object" && data.info) {
        handleEmbeddedVideoTime(resourceId, Number(data.info.currentTime), Number(data.info.duration));
      }
      if (provider === "youtube" && data.event === "onStateChange" && Number(data.info) === 0) {
        if (videoTracker.current.duration > 0 && videoTracker.current.lastTime >= videoTracker.current.duration - 1.5) {
          recordVideoProgress(resourceId, videoTracker.current.duration, videoTracker.current.duration);
        }
      }
      if (provider === "vimeo" && data.event === "timeupdate" && data.data) {
        handleEmbeddedVideoTime(resourceId, Number(data.data.seconds), Number(data.data.duration));
      }
      if (provider === "vimeo" && data.event === "ended") {
        if (videoTracker.current.duration > 0 && videoTracker.current.lastTime >= videoTracker.current.duration - 1.5) {
          recordVideoProgress(resourceId, videoTracker.current.duration, videoTracker.current.duration);
        }
      }
    };
    const initialize = () => {
      if (provider === "youtube") {
        send({ event: "listening", id: resourceId, channel: "citis-lesson-video" });
        send({ event: "command", func: "addEventListener", args: ["onStateChange"], id: resourceId });
      } else {
        send({ method: "addEventListener", value: "timeupdate", player_id: resourceId });
        send({ method: "addEventListener", value: "ended", player_id: resourceId });
      }
    };
    window.addEventListener("message", onMessage);
    frame.addEventListener("load", initialize);
    initialize();
    const poll = window.setInterval(() => {
      if (provider === "youtube") {
        send({ event: "command", func: "getCurrentTime", args: [], id: resourceId });
        send({ event: "command", func: "getDuration", args: [], id: resourceId });
      } else {
        send({ method: "getCurrentTime", player_id: resourceId });
        send({ method: "getDuration", player_id: resourceId });
      }
    }, 1000);
    return () => {
      window.removeEventListener("message", onMessage);
      frame.removeEventListener("load", initialize);
      window.clearInterval(poll);
    };
  }, [activeResource?.id, activeResourceIsEmbed, activeResourceUrl, error, handleEmbeddedVideoTime, loading, recordVideoProgress]);

  if (loading) {
    return <div className="lesson-resource-loading"><span className="resource-loading-dot" /> Loading lesson media…</div>;
  }
  if (error) {
    return <div className="lesson-resource-error" role="alert">{error}</div>;
  }
  if (activeResource && resourceIsScorm(activeResource) && scormLoading) {
    return <div className="lesson-resource-loading"><span className="resource-loading-dot" /> Loading SCORM lesson…</div>;
  }
  if (activeResource && resourceIsScorm(activeResource) && scormError) {
    return <div className="lesson-resource-error" role="alert">{scormError}</div>;
  }
  if (!activeResource) {
    return (
      <div className="lesson-resource-empty">
        <span className="resource-empty-mark" aria-hidden="true">▶</span>
        <div><strong>Reading lesson</strong><p>This lesson has no video or downloadable resource yet. Use the lesson overview below, then mark it complete when you’re ready.</p></div>
      </div>
    );
  }

  const url = activeResourceUrl;
  const isEmbed = activeResourceIsEmbed;
  const currentVideoState = activeVideoState();
  const currentVideoPercentage = currentVideoState?.duration ? Math.min(100, Math.round((watchedSeconds(currentVideoState) / currentVideoState.duration) * 100)) : currentVideoState?.completed ? 100 : 0;

  return (
    <div className="lesson-resource">
      <div
        className="lesson-resource-frame"
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") event.preventDefault();
        }}
        tabIndex={-1}
      >
        {resourceIsVideo(activeResource) && (isEmbed ? (
          <iframe ref={embeddedVideoFrame} title={activeResource.title} src={videoEmbedUrl(url)} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <video
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            draggable={false}
            playsInline
            preload="metadata"
            src={url}
            onContextMenu={(event) => event.preventDefault()}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onPlay={(event) => {
              videoTracker.current = { resourceId: activeResource.id, lastTime: event.currentTarget.currentTime, duration: event.currentTarget.duration, seeking: false };
            }}
            onSeeking={() => { videoTracker.current.seeking = true; }}
            onSeeked={handleVideoSeeked}
            onTimeUpdate={handleVideoTimeUpdate}
          >
            Your browser does not support embedded video.
          </video>
        ))}
        {resourceIsDocument(activeResource) && <iframe title={activeResource.title} src={url} />}
        {resourceIsScorm(activeResource) && url && <iframe title={activeResource.title} src={url} />}
        {!resourceIsVideo(activeResource) && !resourceIsDocument(activeResource) && !resourceIsScorm(activeResource) && (
          <div className="lesson-resource-link-card">
            <span className="resource-link-icon" aria-hidden="true">↗</span>
            <div><strong>{activeResource.title}</strong><p>{resourceTypeLabel(activeResource.resource_type)} resource</p></div>
            <a href={url} target="_blank" rel="noreferrer">Open resource</a>
          </div>
        )}
      </div>
      <div className="lesson-resource-footer">
        <div><span className="lesson-resource-kicker">{resourceTypeLabel(activeResource.resource_type)}</span><strong>{activeResource.title}</strong></div>
        {resourceIsVideo(activeResource) && <div className="lesson-resource-watch-status"><span>{isEmbed ? "Watch in full to continue" : `${currentVideoPercentage}% watched`}</span><div className="lesson-resource-watch-track"><span style={{ width: `${currentVideoPercentage}%` }} /></div></div>}
        {resources.length > 1 && (
          <label className="lesson-resource-select"><span>Lesson resource</span><select value={activeResource.id} onChange={(event) => setActiveResourceId(event.target.value)}>{resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.title}</option>)}</select></label>
        )}
      </div>
    </div>
  );
}

function CourseLearningView({
  progress,
  provider,
  onBack,
  onCompleteLesson,
  certificate,
  onViewCertificates,
}: {
  progress: Progress;
  provider: LmsCourseProvider | null;
  onBack: () => void;
  onCompleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  certificate?: Certificate;
  onViewCertificates: () => void;
}) {
  const allLessons = progress.modules.flatMap((module) => module.lessonItems.map((lesson) => ({ lesson, module })));
  const [activeLessonId, setActiveLessonId] = useState(() => firstLessonId(progress));
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(() => new Set(
    progress.modules.flatMap((module) => module.lessonItems.slice(0, module.lessons.completed).map((lesson) => lesson.id)),
  ));
  const [busyLessonId, setBusyLessonId] = useState("");
  const [lessonError, setLessonError] = useState("");
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState("");
  const [videoRequirement, setVideoRequirement] = useState<VideoRequirementState>({
    hasVideo: false,
    completed: true,
    percentage: 100,
    watchedSeconds: 0,
    totalSeconds: 0,
  });
  const [videoRequirementReady, setVideoRequirementReady] = useState(false);
  const activeIndex = Math.max(0, allLessons.findIndex((item) => item.lesson.id === activeLessonId));
  const activeItem = allLessons[activeIndex] || allLessons[0];
  const completedCount = allLessons.filter(({ lesson, module }) => completedLessonIds.has(lesson.id) || module.state === "COMPLETED" || module.lessonItems.indexOf(lesson) < module.lessons.completed).length;
  const completionPercent = progress.percentage;
  const activeLessonResourceId = activeItem?.lesson.id || "";

  useEffect(() => {
    if (!activeLessonResourceId) return;
    const controller = new AbortController();
    setResources([]);
    setResourcesLoading(true);
    setResourcesError("");
    fetch(`/api/v1/learning-resources?lessonId=${encodeURIComponent(activeLessonResourceId)}&pageSize=100`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => null) as { data?: LearningResource[]; error?: { message?: string } } | null;
        if (!response.ok) throw new Error(body?.error?.message || "We couldn't load this lesson's resources.");
        setResources((body?.data || []).filter((resource) => resource.status === undefined || resource.status === "PUBLISHED").sort((left, right) => left.sequence - right.sequence));
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setResourcesError(reason instanceof Error ? reason.message : "We couldn't load this lesson's resources.");
        setResources([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setResourcesLoading(false);
      });
    return () => controller.abort();
  }, [activeLessonResourceId]);

  const handleVideoRequirementChange = useCallback((state: VideoRequirementState) => {
    setVideoRequirement(state);
    setVideoRequirementReady(true);
  }, []);

  if (!activeItem) {
    return (
      <section className="learning-page">
        <button className="learning-back-button" type="button" onClick={onBack}>← Back to courses</button>
        <div className="portal-state-card"><span className="portal-empty-icon">○</span><h2>No lessons are available yet</h2><p>Your course roadmap will appear here once lessons are published.</p></div>
      </section>
    );
  }

  const { lesson: activeLesson, module: activeModule } = activeItem;
  const previous = allLessons[activeIndex - 1];
  const next = allLessons[activeIndex + 1];
  const isCompleted = completedLessonIds.has(activeLesson.id) || activeModule.state === "COMPLETED" || activeModule.lessonItems.indexOf(activeLesson) < activeModule.lessons.completed;
  const videoCompletionBlocked = !isCompleted && (!videoRequirementReady || (videoRequirement.hasVideo && !videoRequirement.completed));
  const category = categoryForCourse(progress.course.programme_name);

  async function completeCurrentLesson() {
    if (isCompleted || busyLessonId || videoCompletionBlocked) return;
    setBusyLessonId(activeLesson.id);
    setLessonError("");
    try {
      await onCompleteLesson(progress.course.id, activeLesson.id);
      setCompletedLessonIds((current) => new Set(current).add(activeLesson.id));
    } catch (reason: unknown) {
      setLessonError(reason instanceof Error ? reason.message : "We couldn’t mark this lesson complete.");
    } finally {
      setBusyLessonId("");
    }
  }

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    setVideoRequirementReady(false);
    setVideoRequirement({ hasVideo: false, completed: true, percentage: 100, watchedSeconds: 0, totalSeconds: 0 });
    setLessonError("");
    window.setTimeout(() => document.getElementById("lesson-content")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  return (
    <section className="learning-page" aria-labelledby="learning-course-title">
      <button className="learning-back-button" type="button" onClick={onBack}>← Back to all courses</button>
      <header className="learning-course-header">
        <div className="learning-course-heading">
          <div className="learning-course-heading-topline"><span className={`catalogue-category category-${category.toLowerCase().replaceAll(" ", "-")}`}>{category}</span><span className={`course-state course-state-${progress.state.toLowerCase()}`}>{stateLabel[progress.state]}</span></div>
          <span className="learning-course-code">{progress.course.code} {provider && `· ${providerLabel(provider)}`}</span>
          <h2 id="learning-course-title">{progress.course.title}</h2>
          <p>{shortCourseDescription(parseCourseNarrative(progress.course.description), progress.course.description)}</p>
        </div>
        <div className="learning-header-progress">
          <div className="learning-header-progress-topline"><span>Course progress</span><strong>{completionPercent}%</strong></div>
          <ProgressBar percentage={completionPercent} />
          <div className="learning-header-progress-bottomline"><span>{completedCount} of {progress.lessons.total} lessons complete</span><strong>{progress.modules.length} modules</strong></div>
        </div>
      </header>
      <div className="learning-layout">
        <aside className="learning-roadmap" aria-label="Course roadmap">
          <div className="learning-roadmap-heading"><div><span className="course-detail-label">Your roadmap</span><h3>Course content</h3></div><span>{progress.modules.length} modules</span></div>
          <div className="learning-roadmap-progress"><div><span>Overall progress</span><strong>{completionPercent}%</strong></div><ProgressBar percentage={completionPercent} /></div>
          <div className="learning-module-list">
            {progress.modules.map((courseModule) => (
              <div className={`learning-module ${courseModule.id === activeModule.id ? "is-current" : ""}`} key={courseModule.id}>
                <div className="learning-module-heading"><span className="learning-module-number">{String(courseModule.sequence).padStart(2, "0")}</span><span><strong>{courseModule.title}</strong><small>{courseModule.lessons.completed}/{courseModule.lessons.total} lessons</small></span></div>
                <div className="learning-lesson-list">
                  {courseModule.lessonItems.map((courseLesson) => {
                    const lessonCompleted = completedLessonIds.has(courseLesson.id) || courseModule.state === "COMPLETED" || courseModule.lessonItems.indexOf(courseLesson) < courseModule.lessons.completed;
                    return (
                      <button className={`learning-lesson-item ${courseLesson.id === activeLesson.id ? "is-current" : ""} ${lessonCompleted ? "is-completed" : ""}`} key={courseLesson.id} type="button" onClick={() => selectLesson(courseLesson.id)}>
                        <span className="learning-lesson-marker" aria-hidden="true">{lessonCompleted ? "✓" : courseLesson.id === activeLesson.id ? "•" : "○"}</span>
                        <span><strong>{courseLesson.title}</strong>{courseLesson.estimatedDuration != null && <small>{courseLesson.estimatedDuration} min</small>}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="learning-content" id="lesson-content">
          <div className="learning-content-meta"><span>Module {String(activeModule.sequence).padStart(2, "0")}</span><span>Lesson {String(activeLesson.sequence).padStart(2, "0")}</span>{activeLesson.estimatedDuration != null && <span>{activeLesson.estimatedDuration} min read</span>}</div>
          <article className="lesson-article">
            <div className="lesson-article-kicker">{isCompleted ? "Completed lesson" : "Now learning"}</div>
            <h3>{activeLesson.title}</h3>
            <p className="lesson-lede">{activeLesson.description || "Work through this lesson to build the next part of your CITIS learning pathway."}</p>
             <LearningResourceViewer
               lessonId={activeLesson.id}
               resources={resources}
               loading={resourcesLoading}
               error={resourcesError}
               onVideoStateChange={handleVideoRequirementChange}
             />
            <div className="lesson-content-card">
              <span className="course-detail-label">Lesson overview</span>
              {(activeLesson.description || "This lesson is part of your guided CITIS course roadmap.").split(/\r?\n+/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
             {videoRequirementReady && videoRequirement.hasVideo && !isCompleted && (
               <div className="lesson-video-gate" role="status">
                 <span className="lesson-video-gate-icon" aria-hidden="true">▶</span>
                 <div>
                   <strong>{videoRequirement.completed ? "Video complete" : "Finish the video to unlock completion"}</strong>
                   <p>{videoRequirement.completed ? "You watched the required video. You can now save this lesson as complete." : "Watch every part of this video from start to finish. Skipping ahead will not count as watched."}</p>
                   <div className="lesson-video-gate-progress">
                     <span><b>{videoRequirement.percentage}%</b> watched</span>
                     <div><span style={{ width: `${videoRequirement.percentage}%` }} /></div>
                   </div>
                 </div>
               </div>
             )}
             <div className={`lesson-completion-card ${isCompleted ? "is-completed" : ""} ${videoCompletionBlocked ? "is-locked" : ""}`}>
              <span className="lesson-completion-icon" aria-hidden="true">{isCompleted ? "✓" : "○"}</span>
               <div><strong>{isCompleted ? "Lesson complete" : videoCompletionBlocked ? "Lesson completion is locked" : "Ready to mark this lesson complete?"}</strong><p>{isCompleted ? "Your progress is saved. Continue to the next lesson when you’re ready." : videoCompletionBlocked ? "Complete the full video above before saving this lesson. Your watched progress is preserved if you leave and return." : "Mark this lesson complete after you have finished reviewing the content."}</p></div>
               {!isCompleted && <button className="course-primary-button" type="button" onClick={() => void completeCurrentLesson()} disabled={busyLessonId === activeLesson.id || videoCompletionBlocked}>{busyLessonId === activeLesson.id ? "Saving…" : videoCompletionBlocked ? "Watch video first" : "Mark as complete"}</button>}
            </div>
            {lessonError && <div className="lesson-error" role="alert">{lessonError}</div>}
            {progress.state === "COMPLETED" && (
              <div className="course-complete-banner">
                <div className="course-complete-badge" aria-hidden="true">✓</div>
                <div><span className="course-detail-label">Course complete</span><strong>You’ve earned this milestone.</strong><p>Your completed learning record is ready. {certificate ? "Your certificate is available to download." : "Your certificate will appear here after the final checks finish."}</p></div>
                <button className="course-primary-button" type="button" onClick={onViewCertificates}>{certificate ? "View certificate" : "View completion status"} <span aria-hidden="true">→</span></button>
              </div>
            )}
          </article>
          <nav className="lesson-navigation" aria-label="Lesson navigation">
            <button type="button" onClick={() => previous && selectLesson(previous.lesson.id)} disabled={!previous}><span>← Previous lesson</span><strong>{previous?.lesson.title || "Start of course"}</strong></button>
             <button type="button" onClick={() => next && selectLesson(next.lesson.id)} disabled={!next || videoCompletionBlocked} aria-disabled={videoCompletionBlocked}><span>{videoCompletionBlocked ? "Next lesson locked" : "Next lesson →"}</span><strong>{videoCompletionBlocked ? "Watch the full video and mark this lesson complete" : next?.lesson.title || "Course complete"}</strong></button>
          </nav>
        </main>
      </div>
    </section>
  );
}

function CourseDetailsView({
  progress,
  provider,
  certificate,
  onBack,
  onStart,
  onViewCertificates,
}: {
  progress: Progress;
  provider: LmsCourseProvider | null;
  certificate?: Certificate;
  onBack: () => void;
  onStart: () => void;
  onViewCertificates: () => void;
}) {
  const narrative = parseCourseNarrative(progress.course.description);
  const learningPoints = narrative.objectives.length ? narrative.objectives : narrative.outcomes.length ? narrative.outcomes : ["Follow structured lessons and assessments in your enrolled CITIS pathway."];
  const actionLabel = progress.state === "NOT_STARTED" ? "Start course" : progress.state === "COMPLETED" ? "Review course" : "Continue learning";

  return (
    <section className="course-detail-page" aria-labelledby="course-detail-title">
      <button className="learning-back-button" type="button" onClick={onBack}>← Back to My Learning</button>
      <div className="course-detail-hero">
        <div className="course-detail-hero-art">
          <span>{provider ? providerLabel(provider) : "CITIS"}</span>
          <strong>{String(progress.modules.length).padStart(2, "0")}</strong>
          <i aria-hidden="true" />
        </div>
        <div className="course-detail-hero-copy">
          <div className="course-card-topline"><span className={`catalogue-category category-${categoryForCourse(progress.course.programme_name).toLowerCase().replaceAll(" ", "-")}`}>{categoryForCourse(progress.course.programme_name)}</span><span className={`course-state course-state-${progress.state.toLowerCase()}`}>{stateLabel[progress.state]}</span></div>
          <span className="course-detail-course-code">{progress.course.code}</span>
          <h2 id="course-detail-title">{progress.course.title}</h2>
          <p>{narrative.overview || narrative.freeform || progress.course.description || "A structured CITIS learning experience built around practical skills and measurable progress."}</p>
          <div className="course-detail-hero-actions">
            <button className="course-primary-button" type="button" onClick={onStart}>{actionLabel} <span aria-hidden="true">→</span></button>
            {certificate && <button className="course-details-button" type="button" onClick={onViewCertificates}>View certificate</button>}
          </div>
        </div>
        <aside className="course-detail-summary">
          <div className="course-detail-summary-progress"><strong>{progress.percentage}%</strong><span>course progress</span><ProgressBar percentage={progress.percentage} /></div>
          <div className="course-detail-summary-stats"><span><strong>{progress.modules.length}</strong>modules</span><span><strong>{progress.lessons.total}</strong>lessons</span><span><strong>{progress.assessments.total}</strong>checks</span></div>
        </aside>
      </div>
      <div className="course-detail-body">
        <main>
          <section className="course-detail-content-block">
            <span className="course-detail-eyebrow">A clear path forward</span>
            <h3>What you’ll learn</h3>
            <div className="course-learning-points">{learningPoints.map((item) => <div key={item}><span aria-hidden="true">✓</span><p>{item}</p></div>)}</div>
          </section>
          <section className="course-detail-content-block">
            <div className="course-detail-block-heading"><div><span className="course-detail-eyebrow">Course content</span><h3>Curriculum</h3></div><span>{progress.lessons.total} lessons · {progress.modules.length} modules</span></div>
            <div className="detail-curriculum-list">
              {progress.modules.map((courseModule) => (
                <details key={courseModule.id} open={courseModule.sequence === 1}>
                  <summary><span className="detail-curriculum-number">{String(courseModule.sequence).padStart(2, "0")}</span><span><strong>{courseModule.title}</strong><small>{courseModule.lessons.total} lessons · {courseModule.percentage}% complete</small></span><span aria-hidden="true">⌄</span></summary>
                  <div>{courseModule.lessonItems.map((lesson) => <span key={lesson.id}><b aria-hidden="true">○</b>{lesson.title}{lesson.estimatedDuration != null && <small>{lesson.estimatedDuration} min</small>}</span>)}</div>
                </details>
              ))}
            </div>
          </section>
        </main>
        <aside className="course-detail-side-card">
          <span className="course-detail-eyebrow">Your progress</span>
          <strong>{progress.lessons.completed} of {progress.lessons.total}</strong>
          <p>lessons completed</p>
          <ProgressBar percentage={progress.percentage} />
          <div className="course-detail-side-list"><span><b>Next up</b>{progress.modules.find((courseModule) => courseModule.state !== "COMPLETED")?.title || "Review your course"}</span><span><b>Assessment checks</b>{progress.assessments.completed} of {progress.assessments.total} complete</span></div>
          <button className="course-primary-button" type="button" onClick={onStart}>{actionLabel} <span aria-hidden="true">→</span></button>
        </aside>
      </div>
    </section>
  );
}

function ContinueLearning({
  progress,
  onContinue,
  onDetails,
}: {
  progress: Progress;
  onContinue: () => void;
  onDetails: () => void;
}) {
  const category = categoryForCourse(progress.course.programme_name);
  const narrative = parseCourseNarrative(progress.course.description);
  const nextModule = progress.modules.find((module) => module.state !== "COMPLETED");
  const actionLabel = progress.state === "NOT_STARTED" ? "Start learning" : "Continue learning";

  return (
    <section className="continue-learning-panel" aria-labelledby="continue-learning-title">
      <div className="continue-learning-art" aria-hidden="true">
        <span>Next</span>
        <strong>{String(progress.modules.findIndex((module) => module.state !== "COMPLETED") + 1 || progress.modules.length).padStart(2, "0")}</strong>
        <i />
      </div>
      <div className="continue-learning-copy">
        <div className="continue-learning-kicker">
          <span className="portal-eyebrow">Continue learning</span>
          <span className="continue-learning-state">{progress.state === "NOT_STARTED" ? "Ready to start" : `${progress.percentage}% complete`}</span>
        </div>
        <p className="continue-learning-context">{progress.course.code} <span aria-hidden="true">·</span> {category}</p>
        <h2 id="continue-learning-title">{progress.course.title}</h2>
        <p className="continue-learning-description">{shortCourseDescription(narrative, progress.course.description)}</p>
        <div className="continue-learning-meta">
          <span><strong>{nextModule?.title || "Course complete"}</strong><small>Next module</small></span>
          <span><strong>{progress.lessons.completed}/{progress.lessons.total}</strong><small>Lessons complete</small></span>
        </div>
        <div className="continue-learning-actions">
          <button className="course-primary-button" type="button" onClick={onContinue}>{actionLabel} <span aria-hidden="true">→</span></button>
          <button className="course-details-button" type="button" onClick={onDetails}>View course details <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <div className="continue-learning-progress">
        <div className="continue-learning-progress-heading"><span>Your progress</span><strong>{progress.percentage}%</strong></div>
        <ProgressBar percentage={progress.percentage} />
        <p>{progress.lessons.completed === progress.lessons.total ? "All lessons complete" : `${progress.lessons.total - progress.lessons.completed} lessons left in this course`}</p>
      </div>
    </section>
  );
}

function CourseCatalogue({
  courses,
  provider,
  onCompleteLesson,
  certificates,
  onViewCertificates,
}: {
  courses: Progress[];
  provider: LmsCourseProvider | null;
  onCompleteLesson: (courseId: string, lessonId: string) => Promise<void>;
  certificates: Certificate[];
  onViewCertificates: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CatalogueFilter>("all");
  const [sort, setSort] = useState<CatalogueSort>("recommended");
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const [learningCourseId, setLearningCourseId] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();

  const visibleCourses = courses
    .filter((progress) => {
      const category = categoryForCourse(progress.course.programme_name);
      if (filter !== "all" && category !== filter) return false;
      if (!normalizedSearch) return true;
      const searchable = `${progress.course.title} ${progress.course.code} ${progress.course.programme_name || ""} ${progress.course.description || ""}`.toLowerCase();
      return searchable.includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (sort === "title") return left.course.title.localeCompare(right.course.title);
      if (sort === "progress") return right.percentage - left.percentage || left.course.title.localeCompare(right.course.title);
      if (sort === "modules") return right.modules.length - left.modules.length || left.course.title.localeCompare(right.course.title);
      return sortRank(left.state) - sortRank(right.state) || right.percentage - left.percentage || left.course.title.localeCompare(right.course.title);
    });

  const categoryCount = (value: CatalogueFilter) => value === "all" ? courses.length : courses.filter((course) => categoryForCourse(course.course.programme_name) === value).length;
  const completedCourses = courses.filter((course) => course.state === "COMPLETED").length;
  const activeCourses = courses.filter((course) => course.state === "IN_PROGRESS").length;
  const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
  const completedLessons = courses.reduce((total, course) => total + course.lessons.completed, 0);
  const averageProgress = courses.length ? Math.round(courses.reduce((total, course) => total + course.percentage, 0) / courses.length) : 0;
  const continueCourse = (courses.find((course) => course.state === "IN_PROGRESS") || courses.find((course) => course.state === "NOT_STARTED") || courses[0])!;

  if (learningCourseId) {
    const learningCourse = courses.find((course) => course.course.id === learningCourseId);
    if (learningCourse) return <CourseLearningView progress={learningCourse} provider={provider} certificate={certificates.find((certificate) => certificate.course_id === learningCourse.course.id)} onViewCertificates={onViewCertificates} onBack={() => setLearningCourseId(null)} onCompleteLesson={onCompleteLesson} />;
  }

  if (detailCourseId) {
    const detailCourse = courses.find((course) => course.course.id === detailCourseId);
    if (detailCourse) return <CourseDetailsView progress={detailCourse} provider={provider} certificate={certificates.find((certificate) => certificate.course_id === detailCourse.course.id)} onBack={() => setDetailCourseId(null)} onStart={() => setLearningCourseId(detailCourse.course.id)} onViewCertificates={onViewCertificates} />;
  }

  return (
    <section className="course-catalogue" id="my-learning" aria-labelledby="course-catalogue-title">
      <ContinueLearning
        progress={continueCourse}
        onContinue={() => setLearningCourseId(continueCourse.course.id)}
        onDetails={() => setDetailCourseId(continueCourse.course.id)}
      />
      <div className="catalogue-heading">
        <div>
          <span className="catalogue-eyebrow">Your learning library</span>
          <h2 id="course-catalogue-title">{provider ? `${providerLabel(provider)} courses` : "Your enrolled courses"}</h2>
          <p>Explore your curriculum, keep your progress moving, and turn each completed lesson into career-ready confidence.</p>
        </div>
        <div className="catalogue-total"><strong>{courses.length}</strong><span>enrolled courses</span></div>
      </div>
      <div className="catalogue-stat-row">
        <div><span className="catalogue-stat-icon">◎</span><span><strong>{activeCourses}</strong><small>In progress</small></span></div>
        <div><span className="catalogue-stat-icon">✓</span><span><strong>{completedCourses}</strong><small>Completed</small></span></div>
        <div><span className="catalogue-stat-icon">▦</span><span><strong>{totalModules}</strong><small>Learning modules</small></span></div>
        <div><span className="catalogue-stat-icon">↗</span><span><strong>{averageProgress}%</strong><small>Average progress</small></span></div>
        <div><span className="catalogue-stat-icon">◷</span><span><strong>{completedLessons}</strong><small>Lessons completed</small></span></div>
      </div>
      <div className="catalogue-toolbar">
        <label className="catalogue-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search courses</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by course, skill, or code…" type="search" />
          {search && <button type="button" aria-label="Clear course search" onClick={() => setSearch("")}>×</button>}
        </label>
        <label className="catalogue-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as CatalogueSort)}><option value="recommended">Recommended</option><option value="title">Title A–Z</option><option value="progress">Progress</option><option value="modules">Most modules</option></select></label>
      </div>
      <div className="catalogue-filter-row" role="group" aria-label="Filter courses by category">
        {catalogueCategories.map((category) => <button className={filter === category.value ? "is-active" : ""} key={category.value} type="button" onClick={() => setFilter(category.value)}>{category.label}<span>{categoryCount(category.value)}</span></button>)}
      </div>
      <div className="catalogue-results-line"><span>Showing <strong>{visibleCourses.length}</strong> of {courses.length} courses</span>{(search || filter !== "all") && <button type="button" onClick={() => { setSearch(""); setFilter("all"); }}>Clear filters</button>}</div>
      {visibleCourses.length === 0 ? (
        <div className="catalogue-empty"><span>⌕</span><h3>No courses match those filters</h3><p>Try a different keyword or clear the category filter to see your full learning library.</p><button type="button" onClick={() => { setSearch(""); setFilter("all"); }}>Show all courses</button></div>
      ) : (
        <div className="course-card-grid">
           {visibleCourses.map((progress) => <CourseCard key={progress.course.id} progress={progress} expanded={false} onToggle={() => setDetailCourseId(progress.course.id)} onContinue={() => setLearningCourseId(progress.course.id)} />)}
        </div>
      )}
    </section>
  );
}

export default function StudentPortalPage() {
  const [courses, setCourses] = useState<Progress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [assessmentNotice, setAssessmentNotice] = useState("");
  const [assessmentBusy, setAssessmentBusy] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission | null>>({});
  const [submissionText, setSubmissionText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submissionValidation, setSubmissionValidation] = useState("");
  const [certificateBusy, setCertificateBusy] = useState("");
  const [certificateNotice, setCertificateNotice] = useState("");
  const [provider, setProvider] = useState<LmsCourseProvider | null>(null);
  const [providerReady, setProviderReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");

  useEffect(() => {
    setProvider(normalizeLmsCourseProvider(new URLSearchParams(window.location.search).get("provider")));
    setProviderReady(true);
  }, []);

  useEffect(() => {
    if (!providerReady) return;
    let active = true;
    Promise.all([
      fetch("/api/v1/progress", { credentials: "include" }).then(async (response) => {
        const body = await response.json().catch(() => null) as { data?: Progress[]; error?: { message?: string } } | null;
        if (!response.ok) throw new Error(body?.error?.message || "We couldn't load your learning progress.");
        return body?.data || [];
      }),
      fetchDashboardList<Assignment>("/api/v1/assignments"),
      fetchDashboardList<Assessment>("/api/v1/assessments"),
      fetchDashboardList<AssessmentHistoryItem>("/api/v1/assessment-history"),
      fetchDashboardList<Certificate>("/api/v1/certificates"),
    ])
      .then(async ([progressBody, assignmentBody, assessmentBody, historyBody, certificateBody]) => {
        if (!active) return;
        const visibleProgress = provider
          ? progressBody.filter((progress) => providerForProgrammeName(progress.course.programme_name) === provider)
          : progressBody;
        const visibleCourseIds = new Set(visibleProgress.map((progress) => progress.course.id));
        const isVisibleCourse = (courseId: string) => !provider || visibleCourseIds.has(courseId);
        const visibleAssignments = assignmentBody.filter((assignment) => isVisibleCourse(assignment.course_id));
        const visibleAssessments = assessmentBody.filter((assessment) => isVisibleCourse(assessment.course_id));
        const visibleHistory = historyBody.filter((item) => isVisibleCourse(item.course_id));
        const visibleCertificates = certificateBody.filter((certificate) => isVisibleCourse(certificate.course_id));
        setCourses(visibleProgress);
        setAssignments(visibleAssignments);
        setAssessments(visibleAssessments);
        setAssessmentHistory(visibleHistory);
        setCertificates(visibleCertificates);
        const submissionEntries = await Promise.all(visibleAssignments.map(async (assignment) => {
          const response = await fetch(`/api/v1/assignments/${assignment.id}/submission`, { credentials: "include" });
          if (!response.ok) return [assignment.id, null] as const;
          const body = await response.json() as { data: Submission | null };
          return [assignment.id, body.data] as const;
        }));
        if (active) setSubmissions(Object.fromEntries(submissionEntries));
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "We couldn't load your learning progress.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [provider, providerReady]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      // Continue to the LMS homepage even if the network is already down.
    } finally {
      window.location.assign(lmsHomepageUrl());
    }
  }

  function openRecoveryAssistant() {
    const destination = new URL(lmsHomepageUrl());
    destination.pathname = "/auth/forgot-password";
    destination.search = "?portal=learner";
    window.location.assign(destination.toString());
  }

  async function refreshProgress() {
    const response = await fetch("/api/v1/progress", { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json() as { data?: Progress[] };
    const nextCourses = body.data || [];
    setCourses(provider ? nextCourses.filter((progress) => providerForProgrammeName(progress.course.programme_name) === provider) : nextCourses);
  }

  async function refreshCertificates() {
    const nextCertificates = await fetchDashboardList<Certificate>("/api/v1/certificates");
    const visibleCourseIds = new Set(courses.map((course) => course.course.id));
    setCertificates(provider ? nextCertificates.filter((certificate) => visibleCourseIds.has(certificate.course_id)) : nextCertificates);
  }

  async function downloadCertificate(certificate: Certificate) {
    setCertificateBusy(certificate.id);
    setCertificateNotice("");
    setError("");
    try {
      const response = await fetch(`/api/v1/certificates/${certificate.id}/download`, { credentials: "include" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(body?.error?.message || "We couldn't download your certificate.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `citis-certificate-${certificate.certificate_number}.svg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setCertificateNotice("Certificate download started.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "We couldn't download your certificate.");
    } finally {
      setCertificateBusy("");
    }
  }

  async function loadAssessmentHistory() {
    const response = await fetch("/api/v1/assessment-history", { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json() as { data: AssessmentHistoryItem[] };
    setAssessmentHistory(body.data || []);
  }

  async function startAssessment(assessment: Assessment) {
    setAssessmentBusy(assessment.id);
    setError("");
    setAssessmentNotice("");
    try {
      const response = await fetch(`/api/v1/assessments/${assessment.id}/attempts`, { method: "POST", credentials: "include" });
      const body = await response.json().catch(() => null) as { data?: AssessmentAttempt; error?: { message?: string } } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error?.message || "We couldn't start this assessment.");
      setActiveAttempt(body.data);
      setActiveQuestionIndex(0);
      setAnswers(Object.fromEntries((body.data.draft_answers || []).map((draft) => [draft.question_id, draft.answer_json.value ?? ""])));
      setRemainingSeconds(body.data.expires_at ? Math.max(0, Math.ceil((new Date(body.data.expires_at).getTime() - Date.now()) / 1000)) : null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "We couldn't start this assessment.");
    } finally {
      setAssessmentBusy("");
    }
  }

  useEffect(() => {
    if (!activeAttempt || activeAttempt.status !== "IN_PROGRESS" || !activeAttempt.expires_at) {
      setRemainingSeconds(null);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(activeAttempt.expires_at as string).getTime() - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) setAssessmentNotice("Time expired. This attempt can no longer be submitted.");
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [activeAttempt]);

  useEffect(() => {
    if (!activeAttempt || activeAttempt.status !== "IN_PROGRESS") return;
    const timer = window.setTimeout(() => {
      void fetch(`/api/v1/assessment-attempts/${activeAttempt.id}/draft`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: activeAttempt.questions
            .filter((question) => answers[question.id] !== undefined)
            .map((question) => ({ questionId: question.id, answer: { value: answers[question.id] } })),
        }),
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [activeAttempt, answers]);

  async function submitAssessment() {
    if (!activeAttempt) return;
    setAssessmentBusy(activeAttempt.id);
    setError("");
    setAssessmentNotice("");
    try {
      const response = await fetch(`/api/v1/assessment-attempts/${activeAttempt.id}/submit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: activeAttempt.questions.map((question) => ({ questionId: question.id, answer: { value: answers[question.id] ?? (question.question_type === "MULTIPLE_CHOICE" ? [] : "") } })) }),
      });
    const body = await response.json().catch(() => null) as { data?: AssessmentAttempt; error?: { message?: string } } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error?.message || "We couldn't submit this assessment.");
      setActiveAttempt(body.data);
      await loadAssessmentHistory();
      await refreshProgress();
      await refreshCertificates();
      setAssessmentNotice(body.data.grading_status === "PENDING" ? "Assessment submitted. It is waiting for instructor review." : "Assessment submitted. Your result was calculated by the server.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "We couldn't submit this assessment.");
    } finally {
      setAssessmentBusy("");
    }
  }

  function setAnswer(question: AssessmentQuestion, value: string, checked?: boolean) {
    setAnswers((current) => {
      if (question.question_type !== "MULTIPLE_CHOICE") return { ...current, [question.id]: value };
      const previous = Array.isArray(current[question.id]) ? current[question.id] as string[] : [];
      return { ...current, [question.id]: checked ? [...previous, value] : previous.filter((item) => item !== value) };
    });
  }

  async function submitAssignment(assignment: Assignment) {
    const text = (submissionText[assignment.id] || "").trim();
    if (!text) {
      setSubmissionValidation("Add your written work before submitting.");
      return;
    }
    setSubmissionValidation("");
    setSubmittingId(assignment.id);
    setError("");
    setSubmissionError("");
    setSubmissionNotice("");
    try {
      const response = await fetch(`/api/v1/assignments/${assignment.id}/submissions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionText: text }),
      });
      const body = await response.json().catch(() => null) as { data?: Submission; error?: { message?: string } } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error?.message || "We couldn't submit this assignment.");
      setSubmissions((current) => ({ ...current, [assignment.id]: body.data! }));
      setSubmissionText((current) => ({ ...current, [assignment.id]: "" }));
      setSubmissionNotice("Assignment submitted successfully.");
    } catch (reason: unknown) {
      setSubmissionError(reason instanceof Error ? reason.message : "We couldn't submit this assignment.");
    } finally {
      setSubmittingId("");
    }
  }

  async function completeLesson(courseId: string, lessonId: string) {
    const response = await fetch(`/api/v1/progress/lessons/${lessonId}/complete`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    if (!response.ok) throw new Error(body?.error?.message || "We couldn’t mark this lesson complete.");

    const progressResponse = await fetch(`/api/v1/progress/courses/${courseId}`, { credentials: "include" });
    if (progressResponse.ok) {
      const progressBody = await progressResponse.json() as { data?: Progress };
      if (progressBody.data) setCourses((current) => current.map((course) => course.course.id === courseId ? progressBody.data! : course));
    }
    await refreshCertificates();
  }

  function dueLabel(value?: string | null) {
    return value ? `Due ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))}` : "No due date";
  }

  return (
    <main className="student-shell">
      <div className="student-container">
        <div className="portal-topbar">
          <div className="portal-brand"><span className="portal-brand-mark" aria-hidden="true">C</span><span><span className="portal-brand-citis">CITIS</span><span className="portal-brand-infot">InfoTech</span></span><span className="portal-brand-divider" /><span className="portal-brand-label">Learning portal</span></div>
          <div className="portal-actions">
            <span className="portal-session">Student space</span>
            <details className="profile-menu">
              <summary className="profile-trigger" aria-label="Open profile menu">
                <span className="profile-avatar">L</span>
                <span className="profile-trigger-copy"><strong>Profile</strong><small>Learner account</small></span>
                <span className="profile-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="profile-dropdown" role="menu" aria-label="Profile menu">
                <button className="profile-menu-item" type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setProfileNotice("Account details are managed through your CITIS profile."); }}>
                  <span className="profile-menu-icon" aria-hidden="true">◎</span><span><strong>My Account</strong><small>Manage your profile details</small></span>
                </button>
                <button className="profile-menu-item" type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setProfileNotice("Favourites will appear here when you save learning resources."); }}>
                  <span className="profile-menu-icon" aria-hidden="true">☆</span><span><strong>Favourites</strong><small>Keep useful resources close</small></span>
                </button>
                <button className="profile-menu-item" type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setProfileNotice("Your reports will appear here as they become available."); }}>
                  <span className="profile-menu-icon" aria-hidden="true">▥</span><span><strong>My Reports</strong><small>Review your learning activity</small></span>
                </button>
                <button className="profile-menu-item" type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setProfileNotice("Documentation is available through your programme team."); }}>
                  <span className="profile-menu-icon" aria-hidden="true">▤</span><span><strong>Documentation</strong><small>Find learning guidance</small></span>
                </button>
                <button className="profile-menu-item" type="button" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); openRecoveryAssistant(); }}>
                  <span className="profile-menu-icon" aria-hidden="true">✦</span><span><strong>Recovery Assistant</strong><small>Reset or recover account access</small></span>
                </button>
                <div className="profile-menu-divider" />
                <button className="profile-menu-item profile-signout-item" type="button" onClick={() => void logout()} disabled={loggingOut}>
                  <span className="profile-menu-icon" aria-hidden="true">↗</span><span><strong>{loggingOut ? "Signing out…" : "Sign Out"}</strong><small>End this secure session</small></span>
                </button>
              </div>
            </details>
          </div>
        </div>
        {profileNotice && <div className="profile-notice" role="status"><span>{profileNotice}</span><button type="button" onClick={() => setProfileNotice("")} aria-label="Dismiss profile notice">×</button></div>}
        <nav className="learner-nav" aria-label="Learner navigation">
          <a className="is-active" href="#my-learning"><span aria-hidden="true">◈</span>My Learning</a>
          <a href="#assessments"><span aria-hidden="true">✓</span>Assessments</a>
          <a href="#assignments"><span aria-hidden="true">▤</span>Assignments</a>
          <a href="#certificates"><span aria-hidden="true">✦</span>Certificates</a>
        </nav>
        <header className="portal-hero">
          <div className="portal-hero-copy">
            <span className="portal-eyebrow">CITIS learning portal {provider && `· ${providerLabel(provider)}`}</span>
            <h1>Build momentum.<br /><em>Own your next step.</em></h1>
            <p>Explore your enrolled courses, follow the roadmap, and turn every completed lesson into career-ready confidence.</p>
            <div className="portal-hero-proof"><span className="portal-hero-proof-mark" aria-hidden="true">✓</span><span><strong>Your progress, in one place</strong><small>Courses, assessments, assignments, and certificates stay connected.</small></span></div>
          </div>
          <div className="portal-hero-card">
            <span className="portal-hero-card-icon" aria-hidden="true">✦</span>
            <span>Today’s focus</span>
            <strong>{provider ? `${providerLabel(provider)} pathway` : "Your learning library"}</strong>
            <small>Small steps. Visible progress.</small>
            <a href="#my-learning">Open My Learning <span aria-hidden="true">→</span></a>
          </div>
        </header>

        {loading && <section className="portal-state-card portal-loading-card"><span className="portal-loading-mark" aria-hidden="true"><i /><i /><i /></span><strong>Loading your learning space</strong><span>Preparing your courses and progress.</span></section>}
        {!loading && error && (
          <section className="portal-state-card portal-error-card">
            <span className="portal-state-icon portal-state-icon-error" aria-hidden="true">!</span>
            <h2>We couldn’t load your progress</h2>
            <p>{error}</p>
            <a href="/auth/login">Sign in to continue</a>
          </section>
        )}
        {!loading && !error && courses.length === 0 && (
          <section className="portal-state-card">
            <span className="portal-empty-icon" aria-hidden="true">○</span>
            <h2>No active courses yet</h2>
            <p>Your institution’s learning team will show your courses here after you are enrolled.</p>
          </section>
        )}
        {!loading && !error && courses.length > 0 && <CourseCatalogue courses={courses} provider={provider} certificates={certificates} onViewCertificates={() => document.getElementById("certificates")?.scrollIntoView({ behavior: "smooth", block: "start" })} onCompleteLesson={completeLesson} />}
        {!loading && !error && (
          <section className="assessment-history-section" id="assessment-history">
            <div className="portal-section-heading">
              <div>
                <p className="portal-eyebrow">Your record</p>
                <h2>Assessment history</h2>
              </div>
              <span className="section-heading-note">{assessmentHistory.length} {assessmentHistory.length === 1 ? "attempt" : "attempts"}</span>
            </div>
            {assessmentHistory.length === 0 ? <div className="assessment-empty-state">Your submitted assessment results will appear here.</div> : (
              <div className="assessment-history-list">
                {assessmentHistory.map((item) => {
                  const statusClass = item.grading_status === "PENDING" ? "is-pending" : item.passed === false ? "is-failed" : "is-passed";
                  return (
                    <article className="assessment-history-card" key={item.attempt_id}>
                      <div className="assessment-history-icon" aria-hidden="true">✓</div>
                      <div className="assessment-history-copy">
                        <p className="assessment-history-context">{item.course_code} <span>·</span> {item.module_title}</p>
                        <h3>{item.title}</h3>
                        <span>Attempt {item.attempt_number} <span aria-hidden="true">·</span> {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.submitted_at))}</span>
                        {item.grading_feedback && <p className="assessment-history-feedback">{item.grading_feedback}</p>}
                      </div>
                      <div className={`assessment-history-result ${statusClass}`}>
                        <strong>{item.grading_status === "PENDING" ? "Review pending" : `${item.score ?? "—"}/${item.max_score ?? "—"}`}</strong>
                        <span>{item.grading_status === "PENDING" ? "Awaiting instructor review" : item.passed ? "Passed" : item.passed === false ? "Not passed" : "Graded"}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section className="certificates-section" id="certificates">
            <div className="portal-section-heading">
              <div>
                <p className="portal-eyebrow">Recognition</p>
                <h2>Your certificates</h2>
              </div>
              {certificateNotice && <span className="section-heading-notice">{certificateNotice}</span>}
            </div>
            {certificates.length === 0 ? (
              <div className="certificates-empty">
                <span className="certificate-empty-icon" aria-hidden="true">✦</span>
                <div>
                  <strong>No certificates issued yet</strong>
                  <span>{courses.some((course) => course.state === "COMPLETED") ? "Your completion is being checked. Certificates are issued automatically when every published lesson and required assessment is complete." : "Complete all published lessons and required assessments in an enrolled course to receive a certificate automatically."}</span>
                </div>
              </div>
            ) : (
              <div className="certificate-list">
                {certificates.map((certificate) => (
                  <article className="certificate-card" key={certificate.id}>
                    <div className="certificate-card-mark" aria-hidden="true"><span>✓</span></div>
                    <div className="certificate-card-copy">
                      <p className="certificate-kicker">Certificate of achievement</p>
                      <h3>{certificate.course_title}</h3>
                      <p className="certificate-meta">{certificate.course_code} <span aria-hidden="true">·</span> Issued {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(certificate.issue_date))}</p>
                      <p className="certificate-number">Certificate number <strong>{certificate.certificate_number}</strong></p>
                    </div>
                    <button className="certificate-download-button" onClick={() => void downloadCertificate(certificate)} disabled={Boolean(certificateBusy)} type="button">
                      {certificateBusy === certificate.id ? "Preparing…" : "Download certificate"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section className="assessment-section" id="assessments">
            <div className="portal-section-heading">
              <div>
                <p className="portal-eyebrow">Knowledge checks</p>
                <h2>Assessments</h2>
              </div>
              {assessmentNotice && <span className="assessment-notice">{assessmentNotice}</span>}
            </div>
            {activeAttempt ? (() => {
              const questions = activeAttempt.questions;
              const currentQuestion = questions[activeQuestionIndex] || questions[0];
              const context = assessments.find((assessment) => assessment.id === activeAttempt.assessment.id);
              const course = context ? courses.find((item) => item.course.id === context.course_id) : undefined;
              const answeredCount = questions.filter((question) => answerHasValue(answers[question.id])).length;
              const questionProgress = questions.length ? Math.round(((activeQuestionIndex + 1) / questions.length) * 100) : 0;
              const isResult = activeAttempt.status === "SUBMITTED" || activeAttempt.status === "EXPIRED";
              const resultTone = activeAttempt.status === "EXPIRED" ? "is-expired" : activeAttempt.grading_status === "PENDING" ? "is-pending" : activeAttempt.passed === false ? "is-failed" : "is-passed";
              return (
                <div className="assessment-workspace">
                  <header className="assessment-header">
                    <div className="assessment-header-main">
                      <button className="assessment-back-button" onClick={() => { setActiveAttempt(null); setActiveQuestionIndex(0); }} type="button">← Back to assessments</button>
                      <div className="assessment-header-copy">
                        <div className="assessment-header-kicker"><span>{assessmentTypeLabel(activeAttempt.assessment.assessment_type)}</span><span>{activeAttempt.status === "IN_PROGRESS" ? "Attempt in progress" : "Attempt complete"}</span></div>
                        <h3>{activeAttempt.assessment.title}</h3>
                        <p>{course?.course.title || "CITIS learning portal"} {context?.module_title && <><span aria-hidden="true">·</span> {context.module_title}</>}</p>
                      </div>
                    </div>
                    <div className={`assessment-status-card ${resultTone}`}>
                      <span>{activeAttempt.status === "IN_PROGRESS" ? "Time remaining" : activeAttempt.status === "EXPIRED" ? "Attempt status" : "Assessment result"}</span>
                      <strong>{activeAttempt.status === "IN_PROGRESS" ? (remainingSeconds === null ? "No time limit" : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`) : activeAttempt.status === "EXPIRED" ? "Expired" : activeAttempt.grading_status === "PENDING" ? "Review pending" : `${activeAttempt.score ?? "—"}/${activeAttempt.max_score ?? "—"}`}</strong>
                      <small>{activeAttempt.status === "IN_PROGRESS" ? "Save your progress as you go" : activeAttempt.grading_status === "PENDING" ? "Awaiting instructor review" : activeAttempt.passed ? "Passed" : activeAttempt.passed === false ? "Not passed" : "Graded"}</small>
                    </div>
                  </header>

                  {isResult ? (
                    <div className="assessment-result-screen">
                      <div className={`assessment-result-hero ${resultTone}`}>
                        <div className="assessment-result-icon" aria-hidden="true">{activeAttempt.status === "EXPIRED" ? "!" : activeAttempt.grading_status === "PENDING" ? "…" : activeAttempt.passed ? "✓" : "↺"}</div>
                        <div>
                          <span className="assessment-result-kicker">Assessment result</span>
                          <h4>{activeAttempt.status === "EXPIRED" ? "This attempt has expired" : activeAttempt.grading_status === "PENDING" ? "Your answers are with your instructor" : activeAttempt.passed ? "Great work — you passed" : "Keep going — review and try again"}</h4>
                          <p>{activeAttempt.status === "EXPIRED" ? "This attempt can no longer be submitted." : activeAttempt.grading_status === "PENDING" ? "Your final score will appear here after the instructor completes the review." : "Your result has been calculated by the server."}</p>
                        </div>
                        {activeAttempt.status === "SUBMITTED" && activeAttempt.grading_status !== "PENDING" && <div className="assessment-result-score"><strong>{activeAttempt.score ?? "—"}</strong><span>of {activeAttempt.max_score ?? "—"} marks</span></div>}
                      </div>
                      {assessmentNotice && <div className="assessment-alert" role="status">{assessmentNotice}</div>}
                      <div className="assessment-review-heading"><div><span className="assessment-result-kicker">Answer review</span><h4>Question feedback</h4></div><span>{questions.length} {questions.length === 1 ? "question" : "questions"}</span></div>
                      <div className="assessment-review-list">
                        {questions.map((question, index) => {
                          const selected = answers[question.id];
                          const result = activeAttempt.results?.find((item) => item.questionId === question.id);
                          const reviewClass = result?.correct === true ? "is-correct" : result?.correct === false ? "is-incorrect" : "is-pending";
                          return (
                            <article className={`assessment-review-item ${reviewClass}`} key={question.id}>
                              <div className="assessment-review-number">{String(index + 1).padStart(2, "0")}</div>
                              <div className="assessment-review-copy"><h5>{question.prompt}</h5><p><strong>Your response:</strong> {answerDisplay(question, selected)}</p></div>
                              <div className="assessment-review-mark"><strong>{result ? `${result.awardedMarks}/${question.marks}` : "—"}</strong><span>{result?.correct === true ? "Correct" : result?.correct === false ? "Review" : "Pending"}</span></div>
                            </article>
                          );
                        })}
                      </div>
                      <button className="assessment-secondary-button assessment-result-back" onClick={() => { setActiveAttempt(null); setActiveQuestionIndex(0); }} type="button">Back to assessments</button>
                    </div>
                  ) : (
                    <div className="assessment-take-layout">
                      <aside className="assessment-progress-panel">
                        <div className="assessment-progress-heading"><div><span>Progress</span><strong>{activeQuestionIndex + 1} <small>of {questions.length}</small></strong></div><span>{answeredCount} answered</span></div>
                        <div className="assessment-progress-track"><div style={{ width: `${questionProgress}%` }} /></div>
                        <div className="assessment-question-map" aria-label="Question navigation">
                          {questions.map((question, index) => <button className={`${index === activeQuestionIndex ? "is-current" : ""} ${answerHasValue(answers[question.id]) ? "is-answered" : ""}`} key={question.id} onClick={() => setActiveQuestionIndex(index)} aria-label={`Go to question ${index + 1}`} type="button">{index + 1}</button>)}
                        </div>
                        <div className="assessment-progress-tip"><span aria-hidden="true">✦</span><p>Your answers save automatically while you work.</p></div>
                      </aside>
                      <div className="assessment-question-area">
                        <div className="assessment-question-topline"><span>Question {activeQuestionIndex + 1} of {questions.length}</span><span>{currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}</span></div>
                        <article className="assessment-question-card">
                          <div className="assessment-question-heading"><span className="assessment-question-number">{String(activeQuestionIndex + 1).padStart(2, "0")}</span><div><span className="assessment-question-type">{currentQuestion.question_type === "MULTIPLE_CHOICE" ? "Select all that apply" : currentQuestion.question_type === "SINGLE_CHOICE" || currentQuestion.question_type === "TRUE_FALSE" ? "Select one answer" : "Write your answer"}</span><h4>{currentQuestion.prompt}</h4></div></div>
                          {currentQuestion.question_type === "SHORT_TEXT" || currentQuestion.question_type === "NUMERIC" ? (
                            <div className="assessment-text-answer"><label htmlFor={`assessment-answer-${currentQuestion.id}`}>{currentQuestion.question_type === "NUMERIC" ? "Enter a number" : "Write your response"}</label><input id={`assessment-answer-${currentQuestion.id}`} disabled={activeAttempt.status !== "IN_PROGRESS"} value={typeof answers[currentQuestion.id] === "string" ? answers[currentQuestion.id] as string : ""} onChange={(event) => setAnswer(currentQuestion, event.target.value)} placeholder={currentQuestion.question_type === "NUMERIC" ? "e.g. 85" : "Type your answer here…"} /></div>
                          ) : (
                            <div className="assessment-options">
                              {currentQuestion.options.map((option) => {
                                const selected = Array.isArray(answers[currentQuestion.id]) ? (answers[currentQuestion.id] as string[]).includes(option.value) : answers[currentQuestion.id] === option.value;
                                return <label className={`assessment-option ${selected ? "is-selected" : ""}`} key={option.id}><input disabled={activeAttempt.status !== "IN_PROGRESS"} type={currentQuestion.question_type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={currentQuestion.id} checked={selected} onChange={(event) => setAnswer(currentQuestion, option.value, event.target.checked)} /><span className="assessment-option-control" aria-hidden="true">{selected ? "✓" : ""}</span><span className="assessment-option-label">{option.label}</span></label>;
                              })}
                            </div>
                          )}
                        </article>
                        {assessmentNotice && <div className="assessment-alert" role="status">{assessmentNotice}</div>}
                        <div className="assessment-navigation">
                          <button className="assessment-secondary-button" disabled={activeQuestionIndex === 0} onClick={() => setActiveQuestionIndex((index) => Math.max(0, index - 1))} type="button">← <span>Previous</span></button>
                          <div><span>{answeredCount} of {questions.length} answered</span>{activeQuestionIndex === questions.length - 1 ? <button className="assessment-primary-button" onClick={() => void submitAssessment()} disabled={assessmentBusy === activeAttempt.id || remainingSeconds === 0} type="button">{assessmentBusy === activeAttempt.id ? "Submitting…" : "Submit assessment"} <span aria-hidden="true">✓</span></button> : <button className="assessment-primary-button" onClick={() => setActiveQuestionIndex((index) => Math.min(questions.length - 1, index + 1))} type="button">Next question <span aria-hidden="true">→</span></button>}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })() : assessments.length === 0 ? <div className="assessment-empty-state">No published assessments are waiting for you.</div> : (
              <div className="assessment-list">
                {assessments.map((assessment) => {
                  const course = courses.find((item) => item.course.id === assessment.course_id);
                  return <article className="assessment-list-card" key={assessment.id}>
                    <div className="assessment-list-icon" aria-hidden="true">✦</div>
                    <div className="assessment-list-copy"><div className="assessment-list-context"><span>{assessmentTypeLabel(assessment.assessment_type)}</span><span>{assessment.module_title || course?.course.title || "CITIS course"}</span></div><h3>{assessment.title}</h3><p>{assessment.description || "Check your understanding and keep your learning momentum moving."}</p><div className="assessment-list-meta"><span><strong>{assessment.total_marks ?? "—"}</strong> marks</span><span><strong>{assessment.attempt_limit ?? "∞"}</strong> attempts</span></div></div>
                    <button className="assessment-primary-button" onClick={() => void startAssessment(assessment)} disabled={Boolean(assessmentBusy)} type="button">{assessmentBusy === assessment.id ? "Starting…" : "Start assessment"} <span aria-hidden="true">→</span></button>
                  </article>;
                })}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section className="assignments-section" id="assignments">
            <div className="portal-section-heading">
              <div>
                <p className="portal-eyebrow">Course work</p>
                <h2>Assignments</h2>
              </div>
              {submissionNotice && <span className="section-heading-notice">{submissionNotice}</span>}
            </div>
            {submissionError && <div className="assignment-error" role="alert">{submissionError}</div>}
            {assignments.length === 0 && <div className="assignment-empty"><span className="assignment-empty-icon" aria-hidden="true">▤</span><div><strong>No published assignments yet</strong><span>When course work is ready, it will appear here for you to complete and submit.</span></div></div>}
            {activeAssignmentId && assignments.some((assignment) => assignment.id === activeAssignmentId) && (() => {
              const assignment = assignments.find((item) => item.id === activeAssignmentId)!;
              const submission = submissions[assignment.id];
              return (
                <article className="assignment-detail-card">
                  <button className="assignment-back-button" onClick={() => { setActiveAssignmentId(null); setSubmissionValidation(""); }} type="button">← Back to assignments</button>
                  <div className="assignment-detail-heading">
                    <div>
                      <p className="assignment-context">{assignment.course_title} <span aria-hidden="true">·</span> {assignment.module_title}</p>
                      <h3>{assignment.title}</h3>
                      {assignment.description && <p className="assignment-description">{assignment.description}</p>}
                      <p className="assignment-instructions">{assignment.instructions}</p>
                    </div>
                    <div className="assignment-detail-meta"><strong>{assignment.max_marks}</strong><span>marks</span><small>{dueLabel(assignment.due_at)}</small></div>
                  </div>
                  {submission ? (
                    <div className={`assignment-submission-state ${submission.status === "GRADED" ? "is-graded" : ""}`}>
                      <div className="submission-state-heading"><strong>{submission.status === "GRADED" ? `Graded: ${submission.grade}/${assignment.max_marks}` : "Submitted for instructor review"}</strong>{submission.is_late && <span>Late submission</span>}</div>
                      <p className="submission-date">Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.submitted_at))}</p>
                      <p className="submission-text">{submission.submission_text}</p>
                      {submission.feedback && <p className="submission-feedback"><strong>Instructor feedback:</strong> {submission.feedback}</p>}
                    </div>
                  ) : (
                    <div className="assignment-form">
                      <label htmlFor="assignment-submission">Your submission</label>
                      <textarea id="assignment-submission" className={submissionValidation ? "has-error" : ""} aria-describedby="assignment-submission-help" aria-invalid={Boolean(submissionValidation)} maxLength={20000} value={submissionText[assignment.id] || ""} onChange={(event) => { setSubmissionValidation(""); setSubmissionText((current) => ({ ...current, [assignment.id]: event.target.value })); }} placeholder="Write your work here…" />
                      <div id="assignment-submission-help" className={`assignment-form-help ${submissionValidation ? "has-error" : ""}`}>
                        <span>{submissionValidation || "Use up to 20,000 characters."}</span>
                        <span>{(submissionText[assignment.id] || "").length}/20,000</span>
                      </div>
                      <button className="assignment-submit-button" onClick={() => void submitAssignment(assignment)} disabled={submittingId === assignment.id} type="button">{submittingId === assignment.id ? "Submitting…" : "Submit work"} <span aria-hidden="true">→</span></button>
                    </div>
                  )}
                </article>
              );
            })()}
            {assignments.length > 0 && <div className="assignment-list">
              {assignments.map((assignment) => {
                const submission = submissions[assignment.id];
                return (
                  <article className="assignment-card" key={assignment.id}>
                    <div className="assignment-card-heading">
                      <div>
                        <p className="assignment-context">{assignment.course_title} <span aria-hidden="true">·</span> {assignment.module_title}</p>
                        <h3>{assignment.title}</h3>
                        <p className="assignment-description">{assignment.description || assignment.instructions}</p>
                      </div>
                      <div className="assignment-card-meta"><strong>{assignment.max_marks}</strong><span>marks</span><small>{dueLabel(assignment.due_at)}</small></div>
                    </div>
                    {submission && (
                      <div className={`assignment-card-status ${submission.status === "GRADED" ? "is-graded" : ""}`}>
                        <strong>{submission.status === "GRADED" ? `Graded: ${submission.grade}/${assignment.max_marks}` : "Submitted for review"}</strong>
                        {submission.is_late && <span>Late submission</span>}
                        {submission.feedback && <p>{submission.feedback}</p>}
                      </div>
                    )}
                    <button className="assignment-open-button" onClick={() => { setActiveAssignmentId(assignment.id); setSubmissionValidation(""); }} type="button">{submission ? "Open submission" : "Open assignment"} <span aria-hidden="true">↗</span></button>
                  </article>
                );
              })}
            </div>}
          </section>
        )}
      </div>
    </main>
  );
}