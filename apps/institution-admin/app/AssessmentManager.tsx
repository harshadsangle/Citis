"use client";

import { FormEvent, useEffect, useState } from "react";

type Assessment = {
  id: string;
  title: string;
  description?: string | null;
  assessment_type: string;
  total_marks?: number | null;
  passing_marks?: number | null;
  duration_minutes?: number | null;
  attempt_limit?: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  module_title?: string;
};
type Module = { id: string; title: string; sequence?: number; status: string };
type Question = {
  id: string;
  prompt: string;
  question_type: string;
  marks: number;
  sequence: number;
  options: Array<{ id: string; value: string; label: string; is_correct?: boolean }>;
};
type ReviewAttempt = {
  id: string;
  learner_id: string;
  learner_first_name?: string;
  learner_last_name?: string;
  learner_email?: string;
  attempt_number: number;
  score?: number | null;
  max_score?: number | null;
  passed?: boolean | null;
  grading_status: "NOT_REQUIRED" | "PENDING" | "GRADED";
  grading_feedback?: string | null;
  submitted_at: string;
};
type ReviewDetail = ReviewAttempt & {
  questions: Question[];
  answers: Array<{ question_id: string; answer_json: unknown; awarded_marks: number }>;
};
type ApiList<T> = { success: true; data: T[] };

const assessmentTypes = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
const questionTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];

async function request<T>(apiBase: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || "The request could not be completed.");
  return payload as T;
}

export default function AssessmentManager({ apiBase, courseId, courseLabel }: { apiBase: string; courseId: string; courseLabel: string }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviewAttempts, setReviewAttempts] = useState<ReviewAttempt[]>([]);
  const [activeReview, setActiveReview] = useState<ReviewDetail | null>(null);
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [form, setForm] = useState({ moduleId: "", title: "", type: "PRACTICE_QUIZ", totalMarks: "10", passingMarks: "5", attemptLimit: "1" });
  const [questionForm, setQuestionForm] = useState({ prompt: "", type: "SINGLE_CHOICE", marks: "1", sequence: "1", options: "a|Option A|false\nb|Option B|true" });
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [assessmentPayload, modulePayload] = await Promise.all([
        request<ApiList<Assessment>>(apiBase, `/assessments?courseId=${encodeURIComponent(courseId)}&page=1&pageSize=100`),
        request<ApiList<Module>>(apiBase, `/course-modules?courseId=${encodeURIComponent(courseId)}&page=1&pageSize=100`),
      ]);
      setAssessments(assessmentPayload.data);
      setModules(modulePayload.data);
      setForm((current) => ({ ...current, moduleId: current.moduleId || modulePayload.data[0]?.id || "" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load assessments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSelectedId("");
    setQuestions([]);
    setReviewAttempts([]);
    setActiveReview(null);
    setError("");
    void load();
    // The selected course is the isolation boundary for this editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadQuestions(id: string) {
    setSelectedId(id);
    setReviewAttempts([]);
    setActiveReview(null);
    setQuestionLoading(true);
    try {
      const payload = await request<{ success: true; data: Question[] }>(apiBase, `/assessments/${id}/questions`);
      setQuestions(payload.data);
      setQuestionForm((current) => ({ ...current, sequence: String(payload.data.length + 1) }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load questions.");
    } finally {
      setQuestionLoading(false);
    }
  }

  async function loadReviews(id: string) {
    setSelectedId(id);
    setReviewLoading(true);
    setError("");
    try {
      const payload = await request<ApiList<ReviewAttempt>>(apiBase, `/assessments/${id}/attempts?page=1&pageSize=100`);
      setReviewAttempts(payload.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load submitted attempts.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function openReview(attempt: ReviewAttempt) {
    setReviewLoading(true);
    setError("");
    try {
      const payload = await request<{ success: true; data: ReviewDetail }>(apiBase, `/assessment-attempts/${attempt.id}`);
      setActiveReview(payload.data);
      setGradeValues(Object.fromEntries(payload.data.questions.map((question) => {
        const answer = payload.data.answers.find((item) => item.question_id === question.id);
        return [question.id, String(answer?.awarded_marks ?? 0)];
      })));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to open this submitted attempt.");
    } finally {
      setReviewLoading(false);
    }
  }

  async function gradeReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeReview) return;
    setGrading(true);
    setError("");
    try {
      await request(apiBase, `/assessment-attempts/${activeReview.id}/grade`, {
        method: "PATCH",
        body: JSON.stringify({
          grades: activeReview.questions.map((question) => ({
            questionId: question.id,
            awardedMarks: Number(gradeValues[question.id] || 0),
          })),
          feedback: activeReview.grading_feedback || undefined,
        }),
      });
      setNotice("Attempt graded and learner progress updated.");
      setActiveReview(null);
      await loadReviews(selectedId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to grade this attempt.");
    } finally {
      setGrading(false);
    }
  }

  function updateForm(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await request(apiBase, "/assessments", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          moduleId: form.moduleId,
          title: form.title.trim(),
          assessmentType: form.type,
          totalMarks: Number(form.totalMarks),
          passingMarks: Number(form.passingMarks),
          attemptLimit: Number(form.attemptLimit),
        }),
      });
      setForm((current) => ({ ...current, title: "" }));
      setNotice("Assessment created as a draft.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the assessment.");
    } finally {
      setSaving(false);
    }
  }

  async function publish(assessment: Assessment) {
    setError("");
    try {
      await request(apiBase, `/assessments/${assessment.id}/publish`, { method: "POST" });
      setNotice(`${assessment.title} is now available to enrolled learners.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to publish the assessment.");
    }
  }

  async function createQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    const options = questionForm.options.split("\n").map((line) => {
      const [value = "", label = "", correct = "false"] = line.split("|");
      return { value: value.trim(), label: label.trim(), isCorrect: correct.trim().toLowerCase() === "true" };
    }).filter((option) => option.value && option.label);
    setSaving(true);
    setError("");
    try {
      await request(apiBase, `/assessments/${selectedId}/questions`, {
        method: "POST",
        body: JSON.stringify({
          prompt: questionForm.prompt.trim(),
          questionType: questionForm.type,
          marks: Number(questionForm.marks),
          sequence: Number(questionForm.sequence),
          options,
        }),
      });
      setNotice("Question added.");
      setQuestionForm((current) => ({ ...current, prompt: "", sequence: String(questions.length + 2) }));
      await loadQuestions(selectedId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the question.");
    } finally {
      setSaving(false);
    }
  }

  const selectedAssessment = assessments.find((assessment) => assessment.id === selectedId);

  return (
    <section className="relationship-panel">
      <div className="relationship-heading">
        <div>
          <div className="eyebrow">Course operations</div>
          <h2>Assessments</h2>
          <p>Build server-scored learning checks for <strong>{courseLabel}</strong>. Correct answers stay private until the learner submits.</p>
        </div>
        <div className="relationship-count"><strong>{loading ? "—" : assessments.length}</strong><span>Assessments</span></div>
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t complete that action</strong><p>{error}</p></div>}
      {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}

      <form className="relationship-add" onSubmit={(event) => void createAssessment(event)}>
        <div><h3>Create an assessment</h3><p>New assessments start as drafts until their questions are ready.</p></div>
        <div className="relationship-controls">
          <select aria-label="Assessment module" value={form.moduleId} onChange={(event) => updateForm("moduleId", event.target.value)} required>
            <option value="">Choose a module</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.sequence ? `${module.sequence}. ` : ""}{module.title}</option>)}
          </select>
          <input aria-label="Assessment title" value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Assessment title" required />
          <select aria-label="Assessment type" value={form.type} onChange={(event) => updateForm("type", event.target.value)}>{assessmentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select>
          <input aria-label="Total marks" min="0" step="0.01" type="number" value={form.totalMarks} onChange={(event) => updateForm("totalMarks", event.target.value)} placeholder="Total marks" required />
          <input aria-label="Passing marks" min="0" step="0.01" type="number" value={form.passingMarks} onChange={(event) => updateForm("passingMarks", event.target.value)} placeholder="Passing marks" required />
          <input aria-label="Attempt limit" min="1" type="number" value={form.attemptLimit} onChange={(event) => updateForm("attemptLimit", event.target.value)} placeholder="Attempts" required />
          <button className="primary-button" type="submit" disabled={saving || !form.moduleId}>{saving ? "Creating…" : "Create assessment"}</button>
        </div>
      </form>

      <div className="relationship-list">
        <div className="relationship-list-heading"><span>Assessment</span><span>Details</span><span>Action</span></div>
        {!loading && assessments.length === 0 && <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No assessments yet</strong><p>Create the first assessment for this course.</p></div></div>}
        {loading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading assessments…</strong><p>Checking the course-scoped authoring workspace.</p></div></div>}
        {!loading && assessments.map((assessment) => (
          <div className="relationship-row" key={assessment.id}>
            <div className="relationship-person"><div className="record-avatar">Q</div><strong>{assessment.title}</strong></div>
            <span>{assessment.module_title || "Module"} · {assessment.assessment_type.replaceAll("_", " ")} · {assessment.total_marks ?? "—"} marks</span>
            <div className="relationship-actions">
              <span className={`status-badge ${assessment.status.toLowerCase()}`}><span />{assessment.status.toLowerCase()}</span>
              <button className="text-button" type="button" onClick={() => void loadQuestions(assessment.id)}>Questions</button>
              <button className="text-button" type="button" onClick={() => void loadReviews(assessment.id)}>Review attempts</button>
              {assessment.status === "DRAFT" && <button className="text-button" type="button" onClick={() => void publish(assessment)}>Publish</button>}
            </div>
          </div>
        ))}
      </div>

      {selectedAssessment && (
        <div className="relationship-list" style={{ marginTop: 24 }}>
          <div className="relationship-list-heading"><span>Questions for {selectedAssessment.title}</span><span>Options</span><span>Marks</span></div>
          {questionLoading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading questions…</strong></div></div>}
          {!questionLoading && questions.map((question) => (
            <div className="relationship-row" key={question.id}>
              <div><strong>{question.sequence}. {question.prompt}</strong><span>{question.question_type.replaceAll("_", " ")}</span></div>
              <span>{question.options.map((option) => `${option.label}${option.is_correct ? " ✓" : ""}`).join(" · ")}</span>
              <span>{question.marks} marks</span>
            </div>
          ))}
          {!questionLoading && <form className="relationship-add" onSubmit={(event) => void createQuestion(event)}>
            <div><h3>Add a question</h3><p>Use one option per line: value|label|true or value|label|false.</p></div>
            <div className="relationship-controls">
              <textarea aria-label="Question prompt" value={questionForm.prompt} onChange={(event) => setQuestionForm((current) => ({ ...current, prompt: event.target.value }))} placeholder="Question prompt" required />
              <select aria-label="Question type" value={questionForm.type} onChange={(event) => setQuestionForm((current) => ({ ...current, type: event.target.value }))}>{questionTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select>
              <input aria-label="Question marks" min="0.01" step="0.01" type="number" value={questionForm.marks} onChange={(event) => setQuestionForm((current) => ({ ...current, marks: event.target.value }))} required />
              <input aria-label="Question sequence" min="1" type="number" value={questionForm.sequence} onChange={(event) => setQuestionForm((current) => ({ ...current, sequence: event.target.value }))} required />
              <textarea aria-label="Question options" value={questionForm.options} onChange={(event) => setQuestionForm((current) => ({ ...current, options: event.target.value }))} rows={4} />
              <button className="primary-button" type="submit" disabled={saving}>{saving ? "Adding…" : "Add question"}</button>
            </div>
          </form>}
        </div>
      )}

      {selectedAssessment && (
        <div className="relationship-list" style={{ marginTop: 24 }}>
          <div className="relationship-list-heading"><span>Submitted attempts</span><span>Result</span><span>Action</span></div>
          {reviewLoading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading submitted attempts…</strong></div></div>}
          {!reviewLoading && reviewAttempts.length === 0 && <div className="relationship-empty"><div className="state-symbol soft">✓</div><div><strong>No submitted attempts yet</strong><p>Learner submissions will appear here after they complete this assessment.</p></div></div>}
          {!reviewLoading && reviewAttempts.map((attempt) => (
            <div className="relationship-row" key={attempt.id}>
              <div className="relationship-person"><div className="record-avatar">L</div><strong>{[attempt.learner_first_name, attempt.learner_last_name].filter(Boolean).join(" ") || attempt.learner_email || "Learner"}</strong><span>Attempt {attempt.attempt_number}</span></div>
              <span>{attempt.grading_status === "PENDING" ? "Awaiting instructor grade" : `${attempt.score ?? "—"}/${attempt.max_score ?? "—"}${attempt.passed === null || attempt.passed === undefined ? "" : attempt.passed ? " · Passed" : " · Not passed"}`}</span>
              <div className="relationship-actions"><span className={`status-badge ${attempt.grading_status.toLowerCase()}`}><span />{attempt.grading_status === "PENDING" ? "Needs grading" : attempt.grading_status === "GRADED" ? "Graded" : "Auto-scored"}</span><button className="text-button" type="button" onClick={() => void openReview(attempt)}>Open</button></div>
            </div>
          ))}
          {activeReview && (
            <form className="relationship-add" onSubmit={(event) => void gradeReview(event)}>
              <div>
                <h3>Review attempt</h3>
                <p>{[activeReview.learner_first_name, activeReview.learner_last_name].filter(Boolean).join(" ") || activeReview.learner_email} · Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(activeReview.submitted_at))}</p>
              </div>
              <div className="relationship-controls">
                {activeReview.questions.map((question) => {
                  const answer = activeReview.answers.find((item) => item.question_id === question.id);
                  return <label key={question.id}>{question.prompt}<span style={{ color: "#61718a", display: "block", fontSize: 13, margin: "5px 0" }}>Learner answer: {typeof answer?.answer_json === "string" ? answer.answer_json : JSON.stringify(answer?.answer_json ?? "")}</span><input aria-label={`Marks for ${question.prompt}`} type="number" min="0" max={question.marks} step="0.01" value={gradeValues[question.id] || "0"} onChange={(event) => setGradeValues((current) => ({ ...current, [question.id]: event.target.value }))} disabled={activeReview.grading_status !== "PENDING"} /></label>;
                })}
                <textarea aria-label="Instructor feedback" placeholder="Feedback for the learner (optional)" value={activeReview.grading_feedback || ""} onChange={(event) => setActiveReview((current) => current ? { ...current, grading_feedback: event.target.value } : current)} disabled={activeReview.grading_status !== "PENDING"} />
                <div className="relationship-actions"><button className="secondary-button" type="button" onClick={() => setActiveReview(null)}>Close</button>{activeReview.grading_status === "PENDING" && <button className="primary-button" type="submit" disabled={grading}>{grading ? "Saving grade…" : "Save grade"}</button>}</div>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}