"use client";

import { useEffect, useMemo, useState } from "react";

type Principal = {
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
};

type Course = {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  programme_name?: string | null;
};

type Enrollment = {
  id: string;
  learner_id: string;
  learner_first_name?: string;
  learner_last_name?: string;
  learner_email?: string | null;
  enrolled_at?: string;
  status: "ACTIVE" | "REMOVED";
};

type Progress = {
  course: { id: string; title: string; code: string };
  learnerId: string;
  state: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  percentage: number;
  lessons: { completed: number; total: number };
  assessments: { completed: number; total: number };
};

type Assignment = {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  instructions: string;
  description?: string | null;
  module_title?: string | null;
  due_at?: string | null;
  max_marks: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type AssignmentEditor = {
  id?: string;
  moduleId: string;
  moduleTitle?: string;
  title: string;
  description: string;
  instructions: string;
  dueAt: string;
  maxMarks: string;
};

type Assessment = {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  description?: string | null;
  module_title?: string | null;
  assessment_type: string;
  total_marks?: number | null;
  passing_marks?: number | null;
  duration_minutes?: number | null;
  attempt_limit?: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type AssessmentOption = {
  id?: string;
  value: string;
  label: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  sequence?: number;
};

type AssessmentQuestion = {
  id: string;
  assessment_id: string;
  prompt: string;
  question_type: string;
  marks: number;
  sequence: number;
  status: "ACTIVE" | "ARCHIVED";
  options: AssessmentOption[];
};

type AssessmentAttempt = {
  id: string;
  assessment_id: string;
  learner_id: string;
  learner_first_name?: string;
  learner_last_name?: string;
  learner_email?: string | null;
  attempt_number: number;
  status: "SUBMITTED";
  score?: number | null;
  max_score?: number | null;
  passed?: boolean | null;
  grading_status: "NOT_REQUIRED" | "PENDING" | "GRADED";
  grader_id?: string | null;
  graded_at?: string | null;
  grading_feedback?: string | null;
  started_at?: string;
  submitted_at: string;
  assessment_title?: string;
  assessment_type?: string;
};

type AssessmentAnswer = {
  question_id: string;
  answer_json: unknown;
  is_correct?: boolean | null;
  awarded_marks: number;
};

type AssessmentAttemptDetail = AssessmentAttempt & {
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
};

type AssessmentEditor = {
  id?: string;
  moduleId: string;
  moduleTitle?: string;
  title: string;
  description: string;
  assessmentType: string;
  totalMarks: string;
  passingMarks: string;
  durationMinutes: string;
  attemptLimit: string;
};

type QuestionEditor = {
  assessmentId: string;
  id?: string;
  prompt: string;
  questionType: string;
  marks: string;
  sequence: string;
  options: AssessmentOption[];
};

type AttemptGradeDraft = {
  feedback: string;
  grades: Record<string, string>;
};

type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  sequence: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  sequence: number;
  estimated_duration?: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
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
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  managed_file_id?: string | null;
  managed_file_name?: string | null;
};

type ModuleEditor = {
  id?: string;
  title: string;
  description: string;
  sequence: string;
};

type LessonEditor = {
  id?: string;
  moduleId: string;
  moduleTitle?: string;
  title: string;
  description: string;
  sequence: string;
  estimatedDuration: string;
};

type ResourceEditor = {
  id?: string;
  lessonId: string;
  lessonTitle?: string;
  resourceType: string;
  title: string;
  url: string;
  filePath: string;
  duration: string;
  sequence: string;
  file?: File;
};

type CourseModuleData = {
  module: CourseModule;
  lessons: Array<{ lesson: Lesson; resources: LearningResource[] }>;
};

type CourseStructure = {
  modules: CourseModuleData[];
  error?: string;
};

type ProgressRow = {
  enrollment: Enrollment;
  progress: Progress | null;
  error?: string;
};

type Submission = {
  id: string;
  assignment_id: string;
  learner_id: string;
  learner_first_name?: string;
  learner_last_name?: string;
  learner_email?: string | null;
  submission_text: string;
  attachment_url?: string | null;
  is_late: boolean;
  status: "SUBMITTED" | "GRADED";
  grade?: number | null;
  feedback?: string | null;
  submitted_at: string;
};

type CourseData = {
  course: Course;
  modules: CourseModuleData[];
  structureError?: string;
  enrollments: Enrollment[];
  progress: ProgressRow[];
  rosterError?: string;
  assignments: Assignment[];
  submissions: Array<{ assignment: Assignment; submission: Submission }>;
  assessments: Assessment[];
  assessmentAttempts: Array<{ assessment: Assessment; attempt: AssessmentAttempt }>;
  assessmentError?: string;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: { message?: string };
  message?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "The request could not be completed.");
  }
  return payload?.data as T;
}

async function list<T>(path: string): Promise<T[]> {
  const rows = await request<T[]>(path);
  return Array.isArray(rows) ? rows : [];
}

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

type LmsCourseProvider = "adobe" | "autodesk" | "comptia" | "ic3" | "intuit" | "microsoft" | "unity";

function normalizeLmsCourseProvider(value: string | null): LmsCourseProvider | null {
  return value === "adobe" || value === "autodesk" || value === "comptia" || value === "ic3" || value === "intuit" || value === "microsoft" || value === "unity" ? value : null;
}

function providerForProgrammeName(value?: string | null): LmsCourseProvider | null {
  const name = value?.trim().toLowerCase() || "";
  if (name.includes("adobe")) return "adobe";
  if (name.includes("autodesk")) return "autodesk";
  if (name.includes("comptia")) return "comptia";
  if (name.includes("ic3") || name.includes("digital literacy")) return "ic3";
  if (name.includes("intuit") || name.includes("quickbooks")) return "intuit";
  if (name.includes("microsoft")) return "microsoft";
  if (name.includes("unity")) return "unity";
  return null;
}

async function loadCourseStructure(courseId: string): Promise<CourseModuleData[]> {
  const modules = await list<CourseModule>(`/course-modules?courseId=${encodeURIComponent(courseId)}`);
  return Promise.all(modules.map(async (module) => {
    const lessons = await list<Lesson>(`/lessons?moduleId=${encodeURIComponent(module.id)}`);
    return {
      module,
      lessons: await Promise.all(lessons.map(async (lesson) => ({
        lesson,
        resources: await list<LearningResource>(`/learning-resources?lessonId=${encodeURIComponent(lesson.id)}`),
      }))),
    };
  }));
}

function displayName(principal?: Principal) {
  return [
    principal?.firstName || principal?.first_name,
    principal?.lastName || principal?.last_name,
  ].filter(Boolean).join(" ") || "Instructor";
}

function learnerName(learner: Enrollment | Submission | AssessmentAttempt) {
  return [
    learner.learner_first_name,
    learner.learner_last_name,
  ].filter(Boolean).join(" ").trim() || "Unnamed learner";
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {}),
  }).format(new Date(value));
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function assignmentEditorFrom(assignment: Assignment): AssignmentEditor {
  return {
    id: assignment.id,
    moduleId: assignment.module_id,
      moduleTitle: assignment.module_title || "Current course module",
    title: assignment.title,
    description: assignment.description || "",
    instructions: assignment.instructions,
    dueAt: formatDateTimeLocal(assignment.due_at),
    maxMarks: String(assignment.max_marks),
  };
}

function assessmentEditorFrom(assessment: Assessment): AssessmentEditor {
  return {
    id: assessment.id,
    moduleId: assessment.module_id,
    moduleTitle: assessment.module_title || "Current course module",
    title: assessment.title,
    description: assessment.description || "",
    assessmentType: assessment.assessment_type,
    totalMarks: assessment.total_marks === null || assessment.total_marks === undefined ? "" : String(assessment.total_marks),
    passingMarks: assessment.passing_marks === null || assessment.passing_marks === undefined ? "" : String(assessment.passing_marks),
    durationMinutes: assessment.duration_minutes === null || assessment.duration_minutes === undefined ? "" : String(assessment.duration_minutes),
    attemptLimit: assessment.attempt_limit === null || assessment.attempt_limit === undefined ? "" : String(assessment.attempt_limit),
  };
}

function defaultQuestionOptions(questionType: string): AssessmentOption[] {
  if (questionType === "TRUE_FALSE") {
    return [
      { value: "true", label: "True", isCorrect: true },
      { value: "false", label: "False", isCorrect: false },
    ];
  }
  if (questionType === "SHORT_TEXT" || questionType === "NUMERIC") {
    return [{ value: "", label: "Correct answer", isCorrect: true }];
  }
  return [
    { value: "option-a", label: "Option A", isCorrect: true },
    { value: "option-b", label: "Option B", isCorrect: false },
  ];
}

function questionEditorFrom(question: AssessmentQuestion): QuestionEditor {
  return {
    assessmentId: question.assessment_id,
    id: question.id,
    prompt: question.prompt,
    questionType: question.question_type,
    marks: String(question.marks),
    sequence: String(question.sequence),
    options: question.options.map((option) => ({
      id: option.id,
      value: option.value,
      label: option.label,
      isCorrect: option.is_correct ?? option.isCorrect ?? false,
      sequence: option.sequence,
    })),
  };
}

function answerText(value: unknown): string {
  if (value && typeof value === "object" && "value" in value) {
    const answer = (value as { value?: unknown }).value;
    return Array.isArray(answer) ? answer.join(", ") : String(answer ?? "No answer");
  }
  return typeof value === "string" ? value : JSON.stringify(value) || "No answer";
}

const assessmentTypes = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "PROJECT", "VIVA", "PRACTICAL"];
const questionTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];
const resourceTypes = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];

function statusLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function resourceHref(resource: LearningResource) {
  if (resource.url) return resource.url;
  if (resource.managed_file_id) return `/api/v1/learning-resources/${encodeURIComponent(resource.id)}/file`;
  return null;
}

function ProgressBar({ percentage }: { percentage: number }) {
  const value = Math.max(0, Math.min(100, percentage));
  return (
    <div className="progress-track" aria-label={`${value}% complete`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill ${status.toLowerCase()}`}><span />{statusLabel(status)}</span>;
}

export default function TeacherPortalPage() {
  const [name, setName] = useState("Instructor");
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [moduleEditor, setModuleEditor] = useState<ModuleEditor | null>(null);
  const [moduleArchiveCandidate, setModuleArchiveCandidate] = useState<CourseModule | null>(null);
  const [lessonEditor, setLessonEditor] = useState<LessonEditor | null>(null);
  const [lessonArchiveCandidate, setLessonArchiveCandidate] = useState<Lesson | null>(null);
  const [resourceEditor, setResourceEditor] = useState<ResourceEditor | null>(null);
  const [resourceArchiveCandidate, setResourceArchiveCandidate] = useState<LearningResource | null>(null);
  const [assignmentEditor, setAssignmentEditor] = useState<AssignmentEditor | null>(null);
  const [archiveCandidate, setArchiveCandidate] = useState<Assignment | null>(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState("");
  const [assessmentEditor, setAssessmentEditor] = useState<AssessmentEditor | null>(null);
  const [assessmentArchiveCandidate, setAssessmentArchiveCandidate] = useState<Assessment | null>(null);
  const [questionArchiveCandidate, setQuestionArchiveCandidate] = useState<AssessmentQuestion | null>(null);
  const [questionEditor, setQuestionEditor] = useState<QuestionEditor | null>(null);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState("");
  const [assessmentDetails, setAssessmentDetails] = useState<Record<string, AssessmentAttemptDetail>>({});
  const [assessmentQuestions, setAssessmentQuestions] = useState<Record<string, AssessmentQuestion[]>>({});
  const [assessmentQuestionLoading, setAssessmentQuestionLoading] = useState("");
  const [attemptGradeDrafts, setAttemptGradeDrafts] = useState<Record<string, AttemptGradeDraft>>({});
  const [assessmentDetailLoading, setAssessmentDetailLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadDashboard(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [principal, courses] = await Promise.all([
        request<Principal>("/auth/me"),
        list<Course>("/courses"),
      ]);
      setName(displayName(principal));

      const selectedProvider = normalizeLmsCourseProvider(new URLSearchParams(window.location.search).get("provider"));
      const visibleCourses = selectedProvider
        ? courses.filter((course) => providerForProgrammeName(course.programme_name) === selectedProvider)
        : courses;
      const details = await Promise.all(visibleCourses.map(async (course): Promise<CourseData> => {
        const [enrollmentResult, assignments, assessmentResult, structure] = await Promise.all([
          list<Enrollment>(`/courses/${encodeURIComponent(course.id)}/enrollments?status=ACTIVE`)
            .then((data) => ({ data, error: undefined }))
            .catch((reason: unknown) => ({ data: [], error: errorMessage(reason, "The learner roster could not be loaded.") })),
          list<Assignment>(`/assignments?courseId=${encodeURIComponent(course.id)}`),
          list<Assessment>(`/assessments?courseId=${encodeURIComponent(course.id)}`)
            .then((data) => ({ data, error: undefined }))
            .catch((reason: unknown) => ({ data: [], error: errorMessage(reason, "Assessments could not be loaded.") })),
          loadCourseStructure(course.id).then((modules): CourseStructure => ({ modules })).catch((reason: unknown): CourseStructure => ({
            modules: [],
            error: errorMessage(reason, "Course content could not be loaded."),
          })),
        ]);
        const enrollments = enrollmentResult.data;
        const progress = await Promise.all(enrollments.map(async (enrollment): Promise<ProgressRow> => {
          try {
            return {
              enrollment,
              progress: await request<Progress>(`/progress/courses/${encodeURIComponent(course.id)}?learnerId=${encodeURIComponent(enrollment.learner_id)}`),
            };
          } catch (reason) {
            return {
              enrollment,
              progress: null,
              error: errorMessage(reason, "Progress could not be loaded."),
            };
          }
        }));
        const submissionGroups = await Promise.all(assignments.map(async (assignment) => ({
          assignment,
          submissions: await list<Submission>(`/assignments/${encodeURIComponent(assignment.id)}/submissions?page=1&pageSize=100`),
        })));
        const assessmentAttemptGroups = await Promise.all(assessmentResult.data.map(async (assessment) => ({
          assessment,
          attempts: await list<AssessmentAttempt>(`/assessments/${encodeURIComponent(assessment.id)}/attempts`).catch(() => []),
        })));
        return {
          course,
          modules: structure.modules,
          structureError: "error" in structure ? structure.error : undefined,
          enrollments,
          rosterError: enrollmentResult.error,
          progress,
          assignments,
          submissions: submissionGroups.flatMap(({ assignment, submissions }) => submissions.map((submission) => ({ assignment, submission }))),
          assessments: assessmentResult.data,
          assessmentAttempts: assessmentAttemptGroups.flatMap(({ assessment, attempts }) => attempts.map((attempt) => ({ assessment, attempt }))),
          assessmentError: assessmentResult.error,
        };
      }));

      setCourseData(details);
      setSelectedCourseId((current) => details.some((item) => item.course.id === current) ? current : details[0]?.course.id || "");
      setGradeDrafts((current) => {
        const next = { ...current };
        details.flatMap((item) => item.submissions).forEach(({ submission }) => {
          next[submission.id] = {
            grade: submission.grade === null || submission.grade === undefined ? next[submission.id]?.grade || "" : String(submission.grade),
            feedback: submission.feedback ?? (next[submission.id]?.feedback || ""),
          };
        });
        return next;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't load your teaching workspace.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

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
      // Continue to the login screen even if the network is already down.
    } finally {
      window.location.assign("/auth/login");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selected = courseData.find((item) => item.course.id === selectedCourseId) || courseData[0];
  const selectedProgressErrors = selected?.progress.filter(({ error }) => Boolean(error)) || [];
  const pendingSubmissions = useMemo(
    () => courseData.flatMap((item) => item.submissions
      .filter(({ submission }) => submission.status === "SUBMITTED")
      .map((entry) => ({ ...entry, course: item.course }))),
    [courseData],
  );
  const pendingAssessmentAttempts = useMemo(
    () => courseData.flatMap((item) => item.assessmentAttempts
      .filter(({ attempt }) => attempt.grading_status === "PENDING")
      .map((entry) => ({ ...entry, course: item.course }))),
    [courseData],
  );
  const selectedAssessmentAttempts = selected?.assessmentAttempts || [];
  const learnerTotal = courseData.reduce((total, item) => total + item.enrollments.length, 0);
  const progressRows = courseData.flatMap((item) => item.progress);
  const progressValues = progressRows.map(({ progress }) => progress?.percentage).filter((value): value is number => typeof value === "number");
  const averageProgress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;

  function selectCourse(courseId: string, scrollToSubmissions = false) {
    setSelectedCourseId(courseId);
    if (scrollToSubmissions) window.setTimeout(() => document.getElementById("submissions")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function openModuleEditor(module?: CourseModule) {
    setModuleEditor(module ? {
      id: module.id,
      title: module.title,
      description: module.description || "",
      sequence: String(module.sequence),
    } : {
      title: "",
      description: "",
      sequence: String((selected?.modules.length || 0) + 1),
    });
  }

  async function saveModule() {
    if (!selected || !moduleEditor) return;
    const title = moduleEditor.title.trim();
    const sequence = Number(moduleEditor.sequence);
    if (title.length < 2) {
      setError("Add a module title.");
      return;
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Module sequence must be a positive whole number.");
      return;
    }
    setBusyAction(`save-module:${moduleEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      await request(moduleEditor.id ? `/course-modules/${encodeURIComponent(moduleEditor.id)}` : "/course-modules", {
        method: moduleEditor.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(moduleEditor.id ? {} : { courseId: selected.course.id }),
          title,
          description: moduleEditor.description.trim() || undefined,
          sequence,
        }),
      });
      setModuleEditor(null);
      setNotice(moduleEditor.id ? `${title} was updated.` : `${title} was saved as a draft.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The module could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function publishModule(module: CourseModule) {
    setBusyAction(`publish-module:${module.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/course-modules/${encodeURIComponent(module.id)}/publish`, { method: "POST" });
      setNotice(`${module.title} is now available in the course.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The module could not be published."));
    } finally {
      setBusyAction("");
    }
  }

  async function archiveModule(module: CourseModule) {
    setBusyAction(`archive-module:${module.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/course-modules/${encodeURIComponent(module.id)}/archive`, { method: "POST" });
      setModuleArchiveCandidate(null);
      setNotice(`${module.title} was archived.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The module could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  function openLessonEditor(module: CourseModule, lesson?: Lesson) {
    setLessonEditor(lesson ? {
      id: lesson.id,
      moduleId: module.id,
      moduleTitle: module.title,
      title: lesson.title,
      description: lesson.description || "",
      sequence: String(lesson.sequence),
      estimatedDuration: lesson.estimated_duration === null || lesson.estimated_duration === undefined ? "" : String(lesson.estimated_duration),
    } : {
      moduleId: module.id,
      moduleTitle: module.title,
      title: "",
      description: "",
      sequence: String((selected?.modules.find(({ module: item }) => item.id === module.id)?.lessons.length || 0) + 1),
      estimatedDuration: "",
    });
  }

  async function saveLesson() {
    if (!selected || !lessonEditor) return;
    const title = lessonEditor.title.trim();
    const sequence = Number(lessonEditor.sequence);
    const estimatedDuration = lessonEditor.estimatedDuration.trim() ? Number(lessonEditor.estimatedDuration) : undefined;
    if (title.length < 2) {
      setError("Add a lesson title.");
      return;
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Lesson sequence must be a positive whole number.");
      return;
    }
    if (estimatedDuration !== undefined && (!Number.isInteger(estimatedDuration) || estimatedDuration < 0 || estimatedDuration > 100000)) {
      setError("Lesson duration must be a whole number between 0 and 100,000 minutes.");
      return;
    }
    setBusyAction(`save-lesson:${lessonEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      await request(lessonEditor.id ? `/lessons/${encodeURIComponent(lessonEditor.id)}` : "/lessons", {
        method: lessonEditor.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(lessonEditor.id ? {} : { moduleId: lessonEditor.moduleId }),
          title,
          description: lessonEditor.description.trim() || undefined,
          sequence,
          estimatedDuration,
        }),
      });
      setLessonEditor(null);
      setNotice(lessonEditor.id ? `${title} was updated.` : `${title} was saved as a draft.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The lesson could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function publishLesson(lesson: Lesson) {
    setBusyAction(`publish-lesson:${lesson.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/lessons/${encodeURIComponent(lesson.id)}/publish`, { method: "POST" });
      setNotice(`${lesson.title} is now available in the course.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The lesson could not be published."));
    } finally {
      setBusyAction("");
    }
  }

  async function archiveLesson(lesson: Lesson) {
    setBusyAction(`archive-lesson:${lesson.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/lessons/${encodeURIComponent(lesson.id)}/archive`, { method: "POST" });
      setLessonArchiveCandidate(null);
      setNotice(`${lesson.title} was archived.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The lesson could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  function openResourceEditor(lesson: Lesson, resource?: LearningResource) {
    setResourceEditor(resource ? {
      id: resource.id,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      resourceType: resource.resource_type,
      title: resource.title,
      url: resource.url || "",
      filePath: resource.file_path || "",
      duration: resource.duration === null || resource.duration === undefined ? "" : String(resource.duration),
      sequence: String(resource.sequence),
    } : {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      resourceType: "VIDEO",
      title: "",
      url: "",
      filePath: "",
      duration: "",
      sequence: String(1 + (selected?.modules.flatMap(({ lessons }) => lessons).find(({ lesson: item }) => item.id === lesson.id)?.resources.length || 0)),
    });
  }

  async function saveResource() {
    if (!selected || !resourceEditor) return;
    const title = resourceEditor.title.trim();
    const sequence = Number(resourceEditor.sequence);
    const duration = resourceEditor.duration.trim() ? Number(resourceEditor.duration) : undefined;
    const needsUrl = ["VIDEO", "LINK", "SCORM", "INTERACTIVE"].includes(resourceEditor.resourceType);
    const hasUpload = Boolean(resourceEditor.file);
    if (title.length < 2) {
      setError("Add a resource title.");
      return;
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Resource sequence must be a positive whole number.");
      return;
    }
    if (duration !== undefined && (!Number.isInteger(duration) || duration < 0 || duration > 100000)) {
      setError("Resource duration must be a whole number between 0 and 100,000 minutes.");
      return;
    }
    if (needsUrl && !resourceEditor.url.trim()) {
      setError(`${statusLabel(resourceEditor.resourceType)} resources require a URL.`);
      return;
    }
    if (hasUpload && !["PDF", "DOCUMENT", "PRESENTATION", "SCORM"].includes(resourceEditor.resourceType)) {
      setError("Managed files are supported for PDF, document, presentation, and SCORM resources.");
      return;
    }
    setBusyAction(`save-resource:${resourceEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      const saved = await request<LearningResource>(resourceEditor.id ? `/learning-resources/${encodeURIComponent(resourceEditor.id)}` : "/learning-resources", {
        method: resourceEditor.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...(resourceEditor.id ? {} : { lessonId: resourceEditor.lessonId }),
          resourceType: resourceEditor.resourceType,
          title,
          url: resourceEditor.url.trim() || undefined,
          filePath: resourceEditor.filePath.trim() || undefined,
          duration,
          sequence,
        }),
      });
      if (resourceEditor.file) {
        const formData = new FormData();
        formData.append("file", resourceEditor.file);
        const endpoint = resourceEditor.resourceType === "SCORM" ? "scorm" : "file";
        await request(`/learning-resources/${encodeURIComponent(saved.id || resourceEditor.id || "")}/${endpoint}`, {
          method: "POST",
          body: formData,
        });
      }
      setResourceEditor(null);
      setNotice(resourceEditor.id ? `${title} was updated.` : `${title} was saved as a draft.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The learning resource could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function publishResource(resource: LearningResource) {
    setBusyAction(`publish-resource:${resource.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/learning-resources/${encodeURIComponent(resource.id)}/publish`, { method: "POST" });
      setNotice(`${resource.title} is now available in the lesson.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The learning resource could not be published."));
    } finally {
      setBusyAction("");
    }
  }

  async function archiveResource(resource: LearningResource) {
    setBusyAction(`archive-resource:${resource.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/learning-resources/${encodeURIComponent(resource.id)}/archive`, { method: "POST" });
      setResourceArchiveCandidate(null);
      setNotice(`${resource.title} was archived.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The learning resource could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  function openAssignmentEditor(assignment?: Assignment) {
    if (assignment) {
      setAssignmentEditor(assignmentEditorFrom(assignment));
      return;
    }
    setAssignmentEditor({
      moduleId: selected?.modules[0]?.module.id || "",
      moduleTitle: selected?.modules[0]?.module.title,
      title: "",
      description: "",
      instructions: "",
      dueAt: "",
      maxMarks: "100",
    });
  }

  async function saveAssignment() {
    if (!selected || !assignmentEditor) return;
    const title = assignmentEditor.title.trim();
    const instructions = assignmentEditor.instructions.trim();
    const maxMarks = Number(assignmentEditor.maxMarks);
    if (!title || title.length < 2) {
      setError("Add an assignment title.");
      return;
    }
    if (!assignmentEditor.id && !assignmentEditor.moduleId) {
      setError("Select a course module for this assignment.");
      return;
    }
    if (!instructions || instructions.length < 2) {
      setError("Add instructions for the learner.");
      return;
    }
    if (!Number.isFinite(maxMarks) || maxMarks < 0.01 || maxMarks > 100000) {
      setError("Enter maximum marks between 0.01 and 100,000.");
      return;
    }
    setBusyAction(`save-assignment:${assignmentEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      const dueAt = assignmentEditor.dueAt ? new Date(assignmentEditor.dueAt).toISOString() : undefined;
      if (assignmentEditor.id) {
        await request(`/assignments/${encodeURIComponent(assignmentEditor.id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            description: assignmentEditor.description.trim() || undefined,
            instructions,
            dueAt,
            maxMarks,
          }),
        });
        setNotice(`${title} was updated.`);
      } else {
        await request("/assignments", {
          method: "POST",
          body: JSON.stringify({
            courseId: selected.course.id,
            moduleId: assignmentEditor.moduleId,
            title,
            description: assignmentEditor.description.trim() || undefined,
            instructions,
            dueAt,
            maxMarks,
          }),
        });
        setNotice(`${title} was saved as a draft.`);
      }
      setAssignmentEditor(null);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assignment could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function publishAssignment(assignment: Assignment) {
    setBusyAction(`publish:${assignment.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assignments/${encodeURIComponent(assignment.id)}/publish`, { method: "POST" });
      setNotice(`${assignment.title} is now available to learners.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The assignment could not be published.");
    } finally {
      setBusyAction("");
    }
  }

  async function archiveAssignment(assignment: Assignment) {
    setBusyAction(`archive:${assignment.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assignments/${encodeURIComponent(assignment.id)}/archive`, { method: "POST" });
      setArchiveCandidate(null);
      setNotice(`${assignment.title} was archived.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assignment could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  function openAssessmentEditor(assessment?: Assessment) {
    if (assessment) {
      setAssessmentEditor(assessmentEditorFrom(assessment));
      return;
    }
    setAssessmentEditor({
      moduleId: selected?.modules[0]?.module.id || "",
      moduleTitle: selected?.modules[0]?.module.title,
      title: "",
      description: "",
      assessmentType: "PROJECT",
      totalMarks: "",
      passingMarks: "",
      durationMinutes: "",
      attemptLimit: "",
    });
  }

  async function saveAssessment() {
    if (!selected || !assessmentEditor) return;
    const title = assessmentEditor.title.trim();
    const totalMarks = assessmentEditor.totalMarks.trim() ? Number(assessmentEditor.totalMarks) : undefined;
    const passingMarks = assessmentEditor.passingMarks.trim() ? Number(assessmentEditor.passingMarks) : undefined;
    const durationMinutes = assessmentEditor.durationMinutes.trim() ? Number(assessmentEditor.durationMinutes) : undefined;
    const attemptLimit = assessmentEditor.attemptLimit.trim() ? Number(assessmentEditor.attemptLimit) : undefined;
    const validNumber = (value: number | undefined) => value === undefined || Number.isFinite(value);
    if (!title || title.length < 2) {
      setError("Add an assessment title.");
      return;
    }
    if (!assessmentEditor.id && !assessmentEditor.moduleId) {
      setError("Select a course module for this assessment.");
      return;
    }
    if (!validNumber(totalMarks) || (totalMarks !== undefined && (totalMarks < 0 || totalMarks > 100000))) {
      setError("Enter total marks between 0 and 100,000.");
      return;
    }
    if (!validNumber(passingMarks) || (passingMarks !== undefined && (passingMarks < 0 || passingMarks > (totalMarks ?? 100000)))) {
      setError("Passing marks cannot exceed total marks.");
      return;
    }
    if (!validNumber(durationMinutes) || (durationMinutes !== undefined && (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440))) {
      setError("Duration must be a whole number of minutes between 1 and 1,440.");
      return;
    }
    if (!validNumber(attemptLimit) || (attemptLimit !== undefined && (!Number.isInteger(attemptLimit) || attemptLimit < 1 || attemptLimit > 100))) {
      setError("Attempt limit must be a whole number between 1 and 100.");
      return;
    }
    setBusyAction(`save-assessment:${assessmentEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      if (assessmentEditor.id) {
        await request(`/assessments/${encodeURIComponent(assessmentEditor.id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            description: assessmentEditor.description.trim() || undefined,
            totalMarks,
            passingMarks,
            durationMinutes,
            attemptLimit,
          }),
        });
        setNotice(`${title} was updated.`);
      } else {
        await request("/assessments", {
          method: "POST",
          body: JSON.stringify({
            courseId: selected.course.id,
            moduleId: assessmentEditor.moduleId,
            title,
            description: assessmentEditor.description.trim() || undefined,
            assessmentType: assessmentEditor.assessmentType,
            totalMarks,
            passingMarks,
            durationMinutes,
            attemptLimit,
          }),
        });
        setNotice(`${title} was saved as a draft.`);
      }
      setAssessmentEditor(null);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assessment could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function publishAssessment(assessment: Assessment) {
    setBusyAction(`publish-assessment:${assessment.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assessments/${encodeURIComponent(assessment.id)}/publish`, { method: "POST" });
      setNotice(`${assessment.title} is now available to learners.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assessment could not be published."));
    } finally {
      setBusyAction("");
    }
  }

  async function archiveAssessment(assessment: Assessment) {
    setBusyAction(`archive-assessment:${assessment.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assessments/${encodeURIComponent(assessment.id)}/archive`, { method: "POST" });
      setAssessmentArchiveCandidate(null);
      setNotice(`${assessment.title} was archived.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assessment could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  function openQuestionEditor(assessment: Assessment, question?: AssessmentQuestion) {
    if (question) {
      setQuestionEditor(questionEditorFrom(question));
      return;
    }
    const currentQuestions = assessmentQuestions[assessment.id] || [];
    setQuestionEditor({
      assessmentId: assessment.id,
      prompt: "",
      questionType: "SINGLE_CHOICE",
      marks: "10",
      sequence: String(currentQuestions.length + 1),
      options: defaultQuestionOptions("SINGLE_CHOICE"),
    });
  }

  async function loadAssessmentQuestions(assessment: Assessment) {
    if (assessmentQuestions[assessment.id]) return;
    setAssessmentQuestionLoading(assessment.id);
    try {
      const questions = await list<AssessmentQuestion>(`/assessments/${encodeURIComponent(assessment.id)}/questions`);
      setAssessmentQuestions((current) => ({ ...current, [assessment.id]: questions }));
    } catch (reason) {
      setError(errorMessage(reason, "The assessment questions could not be loaded."));
    } finally {
      setAssessmentQuestionLoading("");
    }
  }

  function updateQuestionType(questionType: string) {
    setQuestionEditor((current) => current ? {
      ...current,
      questionType,
      options: defaultQuestionOptions(questionType),
    } : current);
  }

  function toggleOptionCorrect(index: number) {
    setQuestionEditor((current) => {
      if (!current) return current;
      const single = current.questionType === "SINGLE_CHOICE" || current.questionType === "TRUE_FALSE" || current.questionType === "SHORT_TEXT" || current.questionType === "NUMERIC";
      return {
        ...current,
        options: current.options.map((option, optionIndex) => ({
          ...option,
          isCorrect: single ? optionIndex === index : optionIndex === index ? !Boolean(option.isCorrect ?? option.is_correct) : Boolean(option.isCorrect ?? option.is_correct),
        })),
      };
    });
  }

  function updateQuestionOption(index: number, field: "value" | "label", value: string) {
    setQuestionEditor((current) => current ? {
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? { ...option, [field]: value } : option),
    } : current);
  }

  function addQuestionOption() {
    setQuestionEditor((current) => current ? {
      ...current,
      options: [...current.options, { value: `option-${current.options.length + 1}`, label: `Option ${String.fromCharCode(65 + current.options.length)}`, isCorrect: false }],
    } : current);
  }

  function removeQuestionOption(index: number) {
    setQuestionEditor((current) => current && current.options.length > 1 ? {
      ...current,
      options: current.options.filter((_, optionIndex) => optionIndex !== index),
    } : current);
  }

  async function saveQuestion() {
    if (!questionEditor) return;
    const prompt = questionEditor.prompt.trim();
    const marks = Number(questionEditor.marks);
    const sequence = Number(questionEditor.sequence);
    const options = questionEditor.options.map((option) => ({
      value: option.value.trim(),
      label: option.label.trim(),
      isCorrect: Boolean(option.isCorrect ?? option.is_correct),
    }));
    if (prompt.length < 2) {
      setError("Add a question prompt.");
      return;
    }
    if (!Number.isFinite(marks) || marks < 0.01 || marks > 100000) {
      setError("Enter question marks between 0.01 and 100,000.");
      return;
    }
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Question sequence must be a positive whole number.");
      return;
    }
    if (options.some((option) => !option.value || !option.label)) {
      setError("Every answer option needs a value and label.");
      return;
    }
    if (new Set(options.map((option) => option.value)).size !== options.length) {
      setError("Answer option values must be unique.");
      return;
    }
    setBusyAction(`save-question:${questionEditor.id || "new"}`);
    setError("");
    setNotice("");
    try {
      const body = { prompt, marks, sequence, ...(questionEditor.id ? { options } : { questionType: questionEditor.questionType, options }) };
      if (questionEditor.id) {
        await request(`/assessment-questions/${encodeURIComponent(questionEditor.id)}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await request(`/assessments/${encodeURIComponent(questionEditor.assessmentId)}/questions`, { method: "POST", body: JSON.stringify(body) });
      }
      const assessmentId = questionEditor.assessmentId;
      setQuestionEditor(null);
      setAssessmentQuestions((current) => {
        const next = { ...current };
        delete next[assessmentId];
        return next;
      });
      setNotice(questionEditor.id ? "Question and options updated." : "Question added to the assessment.");
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The question could not be saved."));
    } finally {
      setBusyAction("");
    }
  }

  async function archiveQuestion(question: AssessmentQuestion) {
    setBusyAction(`archive-question:${question.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assessment-questions/${encodeURIComponent(question.id)}/archive`, { method: "POST" });
      setQuestionArchiveCandidate(null);
      setAssessmentQuestions((current) => {
        const next = { ...current };
        delete next[question.assessment_id];
        return next;
      });
      setNotice("The question was archived.");
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The question could not be archived."));
    } finally {
      setBusyAction("");
    }
  }

  async function loadAttemptDetail(attempt: AssessmentAttempt) {
    if (assessmentDetails[attempt.id]) return;
    setAssessmentDetailLoading(attempt.id);
    setError("");
    try {
      const detail = await request<AssessmentAttemptDetail>(`/assessment-attempts/${encodeURIComponent(attempt.id)}`);
      setAssessmentDetails((current) => ({ ...current, [attempt.id]: detail }));
      setAttemptGradeDrafts((current) => ({
        ...current,
        [attempt.id]: {
          feedback: detail.grading_feedback || "",
          grades: Object.fromEntries(detail.questions.map((question) => {
            const answer = detail.answers.find((item) => item.question_id === question.id);
            return [question.id, answer?.awarded_marks === null || answer?.awarded_marks === undefined ? "0" : String(answer.awarded_marks)];
          })),
        },
      }));
    } catch (reason) {
      setError(errorMessage(reason, "The submitted attempt could not be loaded."));
    } finally {
      setAssessmentDetailLoading("");
    }
  }

  async function gradeAttempt(attempt: AssessmentAttempt) {
    const detail = assessmentDetails[attempt.id];
    const draft = attemptGradeDrafts[attempt.id];
    if (!detail || !draft) return;
    const grades = detail.questions.map((question) => ({ questionId: question.id, awardedMarks: Number(draft.grades[question.id]) }));
    if (grades.some((grade) => !Number.isFinite(grade.awardedMarks) || grade.awardedMarks < 0 || grade.awardedMarks > Number(detail.questions.find((question) => question.id === grade.questionId)?.marks))) {
      setError("Each question grade must be within its configured marks.");
      return;
    }
    setBusyAction(`grade-attempt:${attempt.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assessment-attempts/${encodeURIComponent(attempt.id)}/grade`, {
        method: "PATCH",
        body: JSON.stringify({ grades, feedback: draft.feedback.trim() || undefined }),
      });
      setNotice(`${learnerName(attempt)}'s ${attempt.assessment_title || "assessment"} attempt was graded.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(errorMessage(reason, "The assessment attempt could not be graded."));
    } finally {
      setBusyAction("");
    }
  }

  async function gradeSubmission(assignment: Assignment, submission: Submission) {
    const draft = gradeDrafts[submission.id];
    const grade = Number(draft?.grade);
    if (!draft?.grade || !Number.isFinite(grade) || grade < 0 || grade > Number(assignment.max_marks)) {
      setError(`Enter a grade from 0 to ${assignment.max_marks} for ${learnerName(submission)}.`);
      return;
    }
    setBusyAction(`grade:${submission.id}`);
    setError("");
    setNotice("");
    try {
      await request(`/assignments/${encodeURIComponent(assignment.id)}/submissions/${encodeURIComponent(submission.id)}/grade`, {
        method: "PATCH",
        body: JSON.stringify({ grade, feedback: draft.feedback.trim() || undefined }),
      });
      setNotice(`${learnerName(submission)}'s submission was graded and progress was updated.`);
      await loadDashboard(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The submission could not be graded.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <main className="portal-shell">
      <div className="portal-grid">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">C</div>
            <div><strong>CITIS</strong><small>INSTRUCTOR PORTAL</small></div>
          </div>
          <div className="sidebar-label">Teaching workspace</div>
          <nav className="nav-list" aria-label="Instructor workspace">
            <a className="nav-item active" href="#overview"><span className="nav-icon">⌂</span>Overview</a>
            <a className="nav-item" href="#courses"><span className="nav-icon">▦</span>Assigned courses</a>
             <a className="nav-item" href="#content"><span className="nav-icon">≡</span>Course content</a>
            <a className="nav-item" href="#learners"><span className="nav-icon">♙</span>Learners & progress</a>
             <a className="nav-item" href="#assessments"><span className="nav-icon">◇</span>Assessments <b>{pendingAssessmentAttempts.length}</b></a>
            <a className="nav-item" href="#submissions"><span className="nav-icon">✓</span>Submissions <b>{pendingSubmissions.length}</b></a>
          </nav>
          <div className="sidebar-foot">
            <div className="avatar">{name.slice(0, 1).toUpperCase()}</div>
            <div><strong>{name}</strong><span>Instructor access</span></div>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div className="mobile-brand"><div className="brand-mark">C</div><strong>CITIS Teaching</strong></div>
            <div className="topbar-right"><span className="live-label"><i />Secure workspace</span><button className="help-link" type="button" onClick={() => setNotice("Need help? Contact your institution administrator.")}>Help</button><button className="help-link" type="button" onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? "Signing out…" : "Sign out"}</button></div>
          </header>

          <div className="content">
             <header className="page-heading" id="overview">
               <div className="page-heading-copy">
                <p className="eyebrow">Daily teaching workspace</p>
                <h1>Good morning, {name.split(" ")[0]}.</h1>
                <p className="intro">Keep your assigned courses moving, check learner progress, and clear the review queue from one secure view.</p>
                 <div className="heading-identity"><span className="heading-avatar">{name.slice(0, 1).toUpperCase()}</span><span><strong>{name}</strong><small>Instructor · Teaching workspace</small></span></div>
              </div>
               <div className="heading-actions">
                 <button className="secondary-button heading-quick-action" type="button" onClick={() => document.getElementById("submissions")?.scrollIntoView({ behavior: "smooth", block: "start" })} disabled={pendingSubmissions.length === 0}><span>✓</span>Review queue <b>{pendingSubmissions.length}</b></button>
                 <button className="primary-button" type="button" onClick={() => void loadDashboard(true)} disabled={loading || refreshing}>
                   <span className={refreshing ? "spin" : ""}>↻</span>{refreshing ? "Refreshing…" : "Refresh workspace"}
                 </button>
               </div>
            </header>

            {error && <div className="alert error" role="alert"><strong>We couldn’t complete that action</strong><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
            {notice && <div className="alert success" role="status"><strong>Workspace updated</strong><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}

             <section className="metrics" aria-label="Teaching summary">
               <article className="metric-card"><span className="metric-card-icon">▦</span><div><span className="metric-label">Assigned courses</span><strong>{loading ? "—" : courseData.length}</strong><span className="metric-foot">Courses in your teaching scope</span></div></article>
               <article className="metric-card"><span className="metric-card-icon learners">♙</span><div><span className="metric-label">Total learners</span><strong>{loading ? "—" : learnerTotal}</strong><span className="metric-foot">Active course enrollments</span></div></article>
               <article className="metric-card accent"><span className="metric-card-icon">◔</span><div><span className="metric-label">Course progress</span><strong>{loading ? "—" : `${averageProgress}%`}</strong><span className="metric-foot">Average across learner progress</span></div></article>
                <article className="metric-card warm"><span className="metric-card-icon">!</span><div><span className="metric-label">Pending reviews</span><strong>{loading ? "—" : pendingSubmissions.length + pendingAssessmentAttempts.length}</strong><span className="metric-foot">Assignments and assessments awaiting review</span></div></article>
            </section>

            <section className="two-column" id="courses">
              <div className="panel course-panel">
                <div className="panel-heading"><div><p className="eyebrow">Your teaching scope</p><h2>Assigned courses</h2></div><span className="count-badge">{courseData.length}</span></div>
                {loading && <div className="state"><div className="spinner" /><div><strong>Loading assigned courses…</strong><p>Checking your institution-scoped teaching assignments.</p></div></div>}
                {!loading && courseData.length === 0 && <div className="state"><div className="state-icon">+</div><div><strong>No courses assigned yet</strong><p>Ask an institution administrator to assign a published course to your instructor account.</p></div></div>}
                {!loading && courseData.length > 0 && <div className="course-list">
                  {courseData.map((item) => {
                    const courseProgress = item.progress.map(({ progress }) => progress?.percentage).filter((value): value is number => typeof value === "number");
                    const average = courseProgress.length ? Math.round(courseProgress.reduce((sum, value) => sum + value, 0) / courseProgress.length) : 0;
                    const pending = item.submissions.filter(({ submission }) => submission.status === "SUBMITTED").length;
                    return (
                      <button className={`course-row ${selected?.course.id === item.course.id ? "selected" : ""}`} key={item.course.id} type="button" onClick={() => selectCourse(item.course.id)}>
                        <span className="course-mark">{item.course.code.slice(0, 2)}</span>
                        <span className="course-main"><strong>{item.course.title}</strong><small>{item.course.code} · {item.course.programme_name || "Assigned course"}</small><ProgressBar percentage={average} /></span>
                        <span className="course-side"><StatusPill status={item.course.status} /><small>{item.enrollments.length} learners</small><em className={pending > 0 ? "needs-review" : ""}>{pending > 0 ? `${pending} to review` : "No pending review"}</em></span>
                      </button>
                    );
                  })}
                </div>}
              </div>

              <div className="panel actions-panel">
                <div className="panel-heading"><div><p className="eyebrow">What needs attention</p><h2>Instructor actions</h2></div><span className="action-spark">✦</span></div>
                <div className="action-list">
                  <button className="action-row" type="button" onClick={() => pendingSubmissions[0] && selectCourse(pendingSubmissions[0].course.id, true)} disabled={pendingSubmissions.length === 0}>
                    <span className="action-icon review">✓</span><span><strong>Review submissions</strong><small>{pendingSubmissions.length ? `${pendingSubmissions.length} learner ${pendingSubmissions.length === 1 ? "submission" : "submissions"} waiting` : "Your review queue is clear"}</small></span><b>→</b>
                  </button>
                  <button className="action-row" type="button" onClick={() => document.getElementById("learners")?.scrollIntoView({ behavior: "smooth", block: "start" })} disabled={!selected}>
                    <span className="action-icon learners">♙</span><span><strong>Check learner progress</strong><small>{selected ? `${selected.enrollments.length} active learners in ${selected.course.title}` : "Select an assigned course first"}</small></span><b>→</b>
                  </button>
                  <button className="action-row" type="button" onClick={() => document.getElementById("assignments")?.scrollIntoView({ behavior: "smooth", block: "start" })} disabled={!selected}>
                    <span className="action-icon content">▦</span><span><strong>Manage course work</strong><small>{selected ? `${selected.assignments.length} assignment${selected.assignments.length === 1 ? "" : "s"} in this course` : "Select an assigned course first"}</small></span><b>→</b>
                  </button>
                  <button className="action-row" type="button" onClick={() => document.getElementById("assessments")?.scrollIntoView({ behavior: "smooth", block: "start" })} disabled={!selected}>
                    <span className="action-icon assessment">◇</span><span><strong>Open assessment studio</strong><small>{selected ? `${selected.assessments.length} assessment${selected.assessments.length === 1 ? "" : "s"} · ${selected.assessmentAttempts.filter(({ attempt }) => attempt.grading_status === "PENDING").length} awaiting grade` : "Select an assigned course first"}</small></span><b>→</b>
                  </button>
                </div>
                <div className="scope-note"><span>●</span> Data is limited to courses assigned to your instructor account.</div>
              </div>
            </section>

            <section className="panel detail-panel" id="learners">
              <div className="panel-heading detail-heading">
                 <div><p className="eyebrow">Selected course</p><h2>{selected?.course.title || "Learner roster & progress"}</h2><p className="panel-copy">{selected ? `${selected.course.code} · ${selected.enrollments.length} active learners` : "Select an assigned course to view its roster and progress."}</p></div>
                 {selected && <div className="course-actions"><StatusPill status={selected.course.status} /><button className="secondary-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing} aria-label={`Refresh roster for ${selected.course.title}`}><span className={refreshing ? "spin" : ""}>↻</span>{refreshing ? "Refreshing…" : "Refresh roster"}</button></div>}
              </div>
               {refreshing && selected && <div className="inline-state loading-state" role="status"><span className="mini-spinner" />Refreshing enrolled learners and progress…</div>}
              {!selected && !loading && <div className="state"><div className="state-icon">♙</div><div><strong>No learner roster to show</strong><p>Assigned course enrollments and progress will appear here.</p></div></div>}
               {selected?.rosterError && <div className="inline-alert error" role="alert"><div><strong>Unable to load the learner roster</strong><span>{selected.rosterError}</span></div><button className="text-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing}>Retry</button></div>}
               {selected && !selected.rosterError && selected.enrollments.length === 0 && <div className="state"><div className="state-icon">—</div><div><strong>No active learners yet</strong><p>There are no active enrollments in this assigned course.</p></div></div>}
               {selected && !selected.rosterError && selectedProgressErrors.length > 0 && <div className="inline-alert warning" role="status"><div><strong>Some progress data is unavailable</strong><span>{selectedProgressErrors.length} learner{selectedProgressErrors.length === 1 ? "" : "s"} could not be loaded. Refresh to try again.</span></div><button className="text-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing}>Retry</button></div>}
               {selected && !selected.rosterError && selected.enrollments.length > 0 && <div className="table-wrap">
                 <table>
                    <caption className="table-caption">{selected ? `Learner activity in ${selected.course.title}` : "Learner activity"}</caption>
                   <thead><tr><th>Learner</th><th>Completion</th><th>Lessons completed</th><th>Assessment progress</th><th>State</th></tr></thead>
                   <tbody>{selected.progress.map(({ enrollment, progress, error: progressError }) => (
                    <tr key={enrollment.id}>
                      <td><div className="learner-cell"><span className="learner-avatar">{learnerName(enrollment).slice(0, 1).toUpperCase()}</span><span><strong>{learnerName(enrollment)}</strong><small>{enrollment.learner_email || "Active enrollment"}</small></span></div></td>
                       <td className="progress-cell">{progress ? <><div><ProgressBar percentage={progress.percentage} /><strong>{progress.percentage}%</strong></div><small>Course completion</small></> : <span className="muted progress-error" title={progressError}>Progress unavailable</span>}</td>
                       <td>{progress ? <><strong className="table-value">{progress.lessons.completed}/{progress.lessons.total}</strong><small>completed</small></> : "—"}</td>
                       <td>{progress ? <><strong className="table-value">{progress.assessments.completed}/{progress.assessments.total}</strong><small>completed</small></> : "—"}</td>
                       <td>{progress ? <StatusPill status={progress.state} /> : <StatusPill status="NOT_STARTED" />}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>}
            </section>

             <section className="panel content-panel" id="content">
               <div className="panel-heading detail-heading">
                 <div><p className="eyebrow">Selected course</p><h2>Course content</h2><p className="panel-copy">{selected ? "Build the module, lesson, and resource hierarchy for this assigned course." : "Select an assigned course to manage its learning content."}</p></div>
                 {selected && <div className="content-heading-actions"><span className="count-badge">{selected.modules.length}</span><button className="primary-button small-button" type="button" onClick={() => openModuleEditor()} disabled={loading}>+ New module</button></div>}
               </div>
               {loading && <div className="state"><div className="spinner" /><div><strong>Loading course content…</strong><p>Reading the modules, lessons, and resources for your assigned courses.</p></div></div>}
               {!loading && !selected && <div className="state"><div className="state-icon">≡</div><div><strong>No course selected</strong><p>Assigned course content will appear here after you select a course.</p></div></div>}
               {!loading && selected?.structureError && <div className="state"><div className="state-icon error-icon">!</div><div><strong>Course content is unavailable</strong><p>{selected.structureError}</p><button className="text-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing}>Retry</button></div></div>}
               {moduleEditor && selected && <form className="content-editor" onSubmit={(event) => { event.preventDefault(); void saveModule(); }}>
                 <div className="editor-heading"><div><p className="eyebrow">{moduleEditor.id ? "Edit module" : "New module"}</p><h3>{moduleEditor.id ? "Update module details" : "Create a draft module"}</h3></div><button className="icon-button" type="button" onClick={() => setModuleEditor(null)} aria-label="Close module editor">×</button></div>
                 <div className="form-grid"><label>Title<input value={moduleEditor.title} onChange={(event) => setModuleEditor((current) => current && { ...current, title: event.target.value })} placeholder="e.g. Digital foundations" maxLength={180} required /></label><label>Sequence<input type="number" value={moduleEditor.sequence} onChange={(event) => setModuleEditor((current) => current && { ...current, sequence: event.target.value })} min="1" step="1" required /></label><label className="full-field">Description <span className="optional-label">(optional)</span><textarea value={moduleEditor.description} onChange={(event) => setModuleEditor((current) => current && { ...current, description: event.target.value })} placeholder="Describe what learners will cover." maxLength={2000} rows={3} /></label></div>
                 <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setModuleEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-module:${moduleEditor.id || "new"}`}>{busyAction === `save-module:${moduleEditor.id || "new"}` ? "Saving…" : moduleEditor.id ? "Save changes" : "Save draft"}</button></div>
               </form>}
               {lessonEditor && selected && <form className="content-editor" onSubmit={(event) => { event.preventDefault(); void saveLesson(); }}>
                 <div className="editor-heading"><div><p className="eyebrow">{lessonEditor.id ? "Edit lesson" : "New lesson"} · {lessonEditor.moduleTitle}</p><h3>{lessonEditor.id ? "Update lesson details" : "Create a draft lesson"}</h3></div><button className="icon-button" type="button" onClick={() => setLessonEditor(null)} aria-label="Close lesson editor">×</button></div>
                 <div className="form-grid"><label>Title<input value={lessonEditor.title} onChange={(event) => setLessonEditor((current) => current && { ...current, title: event.target.value })} placeholder="e.g. Working with files" maxLength={180} required /></label><label>Sequence<input type="number" value={lessonEditor.sequence} onChange={(event) => setLessonEditor((current) => current && { ...current, sequence: event.target.value })} min="1" step="1" required /></label><label>Estimated duration <span className="optional-label">(minutes)</span><input type="number" value={lessonEditor.estimatedDuration} onChange={(event) => setLessonEditor((current) => current && { ...current, estimatedDuration: event.target.value })} min="0" max="100000" step="1" placeholder="Optional" /></label><label className="full-field">Description <span className="optional-label">(optional)</span><textarea value={lessonEditor.description} onChange={(event) => setLessonEditor((current) => current && { ...current, description: event.target.value })} placeholder="Give learners context for this lesson." maxLength={2000} rows={3} /></label></div>
                 <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setLessonEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-lesson:${lessonEditor.id || "new"}`}>{busyAction === `save-lesson:${lessonEditor.id || "new"}` ? "Saving…" : lessonEditor.id ? "Save changes" : "Save draft"}</button></div>
               </form>}
               {resourceEditor && selected && <form className="content-editor" onSubmit={(event) => { event.preventDefault(); void saveResource(); }}>
                 <div className="editor-heading"><div><p className="eyebrow">{resourceEditor.id ? "Edit resource" : "New resource"} · {resourceEditor.lessonTitle}</p><h3>{resourceEditor.id ? "Update learning resource" : "Attach a draft resource"}</h3></div><button className="icon-button" type="button" onClick={() => setResourceEditor(null)} aria-label="Close resource editor">×</button></div>
                 <div className="form-grid"><label>Title<input value={resourceEditor.title} onChange={(event) => setResourceEditor((current) => current && { ...current, title: event.target.value })} placeholder="e.g. Download the practice guide" maxLength={180} required /></label><label>Resource type{resourceEditor.id ? <span className="readonly-field">{statusLabel(resourceEditor.resourceType)}</span> : <select value={resourceEditor.resourceType} onChange={(event) => setResourceEditor((current) => current && { ...current, resourceType: event.target.value, url: ["VIDEO", "LINK", "SCORM", "INTERACTIVE"].includes(event.target.value) ? current.url : "" })}>{resourceTypes.map((type) => <option value={type} key={type}>{statusLabel(type)}</option>)}</select>}</label><label className="full-field">URL {["VIDEO", "LINK", "SCORM", "INTERACTIVE"].includes(resourceEditor.resourceType) ? <span className="optional-label">(required)</span> : <span className="optional-label">(optional for document resources)</span>}<input type="url" value={resourceEditor.url} onChange={(event) => setResourceEditor((current) => current && { ...current, url: event.target.value })} placeholder="https://…" maxLength={2048} required={["VIDEO", "LINK", "SCORM", "INTERACTIVE"].includes(resourceEditor.resourceType)} /></label><label>Duration <span className="optional-label">(minutes)</span><input type="number" value={resourceEditor.duration} onChange={(event) => setResourceEditor((current) => current && { ...current, duration: event.target.value })} min="0" max="100000" step="1" placeholder="Optional" /></label><label>Sequence<input type="number" value={resourceEditor.sequence} onChange={(event) => setResourceEditor((current) => current && { ...current, sequence: event.target.value })} min="1" step="1" required /></label><label className="full-field">Managed file <span className="optional-label">(optional; PDF, document, presentation, or SCORM)</span><input type="file" accept={resourceEditor.resourceType === "SCORM" ? ".zip,.scorm" : resourceEditor.resourceType === "PDF" ? ".pdf" : resourceEditor.resourceType === "DOCUMENT" ? ".doc,.docx,.txt" : resourceEditor.resourceType === "PRESENTATION" ? ".ppt,.pptx" : undefined} onChange={(event) => setResourceEditor((current) => current && { ...current, file: event.target.files?.[0] })} /></label></div>
                 <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setResourceEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-resource:${resourceEditor.id || "new"}`}>{busyAction === `save-resource:${resourceEditor.id || "new"}` ? "Saving…" : resourceEditor.id ? "Save changes" : "Save draft"}</button></div>
               </form>}
               {!loading && selected && !selected.structureError && selected.modules.length === 0 && !moduleEditor && <div className="state compact"><div className="state-icon">+</div><div><strong>No modules available</strong><p>Create the first module to start building this assigned course.</p><button className="text-button" type="button" onClick={() => openModuleEditor()}>Create a module →</button></div></div>}
               {!loading && selected && !selected.structureError && selected.modules.length > 0 && <div className="module-list">
                 {selected.modules.map(({ module, lessons }) => (
                   <article className="module-card" key={module.id}>
                     <div className="module-heading"><div className="module-number">{String(module.sequence).padStart(2, "0")}</div><div className="module-title"><strong>{module.title}</strong><small>{module.description || `${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`}</small></div><StatusPill status={module.status} /><div className="content-actions"><button className="text-button" type="button" onClick={() => openModuleEditor(module)}>Edit</button>{module.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishModule(module)} disabled={busyAction === `publish-module:${module.id}`}>{busyAction === `publish-module:${module.id}` ? "Publishing…" : "Publish"}</button>}{module.status !== "ARCHIVED" && <button className="text-button danger-text" type="button" onClick={() => setModuleArchiveCandidate(module)}>Archive</button>}</div></div>
                     {moduleArchiveCandidate?.id === module.id && <div className="confirm-bar" role="alert"><div><strong>Archive this module?</strong><span>Its lessons and resources will no longer be part of active delivery.</span></div><div><button className="secondary-button small-button" type="button" onClick={() => setModuleArchiveCandidate(null)}>Cancel</button><button className="archive-button" type="button" onClick={() => void archiveModule(module)} disabled={busyAction === `archive-module:${module.id}`}>{busyAction === `archive-module:${module.id}` ? "Archiving…" : "Confirm archive"}</button></div></div>}
                     <div className="nested-toolbar"><span>{lessons.length} lesson{lessons.length === 1 ? "" : "s"}</span><button className="text-button strong" type="button" onClick={() => openLessonEditor(module)} disabled={module.status === "ARCHIVED"}>+ Add lesson</button></div>
                     {lessons.length === 0 && <div className="nested-state">No lessons in this module yet.</div>}
                     {lessons.length > 0 && <div className="lesson-list">{lessons.map(({ lesson, resources }) => (
                       <div className="lesson-row" key={lesson.id}>
                         <div className="lesson-title"><span className="lesson-icon">L</span><span><strong>{lesson.title}</strong><small>{lesson.description || `${resources.length} learning resource${resources.length === 1 ? "" : "s"}`}{lesson.estimated_duration ? ` · ${lesson.estimated_duration} min` : ""}</small></span></div><StatusPill status={lesson.status} /><div className="content-actions"><button className="text-button" type="button" onClick={() => openLessonEditor(module, lesson)}>Edit</button>{lesson.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishLesson(lesson)} disabled={busyAction === `publish-lesson:${lesson.id}`}>{busyAction === `publish-lesson:${lesson.id}` ? "Publishing…" : "Publish"}</button>}{lesson.status !== "ARCHIVED" && <button className="text-button danger-text" type="button" onClick={() => setLessonArchiveCandidate(lesson)}>Archive</button>}</div>
                         {lessonArchiveCandidate?.id === lesson.id && <div className="confirm-bar" role="alert"><div><strong>Archive this lesson?</strong><span>Learners will no longer see it in active course delivery.</span></div><div><button className="secondary-button small-button" type="button" onClick={() => setLessonArchiveCandidate(null)}>Cancel</button><button className="archive-button" type="button" onClick={() => void archiveLesson(lesson)} disabled={busyAction === `archive-lesson:${lesson.id}`}>{busyAction === `archive-lesson:${lesson.id}` ? "Archiving…" : "Confirm archive"}</button></div></div>}
                         <div className="resource-toolbar"><span>{resources.length} resource{resources.length === 1 ? "" : "s"}</span><button className="text-button strong" type="button" onClick={() => openResourceEditor(lesson)} disabled={lesson.status === "ARCHIVED"}>+ Add resource</button></div>
                         {resources.length > 0 && <div className="resource-list">{resources.map((resource) => { const href = resourceHref(resource); return <div className="resource-row" key={resource.id}><span className="resource-icon">↗</span><span><strong>{resource.title}</strong><small>{statusLabel(resource.resource_type)}{resource.duration ? ` · ${resource.duration} min` : ""}{resource.managed_file_name ? ` · ${resource.managed_file_name}` : ""}</small></span>{href ? <a href={href} target="_blank" rel="noreferrer">Open</a> : <span className="muted">No link</span>}<div className="content-actions"><button className="text-button" type="button" onClick={() => openResourceEditor(lesson, resource)}>Edit</button>{resource.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishResource(resource)} disabled={busyAction === `publish-resource:${resource.id}`}>{busyAction === `publish-resource:${resource.id}` ? "Publishing…" : "Publish"}</button>}{resource.status !== "ARCHIVED" && <button className="text-button danger-text" type="button" onClick={() => setResourceArchiveCandidate(resource)}>Archive</button>}</div>{resourceArchiveCandidate?.id === resource.id && <div className="confirm-bar" role="alert"><div><strong>Archive this resource?</strong><span>It will no longer be available to learners.</span></div><div><button className="secondary-button small-button" type="button" onClick={() => setResourceArchiveCandidate(null)}>Cancel</button><button className="archive-button" type="button" onClick={() => void archiveResource(resource)} disabled={busyAction === `archive-resource:${resource.id}`}>{busyAction === `archive-resource:${resource.id}` ? "Archiving…" : "Confirm archive"}</button></div></div>}</div>; })}</div>}
                         {resources.length === 0 && <div className="nested-state lesson-empty">No learning resources attached.</div>}
                       </div>
                     ))}</div>}
                   </article>
                 ))}
               </div>}
             </section>

             <section className="panel assignment-panel" id="assignments">
               <div className="panel-heading detail-heading">
                 <div><p className="eyebrow">Course delivery</p><h2>Assignment workspace</h2><p className="panel-copy">{selected ? "Create learner work, control its lifecycle, and review submissions without leaving the course view." : "Select a course to manage assignments."}</p></div>
                 {selected && <div className="assignment-heading-actions"><span className="count-badge">{selected.assignments.length}</span><button className="primary-button small-button" type="button" onClick={() => openAssignmentEditor()} disabled={loading || selected.modules.length === 0}>+ New assignment</button></div>}
               </div>
               {selected && selected.modules.length === 0 && !selected.structureError && <div className="workspace-note"><span>!</span> Add a course module before creating an assignment.</div>}
               {assignmentEditor && selected && <form className="assignment-editor" onSubmit={(event) => { event.preventDefault(); void saveAssignment(); }}>
                 <div className="editor-heading"><div><p className="eyebrow">{assignmentEditor.id ? "Edit assignment" : "New assignment"}</p><h3>{assignmentEditor.id ? "Update learner work" : "Create a draft assignment"}</h3></div><button className="icon-button" type="button" onClick={() => setAssignmentEditor(null)} aria-label="Close assignment editor">×</button></div>
                 <div className="form-grid">
                   <label>Title<input value={assignmentEditor.title} onChange={(event) => setAssignmentEditor((current) => current && { ...current, title: event.target.value })} placeholder="e.g. Build a responsive landing page" maxLength={180} required /></label>
                   <label>Maximum marks<input type="number" value={assignmentEditor.maxMarks} onChange={(event) => setAssignmentEditor((current) => current && { ...current, maxMarks: event.target.value })} min="0.01" max="100000" step="0.01" required /></label>
                   <label>Course module{assignmentEditor.id ? <span className="readonly-field">{assignmentEditor.moduleTitle}</span> : <select value={assignmentEditor.moduleId} onChange={(event) => setAssignmentEditor((current) => current && { ...current, moduleId: event.target.value, moduleTitle: selected.modules.find(({ module }) => module.id === event.target.value)?.module.title })} required><option value="" disabled>Select a module</option>{selected.modules.map(({ module }) => <option value={module.id} key={module.id}>{module.title}</option>)}</select>}</label>
                   <label>Due date <span className="optional-label">(optional)</span><input type="datetime-local" value={assignmentEditor.dueAt} onChange={(event) => setAssignmentEditor((current) => current && { ...current, dueAt: event.target.value })} /></label>
                   <label className="full-field">Description <span className="optional-label">(optional)</span><textarea value={assignmentEditor.description} onChange={(event) => setAssignmentEditor((current) => current && { ...current, description: event.target.value })} placeholder="Give learners a concise overview." maxLength={4000} rows={2} /></label>
                   <label className="full-field">Instructions<textarea value={assignmentEditor.instructions} onChange={(event) => setAssignmentEditor((current) => current && { ...current, instructions: event.target.value })} placeholder="Explain the work learners need to submit." maxLength={12000} rows={5} required /></label>
                 </div>
                 <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setAssignmentEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-assignment:${assignmentEditor.id || "new"}`}>{busyAction === `save-assignment:${assignmentEditor.id || "new"}` ? "Saving…" : assignmentEditor.id ? "Save changes" : "Save draft"}</button></div>
               </form>}
               {!loading && !selected && <div className="state compact"><div className="state-icon">A</div><div><strong>No course selected</strong><p>Select an assigned course to manage its assignments.</p></div></div>}
               {selected && !assignmentEditor && selected.assignments.length === 0 && <div className="state compact"><div className="state-icon">+</div><div><strong>No assignments in this course</strong><p>Create a draft assignment to start collecting learner work.</p></div></div>}
               {selected && selected.assignments.length > 0 && <div className="assignment-list">
                 {selected.assignments.map((assignment) => {
                   const assignmentSubmissions = selected.submissions.filter(({ submission }) => submission.assignment_id === assignment.id);
                   const pendingCount = assignmentSubmissions.filter(({ submission }) => submission.status === "SUBMITTED").length;
                   const expanded = expandedAssignmentId === assignment.id;
                   return <article className="assignment-card" key={assignment.id}>
                     <div className="assignment-card-main"><div className="assignment-title"><span className="assignment-icon">A</span><span><strong>{assignment.title}</strong><small>{assignment.module_title || "Course module"} · {assignment.max_marks} marks · {assignment.due_at ? `Due ${formatDate(assignment.due_at)}` : "No due date"}</small></span></div><div className="assignment-meta"><StatusPill status={assignment.status} /><small>{assignmentSubmissions.length} submission{assignmentSubmissions.length === 1 ? "" : "s"}</small></div><div className="assignment-actions">{assignment.status !== "ARCHIVED" && <button className="text-button" type="button" onClick={() => openAssignmentEditor(assignment)}>Edit</button>}{assignment.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishAssignment(assignment)} disabled={busyAction === `publish:${assignment.id}`}>{busyAction === `publish:${assignment.id}` ? "Publishing…" : "Publish"}</button>}{assignment.status !== "ARCHIVED" && <button className="text-button danger-text" type="button" onClick={() => setArchiveCandidate(assignment)} disabled={busyAction === `archive:${assignment.id}`}>Archive</button>}</div></div>
                     <div className="assignment-description">{assignment.description || assignment.instructions}</div>
                     <div className="assignment-footer"><button className="submission-toggle" type="button" onClick={() => setExpandedAssignmentId(expanded ? "" : assignment.id)}>{expanded ? "Hide submissions" : "View submissions"} <span>{assignmentSubmissions.length}</span></button>{pendingCount > 0 && <button className="text-button strong" type="button" onClick={() => selectCourse(selected.course.id, true)}>{pendingCount} to review</button>}</div>
                     {archiveCandidate?.id === assignment.id && <div className="confirm-bar" role="alert"><div><strong>Archive this assignment?</strong><span>Learners will no longer be able to submit new work.</span></div><div><button className="secondary-button small-button" type="button" onClick={() => setArchiveCandidate(null)}>Cancel</button><button className="archive-button" type="button" onClick={() => void archiveAssignment(assignment)} disabled={busyAction === `archive:${assignment.id}`}>{busyAction === `archive:${assignment.id}` ? "Archiving…" : "Confirm archive"}</button></div></div>}
                     {expanded && <div className="assignment-submissions">{assignmentSubmissions.length === 0 && <div className="nested-state">No learner submissions yet.</div>}{assignmentSubmissions.map(({ submission }) => <div className="submission-detail" key={submission.id}><div className="submission-detail-heading"><div className="learner-cell"><span className="learner-avatar">{learnerName(submission).slice(0, 1).toUpperCase()}</span><span><strong>{learnerName(submission)}</strong><small>{submission.learner_email || "Learner"} · Submitted {formatDate(submission.submitted_at, true)}{submission.is_late ? " · Late" : ""}</small></span></div><StatusPill status={submission.status} /></div><p>{submission.submission_text}</p>{submission.attachment_url && <a href={submission.attachment_url} target="_blank" rel="noreferrer">Open learner attachment ↗</a>}{submission.grade !== null && submission.grade !== undefined && <div className="graded-summary"><strong>{submission.grade}/{assignment.max_marks}</strong>{submission.feedback && <span>{submission.feedback}</span>}</div>}{submission.status === "SUBMITTED" && <button className="text-button strong" type="button" onClick={() => selectCourse(selected.course.id, true)}>Review and grade below ↓</button>}</div>)}</div>}
                   </article>;
                 })}
               </div>}
             </section>

             <section className="panel assessment-panel" id="assessments">
               <div className="panel-heading detail-heading">
                 <div><p className="eyebrow">Evaluation studio</p><h2>Assessment workspace</h2><p className="panel-copy">{selected ? "Author assessments, manage question options, and review submitted attempts for this assigned course." : "Select a course to manage assessments."}</p></div>
                 {selected && <div className="assessment-heading-actions"><span className="count-badge">{selected.assessments.length}</span><button className="primary-button small-button" type="button" onClick={() => openAssessmentEditor()} disabled={loading || selected.modules.length === 0}>+ New assessment</button></div>}
               </div>
               {selected?.assessmentError && <div className="inline-alert error" role="alert"><div><strong>Assessments are unavailable</strong><span>{selected.assessmentError}</span></div><button className="text-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing}>Retry</button></div>}
               {selected && selected.modules.length === 0 && !selected.structureError && <div className="workspace-note"><span>!</span> Add a course module before creating an assessment.</div>}
               {loading && <div className="state"><div className="spinner" /><div><strong>Loading assessments…</strong><p>Reading assessment settings, questions, and submitted-attempt summaries for your assigned courses.</p></div></div>}
               {assessmentEditor && selected && <form className="assessment-editor" onSubmit={(event) => { event.preventDefault(); void saveAssessment(); }}>
                 <div className="editor-heading"><div><p className="eyebrow">{assessmentEditor.id ? "Edit assessment" : "New assessment"}</p><h3>{assessmentEditor.id ? "Update assessment settings" : "Create a draft assessment"}</h3></div><button className="icon-button" type="button" onClick={() => setAssessmentEditor(null)} aria-label="Close assessment editor">×</button></div>
                 <div className="form-grid assessment-form-grid">
                   <label>Title<input value={assessmentEditor.title} onChange={(event) => setAssessmentEditor((current) => current && { ...current, title: event.target.value })} placeholder="e.g. Portfolio review" maxLength={180} required /></label>
                   <label>Assessment type{assessmentEditor.id ? <span className="readonly-field">{statusLabel(assessmentEditor.assessmentType)}</span> : <select value={assessmentEditor.assessmentType} onChange={(event) => setAssessmentEditor((current) => current && { ...current, assessmentType: event.target.value })}>{assessmentTypes.map((type) => <option value={type} key={type}>{statusLabel(type)}</option>)}</select>}</label>
                   <label>Course module{assessmentEditor.id ? <span className="readonly-field">{assessmentEditor.moduleTitle}</span> : <select value={assessmentEditor.moduleId} onChange={(event) => setAssessmentEditor((current) => current && { ...current, moduleId: event.target.value, moduleTitle: selected.modules.find(({ module }) => module.id === event.target.value)?.module.title })} required><option value="" disabled>Select a module</option>{selected.modules.map(({ module }) => <option value={module.id} key={module.id}>{module.title}</option>)}</select>}</label>
                   <label>Total marks <span className="optional-label">(optional)</span><input type="number" value={assessmentEditor.totalMarks} onChange={(event) => setAssessmentEditor((current) => current && { ...current, totalMarks: event.target.value })} min="0" max="100000" step="0.01" placeholder="Sum of questions" /></label>
                   <label>Passing marks <span className="optional-label">(optional)</span><input type="number" value={assessmentEditor.passingMarks} onChange={(event) => setAssessmentEditor((current) => current && { ...current, passingMarks: event.target.value })} min="0" max="100000" step="0.01" placeholder="Required score" /></label>
                   <label>Duration <span className="optional-label">(minutes)</span><input type="number" value={assessmentEditor.durationMinutes} onChange={(event) => setAssessmentEditor((current) => current && { ...current, durationMinutes: event.target.value })} min="1" max="1440" step="1" placeholder="Optional" /></label>
                   <label>Attempt limit <span className="optional-label">(optional)</span><input type="number" value={assessmentEditor.attemptLimit} onChange={(event) => setAssessmentEditor((current) => current && { ...current, attemptLimit: event.target.value })} min="1" max="100" step="1" placeholder="Unlimited" /></label>
                   <label className="full-field">Description <span className="optional-label">(optional)</span><textarea value={assessmentEditor.description} onChange={(event) => setAssessmentEditor((current) => current && { ...current, description: event.target.value })} placeholder="Give learners a concise overview." maxLength={4000} rows={2} /></label>
                 </div>
                 <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setAssessmentEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-assessment:${assessmentEditor.id || "new"}`}>{busyAction === `save-assessment:${assessmentEditor.id || "new"}` ? "Saving…" : assessmentEditor.id ? "Save changes" : "Save draft"}</button></div>
               </form>}
               {!loading && !selected && <div className="state compact"><div className="state-icon">◇</div><div><strong>No course selected</strong><p>Select an assigned course to manage assessments.</p></div></div>}
               {selected && !assessmentEditor && selected.assessments.length === 0 && <div className="state compact"><div className="state-icon">+</div><div><strong>No assessments in this course</strong><p>Create a draft assessment, then add questions before publishing it.</p></div></div>}
               {selected && selected.assessments.length > 0 && <div className="assessment-list">
                 {selected.assessments.map((assessment) => {
                   const questions = assessmentQuestions[assessment.id] || [];
                   const attempts = selectedAssessmentAttempts.filter(({ assessment: item }) => item.id === assessment.id).map(({ attempt }) => attempt);
                   const expanded = expandedAssessmentId === assessment.id;
                   const questionEditorForAssessment = questionEditor?.assessmentId === assessment.id;
                   return <article className="assessment-card" key={assessment.id}>
                     <div className="assessment-card-main">
                       <div className="assessment-title"><span className="assessment-icon">◇</span><span><strong>{assessment.title}</strong><small>{assessment.module_title || "Course module"} · {statusLabel(assessment.assessment_type)}{assessment.total_marks !== null && assessment.total_marks !== undefined ? ` · ${assessment.total_marks} marks` : " · Marks from questions"}</small></span></div>
                       <div className="assessment-meta"><StatusPill status={assessment.status} /><small>{attempts.length} submitted attempt{attempts.length === 1 ? "" : "s"}</small>{assessment.passing_marks !== null && assessment.passing_marks !== undefined && <small>Pass: {assessment.passing_marks}</small>}</div>
                       <div className="assessment-actions">{assessment.status !== "ARCHIVED" && <button className="text-button" type="button" onClick={() => openAssessmentEditor(assessment)}>Edit</button>}{assessment.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishAssessment(assessment)} disabled={busyAction === `publish-assessment:${assessment.id}`}>{busyAction === `publish-assessment:${assessment.id}` ? "Publishing…" : "Publish"}</button>}{assessment.status !== "ARCHIVED" && <button className="text-button danger-text" type="button" onClick={() => setAssessmentArchiveCandidate(assessment)}>Archive</button>}</div>
                     </div>
                     <div className="assessment-description">{assessment.description || "Add questions and publish this assessment when it is ready for learners."}</div>
                     <div className="assessment-footer"><button className="submission-toggle" type="button" onClick={() => { setExpandedAssessmentId(expanded ? "" : assessment.id); if (!expanded) void loadAssessmentQuestions(assessment); }}>{expanded ? "Hide assessment details" : "Open assessment details"} <span>{questions.length} Q</span></button>{attempts.length > 0 && <span className="assessment-attempt-summary">{attempts.filter((attempt) => attempt.grading_status === "PENDING").length} awaiting manual grade</span>}</div>
                     {assessmentArchiveCandidate?.id === assessment.id && <div className="confirm-bar" role="alert"><div><strong>Archive this assessment?</strong><span>It will no longer be available for new learner attempts.</span></div><div><button className="secondary-button small-button" type="button" onClick={() => setAssessmentArchiveCandidate(null)}>Cancel</button><button className="archive-button" type="button" onClick={() => void archiveAssessment(assessment)} disabled={busyAction === `archive-assessment:${assessment.id}`}>{busyAction === `archive-assessment:${assessment.id}` ? "Archiving…" : "Confirm archive"}</button></div></div>}
                     {expanded && <div className="assessment-details">
                       <div className="assessment-detail-columns">
                         <div className="question-bank">
                           <div className="subsection-heading"><div><p className="eyebrow">Question bank</p><h3>{questions.length} question{questions.length === 1 ? "" : "s"}</h3></div>{assessment.status === "DRAFT" && <button className="secondary-button small-button" type="button" onClick={() => openQuestionEditor(assessment)}>+ Add question</button>}</div>
                           {assessmentQuestionLoading === assessment.id && <div className="nested-state loading-inline"><span className="mini-spinner" />Loading questions…</div>}
                           {assessmentQuestionLoading !== assessment.id && questions.length === 0 && <div className="nested-state">No active questions yet. Add at least one before publishing.</div>}
                           {questions.map((question) => <div className="question-card" key={question.id}><div className="question-heading"><div className="question-number">{String(question.sequence).padStart(2, "0")}</div><div><strong>{question.prompt}</strong><small>{statusLabel(question.question_type)} · {question.marks} marks</small></div><div className="question-actions">{assessment.status === "DRAFT" && <><button className="text-button" type="button" onClick={() => openQuestionEditor(assessment, question)}>Edit</button><button className="text-button danger-text" type="button" onClick={() => setQuestionArchiveCandidate(question)}>Archive</button></>}</div></div>{question.options.length > 0 && <div className="option-list">{question.options.map((option) => <div className="option-row" key={option.id || option.value}><span className={`option-marker ${(option.is_correct ?? option.isCorrect) ? "correct" : ""}`}>{(option.is_correct ?? option.isCorrect) ? "✓" : "○"}</span><span>{option.label}</span>{(option.is_correct ?? option.isCorrect) && <em>Correct</em>}</div>)}</div>}{questionArchiveCandidate?.id === question.id && <div className="question-confirm"><span>Archive this question?</span><button className="text-button" type="button" onClick={() => setQuestionArchiveCandidate(null)}>Cancel</button><button className="text-button danger-text" type="button" onClick={() => void archiveQuestion(question)} disabled={busyAction === `archive-question:${question.id}`}>{busyAction === `archive-question:${question.id}` ? "Archiving…" : "Confirm"}</button></div>}</div>)}
                           {questionEditorForAssessment && <form className="question-editor" onSubmit={(event) => { event.preventDefault(); void saveQuestion(); }}><div className="editor-heading"><div><p className="eyebrow">{questionEditor.id ? "Edit question" : "New question"}</p><h3>{questionEditor.id ? "Update prompt and options" : "Add a question"}</h3></div><button className="icon-button" type="button" onClick={() => setQuestionEditor(null)} aria-label="Close question editor">×</button></div><div className="form-grid"><label className="full-field">Prompt<textarea value={questionEditor.prompt} onChange={(event) => setQuestionEditor((current) => current && { ...current, prompt: event.target.value })} maxLength={2000} rows={3} required /></label><label>Question type{questionEditor.id ? <span className="readonly-field">{statusLabel(questionEditor.questionType)}</span> : <select value={questionEditor.questionType} onChange={(event) => updateQuestionType(event.target.value)}>{questionTypes.map((type) => <option value={type} key={type}>{statusLabel(type)}</option>)}</select>}</label><label>Marks<input type="number" value={questionEditor.marks} onChange={(event) => setQuestionEditor((current) => current && { ...current, marks: event.target.value })} min="0.01" max="100000" step="0.01" required /></label><label>Sequence<input type="number" value={questionEditor.sequence} onChange={(event) => setQuestionEditor((current) => current && { ...current, sequence: event.target.value })} min="1" step="1" required /></label></div><div className="options-editor"><div className="subsection-heading"><div><p className="eyebrow">Answer options</p><h4>Mark the correct answer</h4></div>{!["TRUE_FALSE", "SHORT_TEXT", "NUMERIC"].includes(questionEditor.questionType) && <button className="text-button strong" type="button" onClick={addQuestionOption}>+ Add option</button>}</div>{questionEditor.options.map((option, index) => <div className="option-edit-row" key={`${option.id || "new"}-${index}`}><button className={`correct-toggle ${Boolean(option.isCorrect ?? option.is_correct) ? "selected" : ""}`} type="button" onClick={() => toggleOptionCorrect(index)} aria-label={`Mark option ${index + 1} correct`}>{Boolean(option.isCorrect ?? option.is_correct) ? "✓" : "○"}</button><input value={option.value} onChange={(event) => updateQuestionOption(index, "value", event.target.value)} placeholder="Stored value" maxLength={300} required /><input value={option.label} onChange={(event) => updateQuestionOption(index, "label", event.target.value)} placeholder="Learner-facing label" maxLength={300} required /><button className="icon-button compact-icon" type="button" onClick={() => removeQuestionOption(index)} disabled={questionEditor.options.length <= (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(questionEditor.questionType) ? 2 : 1)} aria-label="Remove option">×</button></div>)}</div><div className="editor-actions"><button className="secondary-button" type="button" onClick={() => setQuestionEditor(null)}>Cancel</button><button className="primary-button" type="submit" disabled={busyAction === `save-question:${questionEditor.id || "new"}`}>{busyAction === `save-question:${questionEditor.id || "new"}` ? "Saving…" : questionEditor.id ? "Save question" : "Add question"}</button></div></form>}
                         </div>
                         <div className="attempt-bank">
                           <div className="subsection-heading"><div><p className="eyebrow">Submitted attempts</p><h3>{attempts.length} attempt{attempts.length === 1 ? "" : "s"}</h3></div><span className="attempts-caption">Newest first</span></div>
                           {attempts.length === 0 && <div className="nested-state">No submitted attempts for this assessment yet.</div>}
                           {attempts.map((attempt) => { const detail = assessmentDetails[attempt.id]; const draft = attemptGradeDrafts[attempt.id]; const manual = ["PROJECT", "VIVA", "PRACTICAL"].includes(assessment.assessment_type); const attemptExpanded = Boolean(detail); return <div className="attempt-card" key={attempt.id}><div className="attempt-heading"><div className="learner-cell"><span className="learner-avatar">{learnerName(attempt).slice(0, 1).toUpperCase()}</span><span><strong>{learnerName(attempt)}</strong><small>{attempt.learner_email || "Learner"} · Attempt {attempt.attempt_number} · {formatDate(attempt.submitted_at, true)}</small></span></div><div className="attempt-result"><StatusPill status={attempt.grading_status} />{attempt.score !== null && attempt.score !== undefined && <strong>{attempt.score}/{attempt.max_score ?? "—"}</strong>}{attempt.passed !== null && attempt.passed !== undefined && <span className={`outcome-badge ${attempt.passed ? "passed" : "not-passed"}`}>{attempt.passed ? "Passed" : "Not passed"}</span>}</div></div><div className="attempt-footer">{attempt.grading_feedback && <span className="attempt-feedback">{attempt.grading_feedback}</span>}<button className="text-button strong" type="button" onClick={() => { if (attemptExpanded) { setAssessmentDetails((current) => { const next = { ...current }; delete next[attempt.id]; return next; }); } else void loadAttemptDetail(attempt); }}>{assessmentDetailLoading === attempt.id ? "Loading…" : attemptExpanded ? "Hide answers" : manual && attempt.grading_status === "PENDING" ? "Review and grade" : "View answers"}</button></div>{detail && <div className="attempt-detail">{detail.questions.map((question) => { const answer = detail.answers.find((item) => item.question_id === question.id); const grade = draft?.grades[question.id] ?? String(answer?.awarded_marks ?? 0); return <div className="attempt-question" key={question.id}><div><strong>{question.prompt}</strong><small>Answer: {answerText(answer?.answer_json)} · Max {question.marks}</small></div>{manual && attempt.grading_status === "PENDING" && draft ? <input aria-label={`Marks for ${question.prompt}`} type="number" min="0" max={question.marks} step="0.01" value={grade} onChange={(event) => setAttemptGradeDrafts((current) => ({ ...current, [attempt.id]: { ...draft, grades: { ...draft.grades, [question.id]: event.target.value } } }))} /> : <span className="awarded-mark">{answer?.awarded_marks ?? 0}/{question.marks}</span>}</div>})}{manual && attempt.grading_status === "PENDING" && draft && <div className="attempt-grade-form"><label>Overall feedback<textarea value={draft.feedback} onChange={(event) => setAttemptGradeDrafts((current) => ({ ...current, [attempt.id]: { ...draft, feedback: event.target.value } }))} maxLength={10000} rows={3} placeholder="Share feedback with the learner." /></label><button className="primary-button small-button" type="button" onClick={() => void gradeAttempt(attempt)} disabled={busyAction === `grade-attempt:${attempt.id}`}>{busyAction === `grade-attempt:${attempt.id}` ? "Saving grade…" : "Save grade & feedback"}</button></div>}</div>}</div>; })}
                         </div>
                       </div>
                     </div>}
                   </article>;
                 })}
               </div>}
             </section>

            <section className="panel submissions-panel" id="submissions">
              <div className="panel-heading detail-heading"><div><p className="eyebrow">Review queue</p><h2>Pending submissions</h2><p className="panel-copy">Read learner work, leave feedback, and record a grade against the assignment maximum.</p></div><span className="count-badge warm-badge">{pendingSubmissions.length}</span></div>
              {pendingSubmissions.length === 0 && <div className="state"><div className="state-icon success-icon">✓</div><div><strong>Your submission queue is clear</strong><p>New learner submissions will appear here as soon as they are received.</p></div></div>}
              {pendingSubmissions.length > 0 && <div className="submission-list">
                {pendingSubmissions.map(({ course, assignment, submission }) => {
                  const draft = gradeDrafts[submission.id] || { grade: "", feedback: "" };
                  const busy = busyAction === `grade:${submission.id}`;
                  return <article className="submission-card" key={submission.id}><div className="submission-heading"><div className="learner-cell"><span className="learner-avatar">{learnerName(submission).slice(0, 1).toUpperCase()}</span><span><strong>{learnerName(submission)}</strong><small>{submission.learner_email || "Learner"} · Submitted {formatDate(submission.submitted_at, true)}{submission.is_late ? " · Late" : ""}</small></span></div><div className="submission-course"><strong>{assignment.title}</strong><small>{course.title} · Max {assignment.max_marks} marks</small></div></div><div className="submission-body"><p>{submission.submission_text}</p>{submission.attachment_url && <a href={submission.attachment_url} target="_blank" rel="noreferrer">Open learner attachment ↗</a>}</div><div className="grade-bar"><label>Grade<input aria-label={`Grade for ${learnerName(submission)}`} inputMode="decimal" min="0" max={assignment.max_marks} step="0.01" type="number" value={draft.grade} onChange={(event) => setGradeDrafts((current) => ({ ...current, [submission.id]: { ...draft, grade: event.target.value } }))} placeholder={`0–${assignment.max_marks}`} /></label><label className="feedback-field">Feedback<input aria-label={`Feedback for ${learnerName(submission)}`} value={draft.feedback} onChange={(event) => setGradeDrafts((current) => ({ ...current, [submission.id]: { ...draft, feedback: event.target.value } }))} placeholder="Add feedback for the learner (optional)" /></label><button className="primary-button small-button" type="button" onClick={() => void gradeSubmission(assignment, submission)} disabled={busy}>{busy ? "Saving…" : "Save grade"}</button></div></article>;
                })}
              </div>}
            </section>
          </div>
        </section>
      </div>

      <style jsx global>{`
         :root { font-family: "Avenir Next", "Segoe UI", Arial, sans-serif; color: #173450; background: #f6f9fd; font-synthesis: none; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; min-width: 320px; line-height: 1.45; }
        h1, h2, h3, h4, h5, h6 { line-height: 1.1; }
        button, input { font: inherit; }
        button { cursor: pointer; }
        button:disabled { cursor: not-allowed; opacity: .52; }
        .portal-shell { min-height: 100vh; background: #f6f9fd; }
        .portal-grid { display: flex; min-height: 100vh; }
        .sidebar { width: 252px; flex: 0 0 252px; display: flex; flex-direction: column; padding: 29px 17px 19px; color: #d8e8f8; background: linear-gradient(165deg, #092a50, #073461 58%, #062c53); }
        .brand { display: flex; align-items: center; gap: 11px; padding: 0 10px; color: #fff; }
        .brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: #083260; background: #79ddcf; font-size: 17px; font-weight: 800; }
        .brand strong { display: block; font-size: 16px; letter-spacing: .08em; }
        .brand small { display: block; margin-top: 2px; color: #8eafd0; font-size: 8px; font-weight: 700; letter-spacing: .08em; }
        .sidebar-label { margin: 46px 12px 11px; color: #7899bc; font-size: 10px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
        .nav-list { display: grid; gap: 4px; }
        .nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 12px; border-radius: 9px; color: #b8cee5; font-size: 12px; font-weight: 600; text-decoration: none; }
        .nav-item:hover, .nav-item.active { color: #fff; background: #ffffff16; }
        .nav-item.active { box-shadow: inset 3px 0 #70d8cf; }
        .nav-icon { display: inline-grid; place-items: center; width: 19px; color: #83a6c8; font-size: 15px; }
        .nav-item.active .nav-icon { color: #79ddcf; }
        .nav-item b { display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: auto; border-radius: 9px; color: #094368; background: #79ddcf; font-size: 9px; }
        .sidebar-foot { display: flex; align-items: center; gap: 9px; margin-top: auto; padding: 16px 8px 0; border-top: 1px solid #ffffff17; }
        .sidebar-foot .avatar { display: grid; place-items: center; width: 31px; height: 31px; border-radius: 50%; color: #fff; background: #376d99; font-size: 11px; font-weight: 800; }
        .sidebar-foot strong, .sidebar-foot span { display: block; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sidebar-foot strong { color: #eaf4ff; font-size: 11px; }
        .sidebar-foot span { margin-top: 3px; color: #7f9fbe; font-size: 9px; }
        .workspace { flex: 1; min-width: 0; }
        .topbar { display: flex; align-items: center; justify-content: flex-end; height: 72px; padding: 0 5.2%; border-bottom: 1px solid #e5ecf4; background: #fff; }
        .mobile-brand { display: none; align-items: center; gap: 9px; color: #103a67; font-size: 15px; }
        .mobile-brand .brand-mark { width: 29px; height: 29px; border-radius: 8px; font-size: 14px; }
        .topbar-right { display: flex; align-items: center; gap: 24px; }
        .live-label { display: flex; align-items: center; gap: 8px; color: #68809b; font-size: 11px; font-weight: 600; }
        .live-label i { width: 7px; height: 7px; border-radius: 50%; background: #39bd91; }
        .help-link { padding: 0; border: 0; color: #0a5da2; background: transparent; font-size: 11px; font-weight: 700; }
        .content { width: min(1320px, 100%); margin: 0 auto; padding: 46px 5.2% 60px; }
        .page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
        .eyebrow { margin: 0; color: #3e8b9a; font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
        h1, h2, p { margin: 0; }
        h1 { margin-top: 8px; color: #102d53; font-size: clamp(28px, 3vw, 38px); letter-spacing: -.045em; }
        .intro { max-width: 620px; margin-top: 10px; color: #71829a; font-size: 13px; line-height: 1.5; }
        .primary-button, .secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 41px; padding: 0 17px; border: 1px solid transparent; border-radius: 8px; font-size: 12px; font-weight: 800; transition: .18s ease; }
        .primary-button { color: #07335c; background: #78dcd0; box-shadow: 0 8px 18px #78dcd044; }
        .primary-button:hover:not(:disabled) { background: #65d0c3; transform: translateY(-1px); }
        .primary-button span { font-size: 18px; font-weight: 500; line-height: 0; }
        .secondary-button { color: #55708d; border-color: #dbe6f0; background: #fff; }
        .secondary-button:hover:not(:disabled) { border-color: #aac5dd; color: #173e66; }
        .small-button { min-height: 36px; padding: 0 13px; white-space: nowrap; }
        .spin { animation: spin .8s linear infinite; }
        .alert { position: relative; display: flex; align-items: center; gap: 9px; margin-top: 21px; padding: 12px 39px 12px 14px; border-radius: 8px; font-size: 11px; }
        .alert strong { font-size: 11px; }
        .alert span { line-height: 1.5; }
        .alert button { position: absolute; top: 8px; right: 12px; padding: 0; border: 0; background: transparent; font-size: 19px; }
        .alert.error { color: #9d605c; border: 1px solid #f2d8d0; background: #fff6f3; }
        .alert.error button { color: #9d605c; }
        .alert.success { color: #267a6d; border: 1px solid #c8ebe2; background: #effcf8; }
        .alert.success button { color: #267a6d; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; margin-top: 31px; }
        .metric-card { min-height: 111px; padding: 17px 19px; border: 1px solid #e4ebf3; border-radius: 10px; background: #fff; box-shadow: 0 6px 22px #1a4c7710; }
        .metric-card.accent { border-color: #d9eee9; background: linear-gradient(145deg, #fff, #f2fcfa); }
        .metric-card.warm { border-color: #f0e4d3; background: linear-gradient(145deg, #fff, #fffaf3); }
        .metric-label, .metric-foot { display: block; color: #8496ab; font-size: 10px; font-weight: 700; }
        .metric-card strong { display: block; margin: 8px 0 4px; color: #18385e; font-size: 26px; letter-spacing: -.04em; }
        .metric-card.accent strong { color: #2b9b7e; }
        .metric-card.warm strong { color: #ca8a38; }
        .metric-foot { color: #a1afbd; font-size: 9px; font-weight: 500; }
        .two-column { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(330px, 1fr); gap: 18px; margin-top: 22px; }
        .panel { overflow: hidden; border: 1px solid #e1e9f2; border-radius: 11px; background: #fff; box-shadow: 0 8px 26px #1a4c770d; }
        .panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 22px 24px 19px; border-bottom: 1px solid #edf1f6; }
        .panel-heading h2 { margin-top: 7px; color: #18385e; font-size: 17px; letter-spacing: -.03em; }
        .panel-copy { margin-top: 7px; color: #8293a5; font-size: 11px; line-height: 1.5; }
        .count-badge { display: grid; place-items: center; min-width: 31px; height: 31px; padding: 0 9px; border-radius: 9px; color: #238877; background: #eaf9f5; font-size: 12px; font-weight: 800; }
        .warm-badge { color: #ad7835; background: #fff4e1; }
        .course-list { padding: 7px 0; }
        .course-row { display: grid; grid-template-columns: 39px minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; padding: 13px 24px; border: 0; border-bottom: 1px solid #edf1f6; color: inherit; background: #fff; text-align: left; }
        .course-row:last-child { border-bottom: 0; }
        .course-row:hover, .course-row.selected { background: #f8fcfd; }
        .course-row.selected { box-shadow: inset 3px 0 #4db8aa; }
        .course-mark { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; color: #177e91; background: #e1f5f2; font-size: 10px; font-weight: 800; letter-spacing: .04em; }
        .course-main { min-width: 0; }
        .course-main strong, .course-main small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .course-main strong { color: #1b426c; font-size: 12px; }
        .course-main small { margin: 4px 0 8px; color: #9aa9b8; font-size: 9px; }
        .course-side { display: grid; justify-items: end; gap: 5px; min-width: 93px; }
        .course-side small, .course-side em { color: #8799aa; font-size: 9px; font-style: normal; }
        .course-side em { color: #ba8138; font-weight: 700; }
        .progress-track { width: 100%; height: 7px; overflow: hidden; border-radius: 999px; background: #e6edf3; }
        .progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #55b9ab, #2d9b8b); transition: width .25s ease; }
        .status-pill { display: inline-flex; align-items: center; gap: 5px; width: max-content; padding: 5px 8px; border-radius: 100px; color: #6d8296; background: #eef2f5; font-size: 9px; font-weight: 800; white-space: nowrap; }
        .status-pill > span { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .status-pill.published, .status-pill.completed, .status-pill.graded { color: #299674; background: #e5f7f0; }
        .status-pill.draft, .status-pill.pending { color: #bd8138; background: #fff4e1; }
        .status-pill.in_progress { color: #347e9d; background: #e9f5fb; }
        .status-pill.archived, .status-pill.not_started { color: #8292a2; background: #eef2f5; }
        .action-list { padding: 7px 0; }
        .action-row { display: grid; grid-template-columns: 35px minmax(0, 1fr) 16px; align-items: center; gap: 11px; width: 100%; padding: 14px 24px; border: 0; border-bottom: 1px solid #edf1f6; color: inherit; background: #fff; text-align: left; }
        .action-row:last-child { border-bottom: 0; }
        .action-row:hover:not(:disabled) { background: #fbfdff; }
        .action-row > span:nth-child(2) strong, .action-row > span:nth-child(2) small { display: block; }
        .action-row strong { color: #315575; font-size: 11px; }
        .action-row small { margin-top: 4px; color: #92a2b1; font-size: 9px; }
        .action-row > b { color: #6ca99f; font-size: 16px; font-weight: 500; }
        .action-icon { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 9px; font-size: 15px; font-weight: 800; }
        .action-icon.review { color: #25846f; background: #e4f7f1; }
        .action-icon.learners { color: #347e9d; background: #e8f4fb; }
        .action-icon.content { color: #a67431; background: #fff2de; }
        .action-spark { color: #55b5a8; font-size: 21px; }
        .scope-note { display: flex; align-items: center; gap: 6px; margin: 2px 24px 20px; color: #8699ac; font-size: 9px; }
        .scope-note span { color: #2eae8b; font-size: 12px; }
         .detail-panel, .content-panel, .assignment-panel, .submissions-panel { margin-top: 22px; scroll-margin-top: 20px; }
        .detail-heading { align-items: center; }
        .course-actions { display: flex; align-items: center; gap: 12px; }
         .readonly-badge { padding: 6px 9px; border: 1px solid #cfe8e4; border-radius: 6px; color: #358b83; background: #eefaf8; font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
          .content-heading-actions, .content-actions { display: flex; align-items: center; gap: 8px; }
          .content-actions { flex-wrap: wrap; justify-content: flex-end; }
          .content-editor { margin: 17px 24px 0; padding: 18px; border: 1px solid #cfe8e4; border-radius: 10px; background: linear-gradient(145deg, #fbfffe, #f5fbfc); }
          .nested-toolbar, .resource-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #92a2b1; font-size: 9px; font-weight: 700; }
          .nested-toolbar { padding: 10px 16px 8px 58px; border-bottom: 1px solid #edf1f6; }
          .resource-toolbar { grid-column: 1 / -1; margin: 1px 0 0 34px; padding-top: 8px; border-top: 1px dashed #e5f1ef; }
          .resource-row > .content-actions { flex: 0 0 auto; }
        .state { display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 190px; padding: 30px; color: #70849a; }
        .state.compact { min-height: 145px; justify-content: flex-start; }
        .state strong { display: block; color: #244669; font-size: 12px; }
        .state p { max-width: 390px; margin-top: 7px; font-size: 10px; line-height: 1.5; }
        .state-icon { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border-radius: 50%; color: #197d83; background: #e5f7f4; font-size: 17px; font-weight: 800; }
        .success-icon { color: #299674; background: #e5f7f0; }
         .error-icon { color: #bd5f5f; background: #fff0f0; }
        .spinner { width: 24px; height: 24px; border: 3px solid #d9ebe9; border-top-color: #45b9ae; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
         .inline-state, .inline-alert { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 16px 24px 0; padding: 11px 13px; border-radius: 8px; font-size: 10px; }
         .loading-state { color: #5d8494; border: 1px solid #dcefeb; background: #f5fcfb; }
         .mini-spinner { width: 14px; height: 14px; flex: 0 0 14px; border: 2px solid #cde9e4; border-top-color: #39a999; border-radius: 50%; animation: spin .8s linear infinite; }
         .inline-alert > div { display: grid; gap: 4px; min-width: 0; }
         .inline-alert strong { color: #315575; font-size: 10px; }
         .inline-alert span { color: #8293a5; line-height: 1.45; }
         .inline-alert.error { color: #9d605c; border: 1px solid #f2d8d0; background: #fff6f3; }
         .inline-alert.warning { border: 1px solid #f0e4d3; background: #fffaf3; }
         .inline-alert .text-button { flex: 0 0 auto; }
         .module-list { display: grid; gap: 12px; padding: 17px 24px 24px; }
         .module-card { overflow: hidden; border: 1px solid #e2ebf2; border-radius: 9px; background: #fcfeff; }
         .module-heading { display: flex; align-items: center; gap: 11px; padding: 14px 16px; border-bottom: 1px solid #edf1f6; background: #fbfdff; }
         .module-number { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border-radius: 8px; color: #347e9d; background: #e8f4fb; font-size: 10px; font-weight: 800; }
         .module-title { min-width: 0; flex: 1; }
         .module-title strong, .module-title small { display: block; }
         .module-title strong { overflow: hidden; color: #1b426c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
         .module-title small { overflow: hidden; margin-top: 4px; color: #92a2b1; font-size: 9px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
         .lesson-list { padding: 4px 16px 8px 58px; }
         .lesson-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 15px; padding: 12px 0; border-bottom: 1px solid #edf1f6; }
         .lesson-row:last-child { border-bottom: 0; }
         .lesson-title { display: flex; align-items: flex-start; gap: 9px; min-width: 0; }
         .lesson-icon, .resource-icon { display: grid; place-items: center; flex: 0 0 25px; width: 25px; height: 25px; border-radius: 6px; color: #8b6b37; background: #fff2de; font-size: 9px; font-weight: 800; }
         .lesson-title strong, .lesson-title small, .resource-row strong, .resource-row small { display: block; }
         .lesson-title strong { overflow: hidden; color: #315575; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
         .lesson-title small { margin-top: 4px; color: #95a5b4; font-size: 9px; line-height: 1.45; }
         .resource-list { grid-column: 1 / -1; display: grid; gap: 5px; margin: 2px 0 0 34px; padding: 8px 0 0 11px; border-left: 2px solid #e5f1ef; }
         .resource-row { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 6px 0; }
         .resource-icon { flex-basis: 22px; width: 22px; height: 22px; color: #438e82; background: #e7f7f3; }
         .resource-row > span:nth-child(2) { min-width: 0; flex: 1; }
         .resource-row strong { overflow: hidden; color: #52708b; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
         .resource-row small { margin-top: 3px; color: #a0adb9; font-size: 8px; }
         .resource-row a { color: #0874a4; font-size: 9px; font-weight: 800; text-decoration: none; }
         .resource-row a:hover { text-decoration: underline; }
         .nested-state { color: #a0adb9; font-size: 9px; }
         .lesson-empty { grid-column: 1 / -1; margin: 1px 0 0 34px; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: 13px 18px; border-top: 1px solid #edf1f6; color: #71859a; font-size: 10px; vertical-align: middle; }
        th { padding-top: 11px; padding-bottom: 11px; border-top: 0; color: #a2afbd; background: #fbfcfe; font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        td strong, td small { display: block; }
        td strong { color: #1b426c; font-size: 10px; }
        td small { margin-top: 4px; color: #99a8b6; font-size: 9px; }
         .table-value { margin: 0; }
        .learner-cell { display: flex; align-items: center; gap: 9px; min-width: 170px; }
        .learner-avatar { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 50%; color: #277b8a; background: #e3f3f3; font-size: 10px; font-weight: 800; }
        .progress-cell { min-width: 175px; }
        .progress-cell > div { display: flex; align-items: center; gap: 10px; }
        .progress-cell .progress-track { flex: 1; }
        .progress-cell > div > strong { flex: 0 0 35px; color: #2b9b7e; font-size: 10px; }
        .progress-cell small { margin-top: 6px; }
         .muted { color: #a2afbd; font-size: 9px; }
         .progress-error { color: #b36e63; }
         .assignment-heading-actions { display: flex; align-items: center; gap: 10px; }
         .assignment-list { display: grid; gap: 12px; padding: 17px 24px 24px; }
         .assignment-card { overflow: hidden; border: 1px solid #e2ebf2; border-radius: 10px; background: #fcfeff; }
         .assignment-card-main { display: grid; grid-template-columns: minmax(240px, 1.4fr) minmax(125px, .7fr) auto; align-items: center; gap: 18px; padding: 16px 17px 12px; }
         .assignment-card .assignment-title { align-items: flex-start; }
        .assignment-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .assignment-icon { display: grid; place-items: center; flex: 0 0 31px; width: 31px; height: 31px; border-radius: 8px; color: #8b6b37; background: #fff1dd; font-size: 11px; font-weight: 800; }
        .assignment-title strong, .assignment-title small, .assignment-meta small { display: block; }
        .assignment-title strong { overflow: hidden; color: #1b426c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
        .assignment-title small { margin-top: 4px; color: #95a5b4; font-size: 9px; }
        .assignment-meta { display: grid; gap: 5px; }
        .assignment-meta small { color: #8b9baa; font-size: 9px; }
        .assignment-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .text-button { padding: 4px 0; border: 0; color: #5680a4; background: transparent; font-size: 10px; font-weight: 800; white-space: nowrap; }
        .text-button:hover:not(:disabled) { color: #0c669b; }
        .text-button.strong { color: #258d7a; }
         .danger-text { color: #b56e67; }
          .assignment-description { display: -webkit-box; overflow: hidden; margin: 0 17px; color: #71859a; font-size: 10px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
         .assignment-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding: 11px 17px; border-top: 1px solid #edf1f6; background: #fff; }
         .submission-toggle { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; color: #52708b; background: transparent; font-size: 10px; font-weight: 800; }
         .submission-toggle span { display: inline-grid; place-items: center; min-width: 19px; height: 19px; border-radius: 6px; color: #267d76; background: #e7f7f3; font-size: 9px; }
         .workspace-note { display: flex; align-items: center; gap: 8px; margin: 16px 24px 0; padding: 10px 12px; border: 1px solid #f0e4d3; border-radius: 7px; color: #9b7746; background: #fffaf3; font-size: 10px; }
         .workspace-note span { display: grid; place-items: center; width: 17px; height: 17px; border-radius: 50%; color: #fff; background: #c8964c; font-size: 10px; font-weight: 800; }
         .assignment-editor { margin: 17px 24px 0; padding: 18px; border: 1px solid #cfe8e4; border-radius: 10px; background: linear-gradient(145deg, #fbfffe, #f5fbfc); }
         .editor-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 17px; }
         .editor-heading h3 { margin-top: 6px; color: #18385e; font-size: 15px; letter-spacing: -.02em; }
         .icon-button { width: 28px; height: 28px; padding: 0; border: 1px solid #d9e9ed; border-radius: 7px; color: #6f8799; background: #fff; font-size: 17px; line-height: 1; }
         .icon-button:hover { border-color: #abcfc9; color: #1c6873; }
         .form-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(150px, .6fr); gap: 13px 15px; }
         .form-grid label { display: grid; gap: 6px; color: #607a91; font-size: 9px; font-weight: 800; }
         .form-grid input, .form-grid select, .form-grid textarea { width: 100%; padding: 10px 11px; border: 1px solid #d8e6ec; border-radius: 7px; outline: 0; color: #244669; background: #fff; font-size: 10px; font-weight: 500; }
         .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus { border-color: #71c5bd; box-shadow: 0 0 0 3px #71c5bd1c; }
         .form-grid textarea { resize: vertical; line-height: 1.5; }
         .full-field { grid-column: 1 / -1; }
         .optional-label { color: #a5b1bb; font-weight: 500; }
         .readonly-field { display: flex; align-items: center; min-height: 36px; padding: 0 11px; border: 1px solid #d8e6ec; border-radius: 7px; color: #71859a; background: #f4f8fa; font-size: 10px; font-weight: 500; }
         .editor-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 16px; padding-top: 15px; border-top: 1px solid #e2efed; }
         .confirm-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 0 17px 13px; padding: 11px 12px; border: 1px solid #f1d5cf; border-radius: 7px; background: #fff5f2; }
         .confirm-bar > div:first-child { display: grid; gap: 4px; }
         .confirm-bar strong { color: #8f514d; font-size: 10px; }
         .confirm-bar span { color: #aa7d78; font-size: 9px; }
         .confirm-bar > div:last-child { display: flex; align-items: center; gap: 9px; }
         .archive-button { min-height: 34px; padding: 0 11px; border: 0; border-radius: 7px; color: #fff; background: #bf756c; font-size: 10px; font-weight: 800; white-space: nowrap; }
         .archive-button:hover:not(:disabled) { background: #aa625a; }
         .assignment-submissions { padding: 4px 17px 14px; border-top: 1px solid #edf1f6; background: #fbfdff; }
         .submission-detail { padding: 13px 0; border-bottom: 1px solid #edf1f6; }
         .submission-detail:last-child { border-bottom: 0; }
         .submission-detail-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
          .submission-detail > p { max-height: 85px; overflow: auto; margin: 10px 0 0 39px; color: #526f8c; font-size: 10px; line-height: 1.5; white-space: pre-wrap; }
         .submission-detail > a { display: inline-block; margin: 8px 0 0 39px; color: #0874a4; font-size: 9px; font-weight: 800; text-decoration: none; }
         .submission-detail > a:hover { text-decoration: underline; }
         .graded-summary { display: flex; align-items: flex-start; gap: 9px; margin: 10px 0 0 39px; padding: 8px 10px; border-radius: 6px; color: #617c8c; background: #eef9f6; font-size: 9px; line-height: 1.45; }
         .graded-summary strong { flex: 0 0 auto; color: #258d7a; font-size: 10px; }
         .graded-summary span { white-space: pre-wrap; }
        .submission-list { display: grid; gap: 14px; padding: 17px 24px 24px; }
        .submission-card { overflow: hidden; border: 1px solid #e4ebf3; border-radius: 9px; background: #fcfeff; }
        .submission-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 17px; border-bottom: 1px solid #edf1f6; }
        .submission-course { text-align: right; }
        .submission-course strong, .submission-course small { display: block; }
        .submission-course strong { color: #315575; font-size: 11px; }
        .submission-course small { margin-top: 4px; color: #92a2b1; font-size: 9px; }
        .submission-body { padding: 15px 17px; }
        .submission-body p { max-height: 100px; overflow: auto; color: #526f8c; font-size: 11px; line-height: 1.5; white-space: pre-wrap; }
        .submission-body a { display: inline-block; margin-top: 9px; color: #0874a4; font-size: 10px; font-weight: 800; text-decoration: none; }
        .grade-bar { display: flex; align-items: flex-end; gap: 10px; padding: 13px 17px 16px; border-top: 1px solid #edf1f6; background: #fff; }
        .grade-bar label { display: grid; gap: 6px; min-width: 110px; color: #71859a; font-size: 9px; font-weight: 800; }
        .grade-bar input { width: 100%; min-height: 35px; padding: 0 9px; border: 1px solid #dbe6ef; border-radius: 6px; outline: 0; color: #244669; background: #fbfdff; font-size: 10px; }
        .grade-bar input:focus { border-color: #71c5bd; box-shadow: 0 0 0 3px #71c5bd1c; }
        .feedback-field { flex: 1; }
         .assessment-heading-actions { display: flex; align-items: center; gap: 10px; }
         .assessment-list { display: grid; gap: 12px; padding: 17px 24px 24px; }
         .assessment-card { overflow: hidden; border: 1px solid #e2ebf2; border-radius: 10px; background: #fcfeff; }
         .assessment-card-main { display: grid; grid-template-columns: minmax(240px, 1.3fr) minmax(135px, .75fr) auto; align-items: center; gap: 18px; padding: 16px 17px 12px; }
         .assessment-title { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
         .assessment-icon { display: grid; place-items: center; flex: 0 0 31px; width: 31px; height: 31px; border-radius: 8px; color: #267c90; background: #e3f4f4; font-size: 14px; font-weight: 800; }
         .assessment-title strong, .assessment-title small, .assessment-meta small { display: block; }
         .assessment-title strong { overflow: hidden; color: #1b426c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
         .assessment-title small { margin-top: 4px; color: #95a5b4; font-size: 9px; }
         .assessment-meta { display: grid; gap: 5px; }
         .assessment-meta small { color: #8b9baa; font-size: 9px; }
         .assessment-actions { display: flex; justify-content: flex-end; gap: 10px; }
          .assessment-description { display: -webkit-box; overflow: hidden; margin: 0 17px; color: #71859a; font-size: 10px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
         .assessment-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding: 11px 17px; border-top: 1px solid #edf1f6; background: #fff; }
         .assessment-attempt-summary, .attempts-caption { color: #9a7a50; font-size: 9px; font-weight: 700; }
         .assessment-details { padding: 16px 17px 18px; border-top: 1px solid #edf1f6; background: #f8fbfd; }
         .assessment-detail-columns { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(340px, .95fr); gap: 18px; }
         .subsection-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 11px; }
         .subsection-heading h3, .subsection-heading h4 { margin-top: 5px; color: #244669; font-size: 13px; letter-spacing: -.02em; }
         .subsection-heading h4 { font-size: 11px; }
         .question-bank, .attempt-bank { min-width: 0; }
         .question-card, .attempt-card { overflow: hidden; margin-top: 9px; border: 1px solid #e2ebf2; border-radius: 8px; background: #fff; }
         .question-heading { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: flex-start; gap: 9px; padding: 11px 12px; }
         .question-number { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 6px; color: #287a88; background: #e4f5f3; font-size: 9px; font-weight: 800; }
         .question-heading strong, .question-heading small { display: block; }
         .question-heading strong { color: #315575; font-size: 10px; line-height: 1.45; }
         .question-heading small { margin-top: 4px; color: #99a8b6; font-size: 8px; }
         .question-actions { display: flex; gap: 9px; }
         .option-list { display: grid; gap: 5px; padding: 0 12px 12px 49px; }
         .option-row { display: flex; align-items: center; gap: 7px; color: #688099; font-size: 9px; }
         .option-row em { margin-left: auto; color: #2b9b7e; font-size: 8px; font-style: normal; font-weight: 800; text-transform: uppercase; }
         .option-marker { display: grid; place-items: center; width: 17px; height: 17px; border-radius: 50%; color: #a5b2bd; background: #f0f4f7; font-size: 9px; }
         .option-marker.correct { color: #267f71; background: #ddf5ee; }
         .question-confirm { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 8px 12px; border-top: 1px solid #f1e5e2; color: #96635c; background: #fff8f6; font-size: 9px; }
         .question-confirm span { margin-right: auto; }
         .question-editor { margin-top: 11px; padding: 14px; border: 1px solid #cfe8e4; border-radius: 8px; background: #fbfffe; }
         .question-editor .editor-heading { margin-bottom: 12px; }
         .options-editor { margin-top: 14px; padding-top: 13px; border-top: 1px solid #e2efed; }
         .option-edit-row { display: grid; grid-template-columns: 25px minmax(90px, .65fr) minmax(130px, 1fr) 27px; align-items: center; gap: 7px; margin-top: 7px; }
         .option-edit-row input { min-height: 32px; padding: 0 8px; border: 1px solid #d8e6ec; border-radius: 6px; outline: 0; color: #244669; background: #fff; font-size: 9px; }
         .option-edit-row input:focus { border-color: #71c5bd; box-shadow: 0 0 0 3px #71c5bd1c; }
         .correct-toggle { width: 23px; height: 23px; padding: 0; border: 1px solid #d8e6ec; border-radius: 50%; color: #9aabb8; background: #fff; font-size: 11px; }
         .correct-toggle.selected { border-color: #79cabe; color: #218775; background: #e3f8f2; }
         .compact-icon { width: 27px; height: 27px; font-size: 14px; }
         .attempt-bank { min-width: 0; }
         .attempt-card { padding: 12px; }
         .attempt-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
         .attempt-result { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 7px; }
         .attempt-result > strong { color: #2b9b7e; font-size: 10px; }
         .outcome-badge { padding: 4px 6px; border-radius: 5px; font-size: 8px; font-weight: 800; }
         .outcome-badge.passed { color: #267f71; background: #e0f7ef; }
         .outcome-badge.not-passed { color: #ad6c62; background: #fff0ed; }
         .attempt-footer { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin: 10px 0 0 39px; }
         .attempt-feedback { color: #7b8e9e; font-size: 9px; line-height: 1.45; }
         .attempt-detail { margin-top: 11px; padding-top: 9px; border-top: 1px solid #edf1f6; }
         .attempt-question { display: grid; grid-template-columns: minmax(0, 1fr) 75px; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f3f6; }
         .attempt-question strong, .attempt-question small { display: block; }
         .attempt-question strong { color: #526f8c; font-size: 9px; line-height: 1.4; }
         .attempt-question small { margin-top: 4px; color: #99a8b6; font-size: 8px; line-height: 1.4; }
         .attempt-question input { width: 75px; min-height: 31px; padding: 0 7px; border: 1px solid #d8e6ec; border-radius: 6px; outline: 0; color: #244669; background: #fff; font-size: 9px; }
         .awarded-mark { color: #2b9b7e; font-size: 9px; font-weight: 800; text-align: right; }
         .attempt-grade-form { display: grid; gap: 9px; margin-top: 10px; }
         .attempt-grade-form label { display: grid; gap: 6px; color: #607a91; font-size: 9px; font-weight: 800; }
         .attempt-grade-form textarea { width: 100%; resize: vertical; padding: 8px 9px; border: 1px solid #d8e6ec; border-radius: 6px; outline: 0; color: #244669; background: #fff; font-size: 9px; line-height: 1.45; }
         .attempt-grade-form .primary-button { justify-self: end; }
         .loading-inline { display: flex; align-items: center; gap: 7px; }
        @media (max-width: 1100px) {
          .sidebar { width: 218px; flex-basis: 218px; }
          .content { padding-right: 3.5%; padding-left: 3.5%; }
          .two-column { grid-template-columns: 1fr; }
        }
        @media (max-width: 780px) {
          .portal-grid { display: block; }
          .sidebar { width: 100%; min-height: auto; padding: 15px 18px 12px; }
          .sidebar-label, .sidebar-foot { display: none; }
          .nav-list { display: flex; overflow-x: auto; gap: 4px; margin-top: 14px; padding-bottom: 2px; }
          .nav-item { flex: 0 0 auto; width: auto; padding: 8px 10px; font-size: 10px; }
          .nav-icon { display: none; }
          .topbar { height: 57px; justify-content: space-between; padding: 0 18px; }
          .mobile-brand { display: flex; }
          .live-label, .help-link { display: none; }
          .topbar-right { gap: 0; }
          .content { padding: 29px 18px 38px; }
          .page-heading { align-items: flex-start; flex-direction: column; }
          .page-heading .primary-button { width: 100%; }
          .metrics { grid-template-columns: repeat(2, 1fr); gap: 9px; }
          .metric-card { min-height: 95px; padding: 14px; }
          .metric-card strong { font-size: 21px; }
          .panel-heading { padding: 17px 15px; }
          .course-row, .action-row { padding-right: 15px; padding-left: 15px; }
          .detail-heading { align-items: flex-start; flex-direction: column; }
          .course-actions { width: 100%; justify-content: space-between; }
           .inline-state, .inline-alert { margin-right: 15px; margin-left: 15px; }
          th, td { padding-right: 12px; padding-left: 12px; }
           .assessment-heading-actions { width: 100%; justify-content: space-between; }
           .assessment-heading-actions .small-button { width: auto; }
           .assessment-list { padding: 14px 15px 18px; }
           .assessment-card-main { grid-template-columns: 1fr auto; gap: 9px 12px; padding: 14px 12px 11px; }
           .assessment-meta { justify-items: end; }
           .assessment-actions { grid-column: 1 / -1; justify-content: flex-start; padding-left: 41px; }
           .assessment-footer { align-items: flex-start; flex-direction: column; gap: 8px; padding: 10px 12px; }
           .assessment-details { padding: 14px 12px 16px; }
           .assessment-detail-columns { grid-template-columns: 1fr; gap: 20px; }
           .question-heading { grid-template-columns: 28px minmax(0, 1fr); }
           .question-actions { grid-column: 2; justify-content: flex-start; }
           .option-list { padding-left: 42px; }
           .option-edit-row { grid-template-columns: 25px minmax(0, 1fr) 27px; }
           .option-edit-row input:nth-of-type(2) { grid-column: 2 / -1; }
           .attempt-heading { align-items: flex-start; flex-direction: column; }
           .attempt-result { justify-content: flex-start; padding-left: 39px; }
           .attempt-footer { margin-left: 0; }
           .attempt-grade-form .primary-button { justify-self: stretch; }
          .assignment-row { grid-template-columns: 1fr auto; gap: 9px 12px; padding: 14px 15px; }
          .assignment-meta { justify-items: end; }
          .assignment-actions { grid-column: 1 / -1; justify-content: flex-start; padding-left: 41px; }
          .submission-list { padding: 14px 15px 18px; }
          .submission-heading { align-items: flex-start; flex-direction: column; gap: 13px; }
          .submission-course { padding-left: 39px; text-align: left; }
          .grade-bar { align-items: stretch; flex-direction: column; }
          .grade-bar label, .feedback-field { width: 100%; }
          .small-button { width: 100%; }
        }
        @media (max-width: 430px) {
          .content { padding-right: 13px; padding-left: 13px; }
          h1 { font-size: 29px; }
          .metric-card { padding: 12px; }
          .metric-label { font-size: 9px; }
          .course-row { grid-template-columns: 34px minmax(0, 1fr); }
          .course-side { grid-column: 2; justify-items: start; display: flex; align-items: center; flex-wrap: wrap; }
          .course-mark { width: 31px; height: 31px; }
        }
         /* Daily teaching workspace visual refresh */
         .portal-shell { background: radial-gradient(circle at 8% 0%, #5ca6b11c, transparent 25%), radial-gradient(circle at 96% 8%, #ef7d3c16, transparent 23%), #f4f8fb; }
         .sidebar { background: linear-gradient(165deg, #082f50 0%, #0d4d72 62%, #0b3c60 100%); box-shadow: 16px 0 42px #0a345414; }
         .brand-mark { color: #0a3655; background: #ef9360; box-shadow: 0 7px 18px #ef7d3c44; }
         .nav-item { border-radius: 11px; transition: background-color .18s ease, transform .18s ease; }
         .nav-item:hover { transform: translateX(2px); }
         .nav-item.active { box-shadow: inset 3px 0 #ef9360; }
         .nav-item.active .nav-icon { color: #efb08b; }
         .topbar { background: #fbfdfe; border-bottom-color: #d3e1e8; }
         .content { padding-top: 52px; }
         .eyebrow { color: #bf6731; }
         h1, .panel-heading h2 { font-family: "Avenir Next", "Segoe UI", Arial, sans-serif; }
         h1 { color: #0a3454; font-size: clamp(31px, 3vw, 44px); }
         .intro, .panel-copy { color: #607a8c; }
         .primary-button { color: #fffaf4; background: #ef7d3c; box-shadow: 0 9px 20px #ef7d3c35; border-radius: 11px; }
         .primary-button:hover:not(:disabled) { background: #d96b2e; }
         .secondary-button { border-color: #c6d8e1; background: #fbfdfe; border-radius: 11px; }
         .metrics { gap: 15px; }
         .metric-card, .panel { border-color: #d3e1e8; border-radius: 15px; box-shadow: 0 12px 30px #124b7310; }
         .metric-card { background: #fbfdfe; }
         .metric-card.accent { border-color: #bfe0d8; background: linear-gradient(145deg, #fbfdfe, #eef9f5); }
         .metric-card.warm { border-color: #f0d8c8; background: linear-gradient(145deg, #fbfdfe, #fff5ed); }
         .metric-card strong { color: #123f60; font-family: "Avenir Next", "Segoe UI", Arial, sans-serif; font-size: 29px; }
         .metric-card.accent strong { color: #278a76; }
         .metric-card.warm strong { color: #c56c32; }
         .panel-heading { padding: 25px 26px 21px; background: #fbfdfe; }
         .course-row, .action-row { padding-top: 15px; padding-bottom: 15px; }
         .course-row:hover, .course-row.selected { background: #f1f7f9; }
         .course-row.selected { box-shadow: inset 3px 0 #ef7d3c; }
         .course-mark, .action-icon.content { color: #bd6530; background: #fff0e7; }
         .progress-fill { background: linear-gradient(90deg, #278a76, #5ca6b1); }
         .status-pill { border: 1px solid transparent; }
         .status-pill.published, .status-pill.completed, .status-pill.graded { border-color: #bfe0d8; }
         .status-pill.draft, .status-pill.pending { border-color: #f0d8c8; }
         .module-card, .assignment-card, .assessment-card, .submission-card { border-color: #d3e1e8; border-radius: 13px; background: #fbfdfe; }
         .module-heading, .assignment-footer, .assessment-footer { background: #f4f8fb; }
         .state-icon { background: #e5f2f3; color: #267e89; }
         .form-grid input, .form-grid select, .form-grid textarea, .grade-bar input, .attempt-grade-form textarea { border-color: #c4d5df; border-radius: 9px; background: #fbfdfe; }
         .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus, .grade-bar input:focus, .attempt-grade-form textarea:focus { border-color: #5ca6b1; box-shadow: 0 0 0 3px #5ca6b126; }
          .page-heading { align-items: flex-start; padding: 4px 0 5px; }
          .page-heading-copy { min-width: 0; }
          .page-heading h1 { margin-top: 10px; }
          .heading-identity { display: flex; align-items: center; gap: 9px; margin-top: 18px; }
          .heading-avatar { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; color: #fff; background: #267d76; font-size: 10px; font-weight: 850; }
          .heading-identity strong, .heading-identity small { display: block; }
          .heading-identity strong { color: #315575; font-size: 11px; }
          .heading-identity small { margin-top: 3px; color: #8aa0b0; font-size: 9px; }
          .heading-actions { display: flex; align-items: center; gap: 9px; flex: 0 0 auto; }
          .heading-quick-action { gap: 7px; }
          .heading-quick-action > span { color: #267d76; font-size: 14px; }
          .heading-quick-action b { display: grid; place-items: center; min-width: 19px; height: 19px; padding: 0 4px; border-radius: 7px; color: #a4603d; background: #fff0e7; font-size: 9px; }
          .metric-card { display: flex; align-items: flex-start; gap: 12px; min-height: 123px; padding: 18px; }
          .metric-card-icon { display: grid; place-items: center; flex: 0 0 34px; width: 34px; height: 34px; border-radius: 10px; color: #267d76; background: #e8f3f2; font-size: 16px; font-weight: 850; }
          .metric-card-icon.learners { color: #347e9d; background: #e8f4fb; }
          .metric-card.accent .metric-card-icon { color: #2b9b7e; background: #dff3ec; }
          .metric-card.warm .metric-card-icon { color: #bd6530; background: #fff0e7; }
          .metric-card > div { min-width: 0; }
          .metric-label { padding-top: 2px; }
          .metric-card strong { margin-top: 9px; font-size: 31px; }
          .panel, .metric-card { transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
          .panel:hover { border-color: #bfd9dc; box-shadow: 0 16px 36px #124b7317; }
          .panel-heading { align-items: center; }
          .panel-heading h2 { font-size: 20px; }
          .course-panel, .actions-panel { min-height: 100%; }
          .course-row { min-height: 78px; }
          .course-row:hover { transform: translateX(2px); }
          .course-row.selected { background: #edf7f6; }
          .course-main .progress-track { height: 8px; }
          .course-side em { color: #7b9a9a; }
          .course-side em.needs-review { color: #bd8138; }
          .action-row { min-height: 70px; }
          .action-row:hover:not(:disabled) { transform: translateX(2px); }
          .detail-panel, .content-panel, .assignment-panel, .assessment-panel, .submissions-panel { border-radius: 17px; }
          .table-caption { padding: 15px 24px 12px; color: #8aa0b0; font-size: 10px; font-weight: 750; text-align: left; caption-side: top; }
          table { border-top: 1px solid #edf1f6; }
          th { background: #f7fafb; }
          tr { transition: background-color .18s ease; }
          tbody tr:hover { background: #f3f9f9; }
          .learner-avatar { box-shadow: 0 0 0 4px #f1f7f7; }
          .module-card, .assignment-card, .assessment-card, .submission-card { box-shadow: 0 5px 16px #124b7308; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
          .module-card:hover, .assignment-card:hover, .assessment-card:hover, .submission-card:hover { border-color: #a9ccd0; box-shadow: 0 10px 24px #124b7312; transform: translateY(-1px); }
          .module-heading { padding: 17px 18px; }
          .assignment-list, .assessment-list, .submission-list { padding-top: 19px; }
          .assignment-card-main, .assessment-card-main { padding: 18px 18px 13px; }
          .assignment-title strong, .assessment-title strong { font-size: 12px; }
          .assignment-description, .assessment-description { color: #607a8c; font-size: 11px; line-height: 1.5; }
          .assignment-footer, .assessment-footer { padding: 12px 18px; }
          .submission-card { border-radius: 14px; }
          .submission-heading { padding: 18px; }
          .submission-body { padding: 17px 18px; }
          .grade-bar { padding: 14px 18px 18px; }
          .assessment-card-main { background: #fbfdfe; }
          .assessment-details { background: #f4f8fb; }
          .question-card, .attempt-card { border-radius: 11px; }
          .question-heading { padding: 13px; }
          .question-number { background: #e8f3f2; color: #267d76; }
          .attempt-card { box-shadow: none; }
          .state { padding: 38px 26px; }
          .state-icon { box-shadow: 0 0 0 5px #f2f8f8; }
          @media (max-width: 780px) {
            .page-heading { gap: 17px; }
            .heading-actions { width: 100%; }
            .heading-actions > button { flex: 1; }
            .heading-quick-action { min-width: 0; }
            .metric-card { min-height: 112px; }
            .table-caption { padding-right: 15px; padding-left: 15px; }
            .content-heading-actions { align-items: flex-end; flex-direction: column; }
            .module-heading { align-items: flex-start; flex-wrap: wrap; }
            .module-heading .module-title { min-width: calc(100% - 43px); }
            .module-heading .status-pill { margin-left: 43px; }
            .module-heading .content-actions { width: 100%; justify-content: flex-start; padding-left: 43px; }
            .lesson-row > .content-actions { grid-column: 1 / -1; justify-content: flex-start; padding-left: 34px; }
            .resource-row { align-items: flex-start; flex-wrap: wrap; }
            .resource-row > .content-actions { width: 100%; padding-left: 30px; justify-content: flex-start; }
            .resource-row > a, .resource-row > .muted { margin-left: 30px; }
            .nested-toolbar { padding-left: 16px; }
          }
          @media (max-width: 430px) {
            .heading-actions { align-items: stretch; flex-direction: column; }
            .heading-actions > button { width: 100%; }
            .metric-card { gap: 9px; padding: 13px; }
            .metric-card-icon { flex-basis: 29px; width: 29px; height: 29px; font-size: 13px; }
            .metric-card strong { font-size: 25px; }
          }
         @media (prefers-reduced-motion: reduce) {
           *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
         }
      `}</style>
    </main>
  );
}