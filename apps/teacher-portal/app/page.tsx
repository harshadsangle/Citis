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

type CourseModuleData = {
  module: CourseModule;
  lessons: Array<{ lesson: Lesson; resources: LearningResource[] }>;
};

type CourseStructure = {
  modules: CourseModuleData[];
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
  progress: Array<{ enrollment: Enrollment; progress: Progress | null }>;
  assignments: Assignment[];
  submissions: Array<{ assignment: Assignment; submission: Submission }>;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: { message?: string };
  message?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
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

function learnerName(learner: Enrollment | Submission) {
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

      const details = await Promise.all(courses.map(async (course): Promise<CourseData> => {
        const [enrollments, assignments, structure] = await Promise.all([
          list<Enrollment>(`/courses/${encodeURIComponent(course.id)}/enrollments?status=ACTIVE`),
          list<Assignment>(`/assignments?courseId=${encodeURIComponent(course.id)}`),
          loadCourseStructure(course.id).then((modules): CourseStructure => ({ modules })).catch((reason: unknown): CourseStructure => ({
            modules: [],
            error: reason instanceof Error ? reason.message : "Course content could not be loaded.",
          })),
        ]);
        const progress = await Promise.all(enrollments.map(async (enrollment) => ({
          enrollment,
          progress: await request<Progress>(`/progress/courses/${encodeURIComponent(course.id)}?learnerId=${encodeURIComponent(enrollment.learner_id)}`).catch(() => null),
        })));
        const submissionGroups = await Promise.all(assignments.map(async (assignment) => ({
          assignment,
          submissions: await list<Submission>(`/assignments/${encodeURIComponent(assignment.id)}/submissions?page=1&pageSize=100`),
        })));
        return {
          course,
          modules: structure.modules,
          structureError: "error" in structure ? structure.error : undefined,
          enrollments,
          progress,
          assignments,
          submissions: submissionGroups.flatMap(({ assignment, submissions }) => submissions.map((submission) => ({ assignment, submission }))),
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

  useEffect(() => {
    void loadDashboard();
  }, []);

  const selected = courseData.find((item) => item.course.id === selectedCourseId) || courseData[0];
  const pendingSubmissions = useMemo(
    () => courseData.flatMap((item) => item.submissions
      .filter(({ submission }) => submission.status === "SUBMITTED")
      .map((entry) => ({ ...entry, course: item.course }))),
    [courseData],
  );
  const learnerTotal = courseData.reduce((total, item) => total + item.enrollments.length, 0);
  const progressRows = courseData.flatMap((item) => item.progress);
  const progressValues = progressRows.map(({ progress }) => progress?.percentage).filter((value): value is number => typeof value === "number");
  const averageProgress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;

  function selectCourse(courseId: string, scrollToSubmissions = false) {
    setSelectedCourseId(courseId);
    if (scrollToSubmissions) window.setTimeout(() => document.getElementById("submissions")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
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
            <div className="topbar-right"><span className="live-label"><i />Secure workspace</span><button className="help-link" type="button" onClick={() => setNotice("Need help? Contact your institution administrator.")}>Help</button></div>
          </header>

          <div className="content">
            <header className="page-heading" id="overview">
              <div>
                <p className="eyebrow">Daily teaching workspace</p>
                <h1>Good morning, {name.split(" ")[0]}.</h1>
                <p className="intro">Keep your assigned courses moving, check learner progress, and clear the review queue from one secure view.</p>
              </div>
              <button className="primary-button" type="button" onClick={() => void loadDashboard(true)} disabled={loading || refreshing}>
                <span className={refreshing ? "spin" : ""}>↻</span>{refreshing ? "Refreshing…" : "Refresh workspace"}
              </button>
            </header>

            {error && <div className="alert error" role="alert"><strong>We couldn’t complete that action</strong><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
            {notice && <div className="alert success" role="status"><strong>Workspace updated</strong><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}

            <section className="metrics" aria-label="Teaching summary">
              <article className="metric-card"><span className="metric-label">Assigned courses</span><strong>{loading ? "—" : courseData.length}</strong><span className="metric-foot">Courses in your teaching scope</span></article>
              <article className="metric-card"><span className="metric-label">Enrolled learners</span><strong>{loading ? "—" : learnerTotal}</strong><span className="metric-foot">Active course enrollments</span></article>
              <article className="metric-card accent"><span className="metric-label">Average progress</span><strong>{loading ? "—" : `${averageProgress}%`}</strong><span className="metric-foot">Across learners with progress data</span></article>
              <article className="metric-card warm"><span className="metric-label">Pending submissions</span><strong>{loading ? "—" : pendingSubmissions.length}</strong><span className="metric-foot">Learner work awaiting review</span></article>
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
                        <span className="course-side"><StatusPill status={item.course.status} /><small>{item.enrollments.length} learners</small>{pending > 0 && <em>{pending} to review</em>}</span>
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
                </div>
                <div className="scope-note"><span>●</span> Data is limited to courses assigned to your instructor account.</div>
              </div>
            </section>

            <section className="panel detail-panel" id="learners">
              <div className="panel-heading detail-heading">
                <div><p className="eyebrow">Selected course</p><h2>{selected?.course.title || "Learner progress"}</h2><p className="panel-copy">{selected ? `${selected.course.code} · ${selected.enrollments.length} active learners` : "Select an assigned course to view its roster and progress."}</p></div>
                {selected && <div className="course-actions"><StatusPill status={selected.course.status} /><button className="secondary-button" type="button" onClick={() => void loadDashboard(true)} disabled={refreshing}>Sync data</button></div>}
              </div>
              {!selected && !loading && <div className="state"><div className="state-icon">♙</div><div><strong>No learner roster to show</strong><p>Assigned course enrollments and progress will appear here.</p></div></div>}
              {selected && selected.enrollments.length === 0 && <div className="state"><div className="state-icon">—</div><div><strong>No active learners yet</strong><p>There are no active enrollments in this assigned course.</p></div></div>}
              {selected && selected.enrollments.length > 0 && <div className="table-wrap">
                <table>
                  <thead><tr><th>Learner</th><th>Course progress</th><th>Lessons</th><th>Assessments</th><th>State</th></tr></thead>
                  <tbody>{selected.progress.map(({ enrollment, progress }) => (
                    <tr key={enrollment.id}>
                      <td><div className="learner-cell"><span className="learner-avatar">{learnerName(enrollment).slice(0, 1).toUpperCase()}</span><span><strong>{learnerName(enrollment)}</strong><small>{enrollment.learner_email || "Active enrollment"}</small></span></div></td>
                      <td className="progress-cell">{progress ? <><div><ProgressBar percentage={progress.percentage} /><strong>{progress.percentage}%</strong></div><small>Updated from completed course activity</small></> : <span className="muted">Progress unavailable</span>}</td>
                      <td>{progress ? `${progress.lessons.completed}/${progress.lessons.total}` : "—"}</td>
                      <td>{progress ? `${progress.assessments.completed}/${progress.assessments.total}` : "—"}</td>
                      <td>{progress ? <StatusPill status={progress.state} /> : <StatusPill status="NOT_STARTED" />}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>}
            </section>

             <section className="panel content-panel" id="content">
               <div className="panel-heading detail-heading">
                 <div><p className="eyebrow">Selected course</p><h2>Course content</h2><p className="panel-copy">{selected ? "Modules, lessons, and learning resources available for this assigned course." : "Select an assigned course to view its learning content."}</p></div>
                 {selected && <span className="readonly-badge">View only</span>}
               </div>
               {loading && <div className="state"><div className="spinner" /><div><strong>Loading course content…</strong><p>Reading the modules, lessons, and resources for your assigned courses.</p></div></div>}
               {!loading && !selected && <div className="state"><div className="state-icon">≡</div><div><strong>No course selected</strong><p>Assigned course content will appear here after you select a course.</p></div></div>}
               {!loading && selected?.structureError && <div className="state"><div className="state-icon error-icon">!</div><div><strong>Course content is unavailable</strong><p>{selected.structureError}</p></div></div>}
               {!loading && selected && !selected.structureError && selected.modules.length === 0 && <div className="state"><div className="state-icon">+</div><div><strong>No modules available</strong><p>This assigned course does not have any modules or lessons to display yet.</p></div></div>}
               {!loading && selected && !selected.structureError && selected.modules.length > 0 && <div className="module-list">
                 {selected.modules.map(({ module, lessons }) => (
                   <article className="module-card" key={module.id}>
                     <div className="module-heading">
                       <div className="module-number">{String(module.sequence).padStart(2, "0")}</div>
                       <div className="module-title"><strong>{module.title}</strong><small>{module.description || `${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`}</small></div>
                       <StatusPill status={module.status} />
                     </div>
                     {lessons.length === 0 && <div className="nested-state">No lessons in this module.</div>}
                     {lessons.length > 0 && <div className="lesson-list">
                       {lessons.map(({ lesson, resources }) => (
                         <div className="lesson-row" key={lesson.id}>
                           <div className="lesson-title"><span className="lesson-icon">L</span><span><strong>{lesson.title}</strong><small>{lesson.description || `${resources.length} learning resource${resources.length === 1 ? "" : "s"}`}{lesson.estimated_duration ? ` · ${lesson.estimated_duration} min` : ""}</small></span></div>
                           <StatusPill status={lesson.status} />
                           {resources.length > 0 && <div className="resource-list">
                             {resources.map((resource) => {
                               const href = resourceHref(resource);
                               return <div className="resource-row" key={resource.id}><span className="resource-icon">↗</span><span><strong>{resource.title}</strong><small>{statusLabel(resource.resource_type)}{resource.duration ? ` · ${resource.duration} min` : ""}{resource.managed_file_name ? ` · ${resource.managed_file_name}` : ""}</small></span>{href ? <a href={href} target="_blank" rel="noreferrer">Open</a> : <span className="muted">No link</span>}</div>;
                             })}
                           </div>}
                           {resources.length === 0 && <div className="nested-state lesson-empty">No learning resources attached.</div>}
                         </div>
                       ))}
                     </div>}
                   </article>
                 ))}
               </div>}
             </section>

            <section className="panel assignment-panel" id="assignments">
              <div className="panel-heading detail-heading">
                <div><p className="eyebrow">Course delivery</p><h2>Assignments</h2><p className="panel-copy">{selected ? "Publish learner work and jump into submissions without leaving the course view." : "Select a course to manage assignments."}</p></div>
                {selected && <span className="count-badge">{selected.assignments.length}</span>}
              </div>
              {selected && selected.assignments.length === 0 && <div className="state compact"><div className="state-icon">+</div><div><strong>No assignments in this course</strong><p>Assignment authoring is available through the course management workflow.</p></div></div>}
              {selected && selected.assignments.length > 0 && <div className="assignment-list">
                {selected.assignments.map((assignment) => {
                  const submissionCount = selected.submissions.filter(({ submission }) => submission.assignment_id === assignment.id).length;
                  const pendingCount = selected.submissions.filter(({ submission }) => submission.assignment_id === assignment.id && submission.status === "SUBMITTED").length;
                  return <div className="assignment-row" key={assignment.id}><div className="assignment-title"><span className="assignment-icon">A</span><span><strong>{assignment.title}</strong><small>{assignment.module_title || "Course module"} · {assignment.max_marks} marks · {assignment.due_at ? `Due ${formatDate(assignment.due_at)}` : "No due date"}</small></span></div><div className="assignment-meta"><StatusPill status={assignment.status} /><small>{submissionCount} submitted</small></div><div className="assignment-actions">{assignment.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishAssignment(assignment)} disabled={busyAction === `publish:${assignment.id}`}>{busyAction === `publish:${assignment.id}` ? "Publishing…" : "Publish"}</button>}{pendingCount > 0 && <button className="text-button strong" type="button" onClick={() => selectCourse(selected.course.id, true)}>{pendingCount} to review</button>}</div></div>;
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
        @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
        :root { font-family: "Manrope", Arial, sans-serif; color: #173450; background: #f6f9fd; font-synthesis: none; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; min-width: 320px; }
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
        .intro { max-width: 620px; margin-top: 10px; color: #71829a; font-size: 13px; line-height: 1.7; }
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
        .panel-copy { margin-top: 7px; color: #8293a5; font-size: 11px; line-height: 1.6; }
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
        .state { display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 190px; padding: 30px; color: #70849a; }
        .state.compact { min-height: 145px; justify-content: flex-start; }
        .state strong { display: block; color: #244669; font-size: 12px; }
        .state p { max-width: 390px; margin-top: 7px; font-size: 10px; line-height: 1.6; }
        .state-icon { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; border-radius: 50%; color: #197d83; background: #e5f7f4; font-size: 17px; font-weight: 800; }
        .success-icon { color: #299674; background: #e5f7f0; }
         .error-icon { color: #bd5f5f; background: #fff0f0; }
        .spinner { width: 24px; height: 24px; border: 3px solid #d9ebe9; border-top-color: #45b9ae; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        .learner-cell { display: flex; align-items: center; gap: 9px; min-width: 170px; }
        .learner-avatar { display: grid; place-items: center; flex: 0 0 30px; width: 30px; height: 30px; border-radius: 50%; color: #277b8a; background: #e3f3f3; font-size: 10px; font-weight: 800; }
        .progress-cell { min-width: 175px; }
        .progress-cell > div { display: flex; align-items: center; gap: 10px; }
        .progress-cell .progress-track { flex: 1; }
        .progress-cell > div > strong { flex: 0 0 35px; color: #2b9b7e; font-size: 10px; }
        .progress-cell small { margin-top: 6px; }
        .muted { color: #a2afbd; font-size: 9px; }
        .assignment-list { padding: 7px 0; }
        .assignment-row { display: grid; grid-template-columns: minmax(220px, 1.4fr) minmax(130px, .8fr) auto; align-items: center; gap: 18px; padding: 14px 24px; border-bottom: 1px solid #edf1f6; }
        .assignment-row:last-child { border-bottom: 0; }
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
        .submission-list { display: grid; gap: 14px; padding: 17px 24px 24px; }
        .submission-card { overflow: hidden; border: 1px solid #e4ebf3; border-radius: 9px; background: #fcfeff; }
        .submission-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 17px; border-bottom: 1px solid #edf1f6; }
        .submission-course { text-align: right; }
        .submission-course strong, .submission-course small { display: block; }
        .submission-course strong { color: #315575; font-size: 11px; }
        .submission-course small { margin-top: 4px; color: #92a2b1; font-size: 9px; }
        .submission-body { padding: 15px 17px; }
        .submission-body p { max-height: 100px; overflow: auto; color: #526f8c; font-size: 11px; line-height: 1.6; white-space: pre-wrap; }
        .submission-body a { display: inline-block; margin-top: 9px; color: #0874a4; font-size: 10px; font-weight: 800; text-decoration: none; }
        .grade-bar { display: flex; align-items: flex-end; gap: 10px; padding: 13px 17px 16px; border-top: 1px solid #edf1f6; background: #fff; }
        .grade-bar label { display: grid; gap: 6px; min-width: 110px; color: #71859a; font-size: 9px; font-weight: 800; }
        .grade-bar input { width: 100%; min-height: 35px; padding: 0 9px; border: 1px solid #dbe6ef; border-radius: 6px; outline: 0; color: #244669; background: #fbfdff; font-size: 10px; }
        .grade-bar input:focus { border-color: #71c5bd; box-shadow: 0 0 0 3px #71c5bd1c; }
        .feedback-field { flex: 1; }
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
          th, td { padding-right: 12px; padding-left: 12px; }
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
      `}</style>
    </main>
  );
}