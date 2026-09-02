"use client";

import { useEffect, useState } from "react";

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

type LmsCourseProvider = "adobe" | "autodesk" | "comptia" | "microsoft" | "unity";

function normalizeLmsCourseProvider(value: string | null): LmsCourseProvider | null {
  return value === "adobe" || value === "autodesk" || value === "comptia" || value === "microsoft" || value === "unity" ? value : null;
}

function providerForProgrammeName(value?: string | null): LmsCourseProvider | null {
  const name = value?.trim().toLowerCase() || "";
  if (name.includes("adobe")) return "adobe";
  if (name.includes("autodesk")) return "autodesk";
  if (name.includes("comptia")) return "comptia";
  if (name.includes("microsoft")) return "microsoft";
  if (name.includes("unity")) return "unity";
  return null;
}

function providerLabel(provider: LmsCourseProvider | null) {
  return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "CITIS";
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div aria-label={`${percentage}% complete`} style={{ background: "#e6edf3", borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div style={{ background: "#0f766e", borderRadius: 999, height: "100%", transition: "width 240ms ease", width: `${percentage}%` }} />
    </div>
  );
}

export default function StudentPortalPage() {
  const [courses, setCourses] = useState<Progress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<AssessmentAttempt | null>(null);
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

  function dueLabel(value?: string | null) {
    return value ? `Due ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))}` : "No due date";
  }

  return (
    <main className="student-shell" style={{ background: "#f5f8fb", color: "#12304a", fontFamily: "Arial, sans-serif", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1040 }}>
        <p style={{ color: "#0f766e", fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", margin: 0, textTransform: "uppercase" }}>CITIS learning portal</p>
        <header style={{ alignItems: "end", display: "flex", gap: 24, justifyContent: "space-between", margin: "12px 0 32px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-0.04em", margin: 0 }}>{provider ? `${providerLabel(provider)} learning progress` : "Your learning progress"}</h1>
            <p style={{ color: "#61718a", fontSize: 17, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 620 }}>See how far you have progressed across your enrolled CITIS courses. Lesson and assessment completion updates this view automatically.</p>
          </div>
          <div style={{ background: "#fff4c2", borderRadius: 16, color: "#795b00", fontSize: 14, padding: "14px 18px", whiteSpace: "nowrap" }}>Progress dashboard</div>
        </header>

        {loading && <section style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, padding: 28 }}>Loading your courses…</section>}
        {!loading && error && (
          <section style={{ background: "#fff8f5", border: "1px solid #f0c5b8", borderRadius: 20, padding: 28 }}>
            <h2 style={{ margin: "0 0 8px" }}>We couldn’t load your progress</h2>
            <p style={{ color: "#7d5d55", margin: 0 }}>{error}</p>
            <a href="/auth/login" style={{ color: "#0f766e", display: "inline-block", fontWeight: 700, marginTop: 18 }}>Sign in to continue</a>
          </section>
        )}
        {!loading && !error && courses.length === 0 && (
          <section style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, padding: 28 }}>
            <h2 style={{ margin: "0 0 8px" }}>No active courses yet</h2>
            <p style={{ color: "#61718a", margin: 0 }}>Your institution’s learning team will show your courses here after you are enrolled.</p>
          </section>
        )}
        {!loading && !error && courses.length > 0 && (
          <section style={{ display: "grid", gap: 20 }}>
            {courses.map((progress) => (
              <article key={progress.course.id} style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, boxShadow: "0 12px 30px rgba(18, 48, 74, 0.06)", padding: "26px 28px" }}>
                <div style={{ alignItems: "start", display: "flex", gap: 20, justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>{progress.course.code}</p>
                    <h2 style={{ fontSize: 25, margin: "8px 0 6px" }}>{progress.course.title}</h2>
                    {progress.course.description && <p style={{ color: "#61718a", lineHeight: 1.5, margin: 0 }}>{progress.course.description}</p>}
                  </div>
                  <strong style={{ color: "#0f766e", fontSize: 30, whiteSpace: "nowrap" }}>{progress.percentage}%</strong>
                </div>
                <div style={{ margin: "22px 0 14px" }}><ProgressBar percentage={progress.percentage} /></div>
                <div style={{ alignItems: "center", color: "#61718a", display: "flex", flexWrap: "wrap", fontSize: 14, gap: "8px 22px" }}>
                  <strong style={{ color: "#12304a" }}>{stateLabel[progress.state]}</strong>
                  <span>{progress.lessons.completed} of {progress.lessons.total} lessons</span>
                  <span>{progress.assessments.completed} of {progress.assessments.total} assessments</span>
                </div>
                {progress.modules.length > 0 && (
                  <div style={{ borderTop: "1px solid #e8eef3", display: "grid", gap: 16, marginTop: 24, paddingTop: 22 }}>
                    <details open style={{ border: "1px solid #d8e2eb", borderRadius: 14, overflow: "hidden" }}>
                      <summary style={{ alignItems: "center", cursor: "pointer", display: "flex", gap: 12, justifyContent: "space-between", listStyle: "none", padding: "16px 18px" }}>
                        <span>
                          <strong style={{ display: "block", fontSize: 16 }}>Open course outline</strong>
                          <span style={{ color: "#61718a", display: "block", fontSize: 13, marginTop: 4 }}>{progress.modules.length} modules · {progress.lessons.total} lessons</span>
                        </span>
                        <span aria-hidden="true" style={{ color: "#0f766e", fontSize: 22 }}>⌄</span>
                      </summary>
                      <div style={{ borderTop: "1px solid #e8eef3", display: "grid", gap: 10, padding: 12 }}>
                    {progress.modules.map((module) => (
                      <details key={module.id} style={{ background: "#f8fbfd", border: "1px solid #e1e9ef", borderRadius: 12 }}>
                        <summary style={{ alignItems: "center", cursor: "pointer", display: "flex", gap: 12, justifyContent: "space-between", listStyle: "none", padding: "13px 15px" }}>
                          <span style={{ fontWeight: 700 }}>{module.sequence}. {module.title}</span>
                          <span style={{ color: "#61718a", fontSize: 13, whiteSpace: "nowrap" }}>{module.lessons.total} lessons</span>
                        </summary>
                        <div style={{ borderTop: "1px solid #e1e9ef", padding: "12px 15px 0" }}>
                          <div style={{ alignItems: "center", color: "#61718a", display: "flex", fontSize: 13, justifyContent: "space-between", marginBottom: 7 }}>
                            <span>Module progress</span>
                            <span>{module.percentage}% · {stateLabel[module.state]}</span>
                          </div>
                          <ProgressBar percentage={module.percentage} />
                          <p style={{ color: "#71879a", fontSize: 13, margin: "7px 0 0" }}>{module.lessons.completed}/{module.lessons.total} lessons · {module.assessments.completed}/{module.assessments.total} assessments</p>
                        </div>
                        <div style={{ borderTop: "1px solid #e1e9ef", display: "grid", gap: 9, padding: "10px 12px 12px" }}>
                          {module.lessonItems.map((lesson) => (
                            <details key={lesson.id} style={{ background: "white", border: "1px solid #e6edf3", borderRadius: 10 }}>
                              <summary style={{ alignItems: "center", cursor: "pointer", display: "flex", gap: 10, justifyContent: "space-between", listStyle: "none", padding: "11px 13px" }}>
                                <span><span style={{ color: "#6b8194", fontSize: 12, marginRight: 8 }}>{lesson.sequence}</span><strong>{lesson.title}</strong></span>
                                <span style={{ color: "#0f766e", fontSize: 12, whiteSpace: "nowrap" }}>Not started</span>
                              </summary>
                              {lesson.description && (
                                <div style={{ borderTop: "1px solid #eef2f5", color: "#61718a", fontSize: 14, lineHeight: 1.55, padding: "10px 13px 12px" }}>
                                  <p style={{ margin: 0 }}>{lesson.description}</p>
                                  {lesson.estimatedDuration != null && <span style={{ display: "block", fontSize: 12, marginTop: 8 }}>Estimated duration: {lesson.estimatedDuration} minutes</span>}
                                </div>
                              )}
                            </details>
                          ))}
                        </div>
                      </details>
                    ))}
                      </div>
                    </details>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
        {!loading && !error && (
          <section style={{ marginTop: 28 }}>
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>Your record</p>
              <h2 style={{ fontSize: 28, margin: "6px 0 0" }}>Assessment history</h2>
            </div>
            {assessmentHistory.length === 0 ? <div style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, color: "#61718a", padding: 24 }}>Your submitted assessment results will appear here.</div> : (
              <div style={{ display: "grid", gap: 12 }}>
                {assessmentHistory.map((item) => (
                  <article key={item.attempt_id} style={{ alignItems: "center", background: "white", border: "1px solid #d8e2eb", borderRadius: 16, display: "flex", gap: 16, justifyContent: "space-between", padding: "17px 20px" }}>
                    <div>
                      <p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{item.course_code} · {item.module_title}</p>
                      <h3 style={{ fontSize: 19, margin: "6px 0 4px" }}>{item.title}</h3>
                      <span style={{ color: "#61718a", fontSize: 13 }}>Attempt {item.attempt_number} · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(item.submitted_at))}</span>
                    </div>
                    <div style={{ color: item.grading_status === "PENDING" ? "#a06b22" : item.passed === false ? "#ad5b4d" : "#0f766e", fontSize: 14, fontWeight: 700, textAlign: "right" }}>
                      {item.grading_status === "PENDING" ? "Awaiting instructor review" : `${item.score ?? "—"}/${item.max_score ?? "—"} · ${item.passed ? "Passed" : item.passed === false ? "Not passed" : "Graded"}`}
                      {item.grading_feedback && <p style={{ color: "#61718a", fontSize: 13, fontWeight: 400, lineHeight: 1.4, margin: "6px 0 0", maxWidth: 260 }}>{item.grading_feedback}</p>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section style={{ marginTop: 28 }}>
            <div style={{ alignItems: "end", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>Recognition</p>
                <h2 style={{ fontSize: 28, margin: "6px 0 0" }}>Your certificates</h2>
              </div>
              {certificateNotice && <span style={{ color: "#0f766e", fontSize: 14, fontWeight: 700 }}>{certificateNotice}</span>}
            </div>
            {certificates.length === 0 ? (
              <div style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, color: "#61718a", padding: 24 }}>
                <strong style={{ color: "#12304a", display: "block", fontSize: 17, marginBottom: 7 }}>No certificates issued yet</strong>
                <span>{courses.some((course) => course.state === "COMPLETED") ? "Your completion is being checked. Certificates are issued automatically when every published lesson and required assessment is complete." : "Complete all published lessons and required assessments in an enrolled course to receive a certificate automatically."}</span>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {certificates.map((certificate) => (
                  <article key={certificate.id} style={{ alignItems: "center", background: "white", border: "1px solid #b9d9d4", borderRadius: 20, boxShadow: "0 12px 30px rgba(18, 48, 74, 0.06)", display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "space-between", padding: "21px 24px" }}>
                    <div>
                      <p style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>Certificate of achievement</p>
                      <h3 style={{ fontSize: 21, margin: "7px 0 5px" }}>{certificate.course_title}</h3>
                      <p style={{ color: "#61718a", fontSize: 14, margin: 0 }}>{certificate.course_code} · Issued {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(certificate.issue_date))}</p>
                      <p style={{ color: "#71879a", fontSize: 13, margin: "7px 0 0" }}>Certificate number: <strong style={{ color: "#526f8c" }}>{certificate.certificate_number}</strong></p>
                    </div>
                    <button onClick={() => void downloadCertificate(certificate)} disabled={Boolean(certificateBusy)} style={{ background: "#0f766e", border: 0, borderRadius: 9, color: "white", cursor: "pointer", fontWeight: 700, padding: "11px 16px" }} type="button">
                      {certificateBusy === certificate.id ? "Preparing…" : "Download certificate"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section style={{ marginTop: 28 }}>
            <div style={{ alignItems: "end", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>Knowledge checks</p>
                <h2 style={{ fontSize: 28, margin: "6px 0 0" }}>Assessments</h2>
              </div>
              {assessmentNotice && <span style={{ color: "#0f766e", fontSize: 14, fontWeight: 700 }}>{assessmentNotice}</span>}
            </div>
            {activeAttempt ? (
              <article style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, padding: "24px 26px" }}>
                <div style={{ alignItems: "start", display: "flex", justifyContent: "space-between", gap: 18 }}>
                  <div><p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>Attempt in progress</p><h3 style={{ fontSize: 24, margin: "7px 0" }}>{activeAttempt.assessment.title}</h3></div>
                   {activeAttempt.status === "SUBMITTED" && <strong style={{ color: activeAttempt.grading_status === "PENDING" ? "#a06b22" : activeAttempt.passed === false ? "#ad5b4d" : "#0f766e", fontSize: 22 }}>{activeAttempt.grading_status === "PENDING" ? "Awaiting instructor review" : `${activeAttempt.score}/${activeAttempt.max_score} ${activeAttempt.passed === null ? "" : activeAttempt.passed ? "· Passed" : "· Not passed"}`}</strong>}
                </div>
                <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
                  {activeAttempt.questions.map((question, index) => {
                    const selected = answers[question.id];
                    const result = activeAttempt.results?.find((item) => item.questionId === question.id);
                    return <div key={question.id} style={{ borderTop: index ? "1px solid #e8eef3" : 0, paddingTop: index ? 18 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{index + 1}. {question.prompt}</strong><span style={{ color: "#61718a", fontSize: 13 }}>{question.marks} marks</span></div>
                      {question.question_type === "SHORT_TEXT" || question.question_type === "NUMERIC" ? (
                        <input disabled={activeAttempt.status === "SUBMITTED"} value={typeof selected === "string" ? selected : ""} onChange={(event) => setAnswer(question, event.target.value)} placeholder={question.question_type === "NUMERIC" ? "Enter a number" : "Write your answer"} style={{ border: "1px solid #d8e2eb", borderRadius: 9, color: "#12304a", font: "inherit", marginTop: 10, padding: 11, width: "100%" }} />
                      ) : (
                        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                          {question.options.map((option) => <label key={option.id} style={{ alignItems: "center", color: "#526f8c", display: "flex", gap: 9 }}><input disabled={activeAttempt.status === "SUBMITTED"} type={question.question_type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={question.id} checked={Array.isArray(selected) ? selected.includes(option.value) : selected === option.value} onChange={(event) => setAnswer(question, option.value, event.target.checked)} />{option.label}</label>)}
                        </div>
                      )}
                       {result && <span style={{ color: result.correct === null ? "#a06b22" : result.correct ? "#0f766e" : "#ad5b4d", display: "inline-block", fontSize: 13, fontWeight: 700, marginTop: 8 }}>{result.correct === null ? "Awaiting instructor review" : result.correct ? "Correct" : "Review this answer"} · {result.awardedMarks} marks</span>}
                    </div>;
                  })}
                </div>
                {activeAttempt.status === "IN_PROGRESS" && <div style={{ alignItems: "center", display: "flex", gap: 14, marginTop: 22 }}>
                  <strong style={{ color: remainingSeconds !== null && remainingSeconds < 60 ? "#ad5b4d" : "#61718a" }}>
                    {remainingSeconds === null ? "No time limit" : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")} remaining`}
                  </strong>
                  <button onClick={() => void submitAssessment()} disabled={assessmentBusy === activeAttempt.id || remainingSeconds === 0} style={{ background: "#0f766e", border: 0, borderRadius: 9, color: "white", cursor: "pointer", fontWeight: 700, padding: "11px 16px" }} type="button">{assessmentBusy === activeAttempt.id ? "Submitting…" : "Submit assessment"}</button>
                </div>}
                {(activeAttempt.status === "SUBMITTED" || activeAttempt.status === "EXPIRED") && <button onClick={() => setActiveAttempt(null)} style={{ background: "transparent", border: "1px solid #c9d7e2", borderRadius: 9, color: "#12304a", cursor: "pointer", fontWeight: 700, marginTop: 22, padding: "10px 14px" }} type="button">Back to assessments</button>}
              </article>
            ) : assessments.length === 0 ? <div style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, color: "#61718a", padding: 24 }}>No published assessments are waiting for you.</div> : (
              <div style={{ display: "grid", gap: 16 }}>
                {assessments.map((assessment) => <article key={assessment.id} style={{ alignItems: "center", background: "white", border: "1px solid #d8e2eb", borderRadius: 16, display: "flex", gap: 16, justifyContent: "space-between", padding: "18px 20px" }}>
                  <div><p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{assessment.module_title} · {assessment.assessment_type.replaceAll("_", " ")}</p><h3 style={{ fontSize: 20, margin: "6px 0" }}>{assessment.title}</h3><span style={{ color: "#61718a", fontSize: 14 }}>{assessment.total_marks ?? "—"} marks · {assessment.attempt_limit ? `${assessment.attempt_limit} attempt${assessment.attempt_limit === 1 ? "" : "s"}` : "Attempts allowed"}</span></div>
                  <button onClick={() => void startAssessment(assessment)} disabled={Boolean(assessmentBusy)} style={{ background: "#0f766e", border: 0, borderRadius: 9, color: "white", cursor: "pointer", fontWeight: 700, padding: "11px 16px" }} type="button">{assessmentBusy === assessment.id ? "Starting…" : "Start assessment"}</button>
                </article>)}
              </div>
            )}
          </section>
        )}
        {!loading && !error && (
          <section style={{ marginTop: 28 }}>
            <div style={{ alignItems: "end", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ color: "#0f766e", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", margin: 0, textTransform: "uppercase" }}>Course work</p>
                <h2 style={{ fontSize: 28, margin: "6px 0 0" }}>Assignments</h2>
              </div>
              {submissionNotice && <span style={{ color: "#0f766e", fontSize: 14, fontWeight: 700 }}>{submissionNotice}</span>}
            </div>
            {submissionError && <div role="alert" style={{ background: "#fff8f5", border: "1px solid #f0c5b8", borderRadius: 12, color: "#ad5b4d", marginBottom: 16, padding: "12px 15px" }}>{submissionError}</div>}
            {assignments.length === 0 && <div style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, color: "#61718a", padding: 24 }}>No published assignments are waiting for you.</div>}
            {activeAssignmentId && assignments.some((assignment) => assignment.id === activeAssignmentId) && (() => {
              const assignment = assignments.find((item) => item.id === activeAssignmentId)!;
              const submission = submissions[assignment.id];
              return (
                <article style={{ background: "white", border: "1px solid #b9d9d4", borderRadius: 20, boxShadow: "0 12px 30px rgba(18, 48, 74, 0.06)", marginBottom: 16, padding: "24px 26px" }}>
                  <button onClick={() => { setActiveAssignmentId(null); setSubmissionValidation(""); }} style={{ background: "transparent", border: 0, color: "#0f766e", cursor: "pointer", fontWeight: 700, padding: 0 }} type="button">← Back to assignments</button>
                  <div style={{ alignItems: "start", display: "flex", gap: 16, justifyContent: "space-between", marginTop: 18 }}>
                    <div>
                      <p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{assignment.course_title} · {assignment.module_title}</p>
                      <h3 style={{ fontSize: 27, margin: "7px 0 8px" }}>{assignment.title}</h3>
                      {assignment.description && <p style={{ color: "#61718a", lineHeight: 1.55, margin: "0 0 12px" }}>{assignment.description}</p>}
                      <p style={{ color: "#526f8c", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{assignment.instructions}</p>
                    </div>
                    <div style={{ color: "#61718a", fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{assignment.max_marks} marks<br />{dueLabel(assignment.due_at)}</div>
                  </div>
                  {submission ? (
                    <div style={{ background: submission.status === "GRADED" ? "#eefbf7" : "#f5f8fb", borderRadius: 12, marginTop: 22, padding: "16px 18px" }}>
                      <strong style={{ color: submission.status === "GRADED" ? "#0f766e" : "#12304a" }}>{submission.status === "GRADED" ? `Graded: ${submission.grade}/${assignment.max_marks}` : "Submitted for instructor review"}</strong>
                      {submission.is_late && <span style={{ color: "#a06b22", marginLeft: 10 }}>Late submission</span>}
                      <p style={{ color: "#61718a", fontSize: 13, margin: "7px 0 0" }}>Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.submitted_at))}</p>
                      <p style={{ color: "#526f8c", lineHeight: 1.55, margin: "14px 0 0", whiteSpace: "pre-wrap" }}>{submission.submission_text}</p>
                      {submission.feedback && <p style={{ borderTop: "1px solid #d8e2eb", color: "#526f8c", lineHeight: 1.5, margin: "14px 0 0", paddingTop: 12 }}><strong>Instructor feedback:</strong> {submission.feedback}</p>}
                    </div>
                  ) : (
                    <div style={{ marginTop: 22 }}>
                      <label htmlFor="assignment-submission" style={{ display: "block", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Your submission</label>
                      <textarea id="assignment-submission" aria-describedby="assignment-submission-help" aria-invalid={Boolean(submissionValidation)} maxLength={20000} value={submissionText[assignment.id] || ""} onChange={(event) => { setSubmissionValidation(""); setSubmissionText((current) => ({ ...current, [assignment.id]: event.target.value })); }} placeholder="Write your work here…" style={{ border: `1px solid ${submissionValidation ? "#c86b5e" : "#d8e2eb"}`, borderRadius: 10, color: "#12304a", font: "inherit", minHeight: 170, padding: 12, resize: "vertical", width: "100%" }} />
                      <div id="assignment-submission-help" style={{ alignItems: "center", color: submissionValidation ? "#ad5b4d" : "#71879a", display: "flex", fontSize: 13, justifyContent: "space-between", marginTop: 7 }}>
                        <span>{submissionValidation || "Use up to 20,000 characters."}</span>
                        <span>{(submissionText[assignment.id] || "").length}/20,000</span>
                      </div>
                      <button onClick={() => void submitAssignment(assignment)} disabled={submittingId === assignment.id} style={{ background: "#0f766e", border: 0, borderRadius: 9, color: "white", cursor: "pointer", fontWeight: 700, marginTop: 13, padding: "11px 16px" }} type="button">{submittingId === assignment.id ? "Submitting…" : "Submit work"}</button>
                    </div>
                  )}
                </article>
              );
            })()}
            {assignments.length > 0 && <div style={{ display: "grid", gap: 16 }}>
              {assignments.map((assignment) => {
                const submission = submissions[assignment.id];
                return (
                  <article key={assignment.id} style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, padding: "22px 24px" }}>
                    <div style={{ alignItems: "start", display: "flex", gap: 16, justifyContent: "space-between" }}>
                      <div>
                        <p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{assignment.course_title} · {assignment.module_title}</p>
                        <h3 style={{ fontSize: 21, margin: "7px 0 5px" }}>{assignment.title}</h3>
                        <p style={{ color: "#61718a", fontSize: 14, lineHeight: 1.55, margin: 0 }}>{assignment.description || assignment.instructions}</p>
                      </div>
                      <div style={{ color: "#61718a", fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{assignment.max_marks} marks<br />{dueLabel(assignment.due_at)}</div>
                    </div>
                    {submission && (
                      <div style={{ background: submission.status === "GRADED" ? "#eefbf7" : "#f5f8fb", borderRadius: 12, color: "#526f8c", marginTop: 18, padding: "13px 15px" }}>
                        <strong style={{ color: submission.status === "GRADED" ? "#0f766e" : "#12304a" }}>{submission.status === "GRADED" ? `Graded: ${submission.grade}/${assignment.max_marks}` : "Submitted for review"}</strong>
                        {submission.is_late && <span style={{ color: "#a06b22", marginLeft: 10 }}>Late submission</span>}
                        {submission.feedback && <p style={{ lineHeight: 1.5, margin: "7px 0 0" }}>{submission.feedback}</p>}
                      </div>
                    )}
                    <button onClick={() => { setActiveAssignmentId(assignment.id); setSubmissionValidation(""); }} style={{ background: "transparent", border: "1px solid #c9d7e2", borderRadius: 9, color: "#0f766e", cursor: "pointer", fontWeight: 700, marginTop: 18, padding: "10px 14px" }} type="button">{submission ? "Open submission" : "Open assignment"}</button>
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