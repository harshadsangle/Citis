"use client";

import { FormEvent, useEffect, useState } from "react";

type Assignment = {
  id: string;
  title: string;
  instructions: string;
  description?: string | null;
  module_id: string;
  module_title?: string;
  due_at?: string | null;
  max_marks: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type Module = { id: string; title: string; status: string; sequence?: number };
type Submission = {
  id: string;
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
type ApiList<T> = { success: true; data: T[]; meta: { pagination: { total: number } } };

async function request<T>(apiBase: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "The request could not be completed.");
  }
  return payload as T;
}

function formatDueDate(value?: string | null) {
  if (!value) return "No due date";
  return `Due ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))}`;
}

export default function AssignmentManager({ apiBase, courseId, courseLabel }: { apiBase: string; courseId: string; courseLabel: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [form, setForm] = useState({ moduleId: "", title: "", instructions: "", description: "", dueAt: "", maxMarks: "100" });
  const [gradeForms, setGradeForms] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [assignmentPayload, modulePayload] = await Promise.all([
        request<ApiList<Assignment>>(apiBase, `/assignments?courseId=${encodeURIComponent(courseId)}&page=1&pageSize=100`),
        request<ApiList<Module>>(apiBase, `/course-modules?courseId=${encodeURIComponent(courseId)}&status=PUBLISHED&page=1&pageSize=100`),
      ]);
      setAssignments(assignmentPayload.data);
      setModules(modulePayload.data);
      setForm((current) => ({ ...current, moduleId: current.moduleId || modulePayload.data[0]?.id || "" }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setError("");
    setNotice("");
    setSelectedId("");
    void load();
    // The course defines this isolated management view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadSubmissions(id: string) {
    setSelectedId(id);
    setSubmissionsLoading(true);
    setError("");
    try {
      const payload = await request<ApiList<Submission>>(apiBase, `/assignments/${id}/submissions?page=1&pageSize=100`);
      setSubmissions(payload.data);
      setGradeForms(Object.fromEntries(payload.data.map((submission) => [submission.id, {
        grade: submission.grade === null || submission.grade === undefined ? "" : String(submission.grade),
        feedback: submission.feedback || "",
      }])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load submissions.");
    } finally {
      setSubmissionsLoading(false);
    }
  }

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await request(apiBase, "/assignments", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          moduleId: form.moduleId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          instructions: form.instructions.trim(),
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
          maxMarks: Number(form.maxMarks),
        }),
      });
      setForm((current) => ({ ...current, title: "", instructions: "", description: "", dueAt: "" }));
      setNotice("Assignment created as a draft.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create the assignment.");
    } finally {
      setSaving(false);
    }
  }

  async function publishAssignment(assignment: Assignment) {
    setError("");
    try {
      await request(apiBase, `/assignments/${assignment.id}/publish`, { method: "POST" });
      setNotice(`${assignment.title} is now available to learners.`);
      await load();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Unable to publish the assignment.");
    }
  }

  async function gradeSubmission(assignment: Assignment, submission: Submission) {
    const values = gradeForms[submission.id];
    if (!values?.grade) return;
    setSaving(true);
    setError("");
    try {
      await request(apiBase, `/assignments/${assignment.id}/submissions/${submission.id}/grade`, {
        method: "PATCH",
        body: JSON.stringify({ grade: Number(values.grade), feedback: values.feedback.trim() || undefined }),
      });
      setNotice("Submission graded and learner progress updated.");
      await loadSubmissions(assignment.id);
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : "Unable to grade this submission.");
    } finally {
      setSaving(false);
    }
  }

  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedId);

  return (
    <section className="relationship-panel">
      <div className="relationship-heading">
        <div>
          <div className="eyebrow">Course operations</div>
          <h2>Assignments</h2>
          <p>Create publishable work for <strong>{courseLabel}</strong>, then review learner submissions and record grades.</p>
        </div>
        <div className="relationship-count"><strong>{loading ? "—" : assignments.length}</strong><span>Assignments</span></div>
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t complete that action</strong><p>{error}</p></div>}
      {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}

      <form className="relationship-add" onSubmit={(event) => void createAssignment(event)}>
        <div>
          <h3>Create an assignment</h3>
          <p>New assignments start as drafts until you publish them.</p>
        </div>
        <div className="relationship-controls">
          <select aria-label="Assignment module" value={form.moduleId} onChange={(event) => updateForm("moduleId", event.target.value)} required>
            <option value="">Choose a published module</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.sequence ? `${module.sequence}. ` : ""}{module.title}</option>)}
          </select>
          <input aria-label="Assignment title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Assignment title" required />
          <input aria-label="Maximum marks" inputMode="decimal" min="0.01" step="0.01" type="number" value={form.maxMarks} onChange={(event) => updateForm("maxMarks", event.target.value)} placeholder="Max marks" required />
          <input aria-label="Due date" type="datetime-local" value={form.dueAt} onChange={(event) => updateForm("dueAt", event.target.value)} />
          <textarea aria-label="Assignment instructions" value={form.instructions} onChange={(event) => updateForm("instructions", event.target.value)} placeholder="Instructions for learners" required />
          <button className="primary-button" type="submit" disabled={saving || !form.moduleId}>{saving ? "Creating…" : "Create assignment"}</button>
        </div>
      </form>

      <div className="relationship-list">
        <div className="relationship-list-heading"><span>Assignment</span><span>Details</span><span>Action</span></div>
        {!loading && assignments.length === 0 && <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No assignments yet</strong><p>Create the first assignment for this course.</p></div></div>}
        {loading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading assignments…</strong><p>Checking the course-scoped assignment workspace.</p></div></div>}
        {!loading && assignments.map((assignment) => (
          <div className="relationship-row" key={assignment.id}>
            <div className="relationship-person"><div className="record-avatar">A</div><strong>{assignment.title}</strong></div>
            <span>{assignment.module_title || "Module"} · {assignment.max_marks} marks · {formatDueDate(assignment.due_at)}</span>
            <div className="relationship-actions">
              <span className={`status-badge ${assignment.status.toLowerCase()}`}><span />{assignment.status.toLowerCase()}</span>
              {assignment.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publishAssignment(assignment)}>Publish</button>}
              {assignment.status === "PUBLISHED" && <button className="text-button" type="button" onClick={() => void loadSubmissions(assignment.id)}>Review</button>}
            </div>
          </div>
        ))}
      </div>

      {selectedAssignment && (
        <div className="relationship-list" style={{ marginTop: 24 }}>
          <div className="relationship-list-heading"><span>Submissions for {selectedAssignment.title}</span><span>Learner work</span><span>Grade</span></div>
          {submissionsLoading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading submissions…</strong><p>Reading this course-scoped review queue.</p></div></div>}
          {!submissionsLoading && submissions.length === 0 && <div className="relationship-empty"><div className="state-symbol soft">—</div><div><strong>No submissions yet</strong><p>Learner work will appear here after the assignment is submitted.</p></div></div>}
          {!submissionsLoading && submissions.map((submission) => (
            <div className="relationship-row assignment-review-row" key={submission.id}>
              <div><strong>{`${submission.learner_first_name || ""} ${submission.learner_last_name || ""}`.trim() || "Unnamed learner"}</strong><span>{submission.learner_email || ""} · {submission.is_late ? "Late" : "On time"}</span></div>
              <div><p className="submission-copy">{submission.submission_text}</p>{submission.attachment_url && <a href={submission.attachment_url} target="_blank" rel="noreferrer">Open attachment</a>}</div>
              <div className="grade-controls">
                <input aria-label={`Grade submission from ${submission.learner_first_name || "learner"}`} inputMode="decimal" min="0" max={selectedAssignment.max_marks} step="0.01" value={gradeForms[submission.id]?.grade || ""} onChange={(event) => setGradeForms((current) => ({ ...current, [submission.id]: { ...current[submission.id], grade: event.target.value } }))} placeholder={`/${selectedAssignment.max_marks}`} />
                <input aria-label="Feedback" value={gradeForms[submission.id]?.feedback || ""} onChange={(event) => setGradeForms((current) => ({ ...current, [submission.id]: { ...current[submission.id], feedback: event.target.value } }))} placeholder="Feedback (optional)" />
                <button className="text-button" type="button" onClick={() => void gradeSubmission(selectedAssignment, submission)} disabled={saving || !gradeForms[submission.id]?.grade}>{submission.status === "GRADED" ? "Update grade" : "Save grade"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}