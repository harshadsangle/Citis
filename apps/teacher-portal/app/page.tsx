"use client";

import { useEffect, useState } from "react";

type Principal = { firstName?: string; lastName?: string };
type ApiList = { data?: unknown[]; meta?: { pagination?: { total?: number } } };

async function count(path: string) {
  const response = await fetch(`/api/v1/${path}?page=1&pageSize=1`, { credentials: "include" });
  if (!response.ok) return 0;
  const body = await response.json() as ApiList;
  return body.meta?.pagination?.total ?? body.data?.length ?? 0;
}

export default function TeacherPortalPage() {
  const [name, setName] = useState("Instructor");
  const [summary, setSummary] = useState({ courses: 0, assignments: 0, assessments: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/auth/me", { credentials: "include" }).then((response) => response.json()),
      count("courses"),
      count("assignments"),
      count("assessments"),
    ]).then(([principal, courses, assignments, assessments]) => {
      const user = principal.data as Principal | undefined;
      setName([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Instructor");
      setSummary({ courses, assignments, assessments });
    }).catch(() => undefined);
  }, []);

  const items = [
    { label: "Assigned courses", value: summary.courses, copy: "Courses available within your teaching scope." },
    { label: "Assignments", value: summary.assignments, copy: "Published work and learner submissions to review." },
    { label: "Assessments", value: summary.assessments, copy: "Knowledge checks and practical assessments in your scope." },
  ];

  return (
    <main style={{ background: "linear-gradient(145deg, #f5f9ff, #eef8f5)", color: "#12304a", fontFamily: "Arial, sans-serif", minHeight: "100vh", padding: "56px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1040 }}>
        <p style={{ color: "#0f766e", fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", margin: 0, textTransform: "uppercase" }}>CITIS instructor portal</p>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", letterSpacing: "-0.04em", margin: "14px 0 0" }}>Welcome, {name}</h1>
        <p style={{ color: "#61718a", fontSize: 17, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 680 }}>Review your teaching workload, open assigned learning content, and move into assessment and assignment review from one secure workspace.</p>
        <section style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", marginTop: 38 }}>
          {items.map((item) => <article key={item.label} style={{ background: "white", border: "1px solid #d8e2eb", borderRadius: 20, boxShadow: "0 14px 34px rgba(18,48,74,.07)", padding: 26 }}><strong style={{ color: "#0f766e", fontSize: 34 }}>{item.value}</strong><h2 style={{ fontSize: 20, margin: "12px 0 8px" }}>{item.label}</h2><p style={{ color: "#61718a", lineHeight: 1.55, margin: 0 }}>{item.copy}</p></article>)}
        </section>
        <section style={{ background: "#12304a", borderRadius: 22, color: "white", marginTop: 28, padding: 28 }}>
          <p style={{ color: "#9bd9ca", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", margin: 0, textTransform: "uppercase" }}>Instructor workspace</p>
          <h2 style={{ fontSize: 25, margin: "9px 0" }}>Course delivery tools are connected</h2>
          <p style={{ color: "#cfdae4", lineHeight: 1.6, margin: 0 }}>Your role already authorizes scoped course, assignment, assessment, learner-attempt, and grading APIs. Full instructor workflow screens can build on this dashboard without changing authentication.</p>
        </section>
      </div>
    </main>
  );
}