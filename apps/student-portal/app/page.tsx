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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/progress", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
          throw new Error(body?.error?.message || "We couldn't load your learning progress.");
        }
        return response.json() as Promise<{ data: Progress[] }>;
      })
      .then((body) => {
        if (active) setCourses(body.data || []);
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
            <a href="/auth/login?callbackUrl=%2F" style={{ color: "#0f766e", display: "inline-block", fontWeight: 700, marginTop: 18 }}>Sign in to continue</a>
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
      </div>
    </main>
  );
}