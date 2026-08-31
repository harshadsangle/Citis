"use client";

import { useEffect, useState } from "react";

type Progress = {
  course: { id: string; title: string; code: string; description?: string | null };
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
  }>;
};

type Assignment = {
  id: string;
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

const stateLabel: Record<Progress["state"], string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

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
  const [submissions, setSubmissions] = useState<Record<string, Submission | null>>({});
  const [submissionText, setSubmissionText] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/v1/progress", { credentials: "include" }), fetch("/api/v1/assignments", { credentials: "include" })])
      .then(async ([progressResponse, assignmentResponse]) => {
        if (!progressResponse.ok || !assignmentResponse.ok) {
          const response = !progressResponse.ok ? progressResponse : assignmentResponse;
          const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
          throw new Error(body?.error?.message || "We couldn't load your learning progress.");
        }
        return Promise.all([
          progressResponse.json() as Promise<{ data: Progress[] }>,
          assignmentResponse.json() as Promise<{ data: Assignment[] }>,
        ]);
      })
      .then(async ([progressBody, assignmentBody]) => {
        if (!active) return;
        setCourses(progressBody.data || []);
        setAssignments(assignmentBody.data || []);
        const submissionEntries = await Promise.all((assignmentBody.data || []).map(async (assignment) => {
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
  }, []);

  async function submitAssignment(assignment: Assignment) {
    const text = (submissionText[assignment.id] || "").trim();
    if (!text) return;
    setSubmittingId(assignment.id);
    setError("");
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
      setError(reason instanceof Error ? reason.message : "We couldn't submit this assignment.");
    } finally {
      setSubmittingId("");
    }
  }

  function dueLabel(value?: string | null) {
    return value ? `Due ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))}` : "No due date";
  }

  return (
    <main style={{ background: "#f5f8fb", color: "#12304a", fontFamily: "Arial, sans-serif", minHeight: "100vh", padding: "48px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1040 }}>
        <p style={{ color: "#0f766e", fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", margin: 0, textTransform: "uppercase" }}>CITIS learning portal</p>
        <header style={{ alignItems: "end", display: "flex", gap: 24, justifyContent: "space-between", margin: "12px 0 32px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-0.04em", margin: 0 }}>Your learning progress</h1>
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
                    <h3 style={{ fontSize: 16, margin: 0 }}>Module progress</h3>
                    {progress.modules.map((module) => (
                      <div key={module.id}>
                        <div style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between", marginBottom: 7 }}>
                          <span style={{ fontWeight: 700 }}>{module.sequence}. {module.title}</span>
                          <span style={{ color: "#61718a", fontSize: 13 }}>{module.percentage}% · {stateLabel[module.state]}</span>
                        </div>
                        <ProgressBar percentage={module.percentage} />
                        <p style={{ color: "#71879a", fontSize: 13, margin: "7px 0 0" }}>{module.lessons.completed}/{module.lessons.total} lessons · {module.assessments.completed}/{module.assessments.total} assessments</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
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
            {assignments.length === 0 && <div style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, color: "#61718a", padding: 24 }}>No published assignments are waiting for you.</div>}
            {assignments.length > 0 && <div style={{ display: "grid", gap: 16 }}>
              {assignments.map((assignment) => {
                const submission = submissions[assignment.id];
                return (
                  <article key={assignment.id} style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, padding: "22px 24px" }}>
                    <div style={{ alignItems: "start", display: "flex", gap: 16, justifyContent: "space-between" }}>
                      <div>
                        <p style={{ color: "#6b8194", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>{assignment.course_title} · {assignment.module_title}</p>
                        <h3 style={{ fontSize: 21, margin: "7px 0 5px" }}>{assignment.title}</h3>
                        <p style={{ color: "#61718a", fontSize: 14, lineHeight: 1.55, margin: 0 }}>{assignment.instructions}</p>
                      </div>
                      <div style={{ color: "#61718a", fontSize: 13, textAlign: "right", whiteSpace: "nowrap" }}>{assignment.max_marks} marks<br />{dueLabel(assignment.due_at)}</div>
                    </div>
                    {submission ? (
                      <div style={{ background: submission.status === "GRADED" ? "#eefbf7" : "#f5f8fb", borderRadius: 12, color: "#526f8c", marginTop: 18, padding: "13px 15px" }}>
                        <strong style={{ color: submission.status === "GRADED" ? "#0f766e" : "#12304a" }}>{submission.status === "GRADED" ? `Graded: ${submission.grade}/${assignment.max_marks}` : "Submitted for review"}</strong>
                        {submission.is_late && <span style={{ color: "#a06b22", marginLeft: 10 }}>Late submission</span>}
                        {submission.feedback && <p style={{ lineHeight: 1.5, margin: "7px 0 0" }}>{submission.feedback}</p>}
                      </div>
                    ) : (
                      <div style={{ marginTop: 18 }}>
                        <textarea aria-label={`Submission for ${assignment.title}`} value={submissionText[assignment.id] || ""} onChange={(event) => setSubmissionText((current) => ({ ...current, [assignment.id]: event.target.value }))} placeholder="Write your submission here…" style={{ border: "1px solid #d8e2eb", borderRadius: 10, color: "#12304a", font: "inherit", minHeight: 105, padding: 12, resize: "vertical", width: "100%" }} />
                        <button onClick={() => void submitAssignment(assignment)} disabled={submittingId === assignment.id || !(submissionText[assignment.id] || "").trim()} style={{ background: "#0f766e", border: 0, borderRadius: 9, color: "white", cursor: "pointer", fontWeight: 700, marginTop: 10, padding: "11px 16px" }} type="button">{submittingId === assignment.id ? "Submitting…" : "Submit assignment"}</button>
                      </div>
                    )}
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