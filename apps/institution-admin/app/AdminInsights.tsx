"use client";

import { useEffect, useMemo, useState } from "react";

type InsightMode = "certificates" | "reports";
type CertificateStatus = "NOT_ELIGIBLE" | "ELIGIBLE_FOR_REVIEW" | "APPROVED" | "REJECTED" | "ISSUED" | "REVOKED";
type ReportName = "students" | "activity" | "progress" | "assessments" | "assignments" | "certificates" | "payments" | "refunds";

type Certificate = {
  id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  verification_id: string;
  learner_name: string;
  course_title: string;
  course_code: string;
  institution_name: string | null;
  completion_date: string | null;
  eligible_at: string | null;
  issue_date: string | null;
  issued_at: string | null;
  status: CertificateStatus;
  approved_at: string | null;
  review_notes: string | null;
  rejection_notes: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  document_format: string | null;
};

type ReportRow = Record<string, unknown>;
type AuditRow = { id: string; resource_id: string; action: string; created_at: string; new_value?: Record<string, unknown> | null };
type ApiEnvelope<T> = { success: true; data: T };
type ApiList<T> = { success: true; data: T[]; meta?: { pagination?: { total?: number; totalPages?: number } } };

const statuses: CertificateStatus[] = ["NOT_ELIGIBLE", "ELIGIBLE_FOR_REVIEW", "APPROVED", "REJECTED", "ISSUED", "REVOKED"];
const reports: Array<{ name: ReportName; label: string; description: string; dateField: string }> = [
  { name: "students", label: "Students", description: "Learner accounts, type, institution, and activity dates.", dateField: "created_at" },
  { name: "activity", label: "Activity / login", description: "Learner events and recent platform activity.", dateField: "created_at" },
  { name: "progress", label: "Course progress", description: "Enrollment progress and completion across courses.", dateField: "enrolled_at" },
  { name: "assessments", label: "Assessments", description: "Attempts, scores, pass states, and submissions.", dateField: "submitted_at" },
  { name: "assignments", label: "Assignments", description: "Submissions, grades, review states, and outcomes.", dateField: "submitted_at" },
  { name: "certificates", label: "Certificates", description: "Certificate lifecycle, completion, and issue dates.", dateField: "issue_date" },
  { name: "payments", label: "Payments", description: "Course purchases, amounts, and capture states.", dateField: "created_at" },
  { name: "refunds", label: "Refunds", description: "Refund requests, amounts, reasons, and processing.", dateField: "created_at" },
];

const reportColumns: Record<ReportName, string[]> = {
  students: ["id", "student_type", "institution_name", "college_user_id", "status", "created_at", "last_login_at"],
  activity: ["event_type", "resource_type", "student_name", "metadata", "created_at"],
  progress: ["student_name", "student_type", "institution_name", "course_title", "enrollment_status", "progress_percent", "enrolled_at", "completed_at"],
  assessments: ["student_name", "course_title", "assessment_title", "attempt_status", "score", "passed", "submitted_at"],
  assignments: ["student_name", "course_title", "assignment_title", "submission_status", "grade", "passed", "submitted_at", "graded_at"],
  certificates: ["certificate_number", "status", "student_name", "course_title", "completion_date", "approved_at", "issue_date", "revoked_at"],
  payments: ["student_name", "course_title", "amount_minor", "currency", "status", "created_at", "captured_at"],
  refunds: ["student_name", "course_title", "payment_id", "amount_minor", "status", "reason", "created_at", "processed_at"],
};

const labels: Record<string, string> = {
  id: "ID", student_type: "Student type", institution_name: "Institution", college_user_id: "College ID",
  status: "Status", created_at: "Created", last_login_at: "Last login", event_type: "Event", resource_type: "Resource",
  student_name: "Student", metadata: "Details", course_title: "Course", enrollment_status: "Enrollment",
  progress_percent: "Progress", enrolled_at: "Enrolled", completed_at: "Completed", assessment_title: "Assessment",
  attempt_status: "Attempt", score: "Score", passed: "Passed", submitted_at: "Submitted", assignment_title: "Assignment",
  submission_status: "Submission", grade: "Grade", graded_at: "Graded", certificate_number: "Certificate ID",
  completion_date: "Completed", approved_at: "Approved", issue_date: "Issued", revoked_at: "Revoked",
  amount_minor: "Amount", currency: "Currency", captured_at: "Captured", payment_id: "Payment", reason: "Reason",
  processed_at: "Processed",
};

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function displayValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") return "—";
  if (key.endsWith("_at") || key.endsWith("_date")) return formatDate(value);
  if (key === "amount_minor") return `₹${(Number(value) / 100).toLocaleString("en-IN")}`;
  if (typeof value === "boolean") return value ? "Passed" : "Not passed";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function statusClass(status: string) {
  return `insight-status insight-status-${status.toLowerCase().replaceAll("_", "-")}`;
}

function queryString(filters: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });
  return params.toString();
}

function requestJson<T>(apiBase: string, path: string, init?: RequestInit) {
  return fetch(`${apiBase}${path}`, {
    ...init,
    credentials: "include",
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  }).then(async (response) => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof payload?.message === "string" ? payload.message : typeof payload?.error === "string" ? payload.error : "The request could not be completed.";
      throw new Error(message);
    }
    return payload as T;
  });
}

function SectionHeader({ mode, onModeChange }: { mode: InsightMode; onModeChange: (mode: InsightMode) => void }) {
  return (
    <div className="insights-heading">
      <div>
        <div className="eyebrow">Admin operations</div>
        <h1>{mode === "certificates" ? "Certificate review" : "Reports & exports"}</h1>
        <p>{mode === "certificates" ? "Review verified completion outcomes before certificates are issued." : "Explore scoped learning, activity, finance, and certificate data."}</p>
      </div>
      <div className="insights-switcher" role="tablist" aria-label="Admin operations">
        <button className={mode === "certificates" ? "active" : ""} type="button" onClick={() => onModeChange("certificates")}>Certificates</button>
        <button className={mode === "reports" ? "active" : ""} type="button" onClick={() => onModeChange("reports")}>Reports</button>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="insight-state insight-state-error"><strong>We couldn’t load this workspace</strong><p>{message}</p><button className="secondary-button" type="button" onClick={onRetry}>Try again</button></div>;
}

function CertificateReview({ apiBase }: { apiBase: string }) {
  const [items, setItems] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [filters, setFilters] = useState({ status: "ELIGIBLE_FOR_REVIEW", institutionId: "", studentId: "", courseId: "", dateFrom: "", dateTo: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<{ progress: ReportRow[]; assessments: ReportRow[]; assignments: ReportRow[]; history: AuditRow[] }>({ progress: [], assessments: [], assignments: [], history: [] });
  const pageSize = 8;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const query = queryString(filters);
      const payload = await requestJson<ApiEnvelope<Certificate[]>>(apiBase, `/certificate-review${query ? `?${query}` : ""}`);
      setItems(payload.data);
      setPage(1);
      if (selected) {
        const next = payload.data.find((item) => item.id === selected.id);
        setSelected(next || null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load certificate review.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [filters.status, filters.institutionId, filters.studentId, filters.courseId, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    if (!selected) {
      setDetail({ progress: [], assessments: [], assignments: [], history: [] });
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    Promise.all([
      requestJson<ApiEnvelope<{ data: ReportRow[] }>>(apiBase, `/reports/progress?${queryString({ studentId: selected.enrollment_id ? selected.id ? "" : "" : "", courseId: selected.course_id, dateFrom: "", dateTo: "" })}`).catch(() => ({ data: [] })),
      requestJson<ApiEnvelope<{ data: ReportRow[] }>>(apiBase, `/reports/assessments?${queryString({ studentId: selected.id ? "" : "", courseId: selected.course_id })}`).catch(() => ({ data: [] })),
      requestJson<ApiEnvelope<{ data: ReportRow[] }>>(apiBase, `/reports/assignments?${queryString({ studentId: selected.id ? "" : "", courseId: selected.course_id })}`).catch(() => ({ data: [] })),
      requestJson<ApiList<AuditRow>>(apiBase, `/audit-logs?resource=certificate&page=1&pageSize=100`).catch(() => ({ data: [] })),
    ]).then(([progress, assessments, assignments, history]) => {
      if (cancelled) return;
      setDetail({
        progress: progress.data?.data || [],
        assessments: assessments.data?.data || [],
        assignments: assignments.data?.data || [],
        history: (history.data || []).filter((entry) => entry.resource_id === selected.id),
      });
    }).finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [apiBase, selected?.id, selected?.course_id]);

  const visible = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filters.dateFrom && item.completion_date && item.completion_date.slice(0, 10) < filters.dateFrom) return false;
      if (filters.dateTo && item.completion_date && item.completion_date.slice(0, 10) > filters.dateTo) return false;
      if (!normalized) return true;
      return [item.learner_name, item.course_title, item.course_code, item.certificate_number, item.status].join(" ").toLowerCase().includes(normalized);
    });
  }, [filters.dateFrom, filters.dateTo, items, search]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function action(actionName: "approve" | "reject" | "issue" | "revoke") {
    if (!selected) return;
    if ((actionName === "reject" || actionName === "revoke") && !notes.trim()) {
      setError(actionName === "reject" ? "Add review notes before rejecting a certificate." : "Add a reason before revoking a certificate.");
      return;
    }
    if (actionName === "revoke" && !window.confirm(`Revoke ${selected.certificate_number}? This will invalidate public verification.`)) return;
    setBusy(actionName);
    setError("");
    try {
      await requestJson<ApiEnvelope<Certificate>>(apiBase, `/certificates/${selected.id}/${actionName}`, {
        method: "POST",
        body: JSON.stringify(actionName === "approve" || actionName === "reject" || actionName === "revoke" ? { notes: notes.trim() } : {}),
      });
      setNotes("");
      await load();
      const refreshed = await requestJson<ApiEnvelope<Certificate>>(apiBase, `/certificates/${selected.id}`);
      setSelected(refreshed.data);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The certificate action could not be completed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="insights-layout">
      <div className="insight-toolbar">
        <div className="insight-search"><span aria-hidden="true">⌕</span><input aria-label="Search certificates" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search student, course, or certificate ID" /></div>
        <select aria-label="Certificate status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
        <button className="secondary-button" type="button" onClick={() => void load()}>Refresh</button>
      </div>
      <div className="insight-filters">
        <input aria-label="Institution ID filter" value={filters.institutionId} onChange={(event) => updateFilter("institutionId", event.target.value)} placeholder="Institution ID (optional)" />
        <input aria-label="Student ID filter" value={filters.studentId} onChange={(event) => updateFilter("studentId", event.target.value)} placeholder="Student ID (optional)" />
        <input aria-label="Course ID filter" value={filters.courseId} onChange={(event) => updateFilter("courseId", event.target.value)} placeholder="Course ID (optional)" />
        <label>From <input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} /></label>
        <label>To <input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} /></label>
      </div>
      {error && <ErrorState message={error} onRetry={() => void load()} />}
      <div className="insights-columns">
        <div className="insight-list-panel">
          <div className="panel-toolbar"><div><h2>Review queue</h2><span className="panel-subtitle">{visible.length} certificate{visible.length === 1 ? "" : "s"} in view</span></div><span className="queue-badge">{items.filter((item) => item.status === "ELIGIBLE_FOR_REVIEW").length} ready</span></div>
          {loading ? <div className="insight-state"><div className="spinner" /><strong>Loading review queue…</strong></div> : pageItems.length === 0 ? <div className="insight-state"><strong>No certificates match these filters</strong><p>Eligible outcomes will appear here after server validation.</p></div> : <div className="certificate-review-list">
            {pageItems.map((item) => <button type="button" className={`certificate-review-row ${selected?.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => setSelected(item)}>
              <span className="certificate-review-avatar">{item.learner_name?.slice(0, 1).toUpperCase() || "?"}</span><span className="certificate-review-copy"><strong>{item.learner_name || "Unnamed learner"}</strong><small>{item.course_title} · {item.course_code}</small><small>{item.certificate_number}</small></span><span className={statusClass(item.status)}>{item.status.replaceAll("_", " ")}</span><span className="row-chevron">›</span>
            </button>)}
          </div>}
          {!loading && pageCount > 1 && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
        </div>
        <CertificateDetails selected={selected} detail={detail} loading={detailLoading} notes={notes} setNotes={setNotes} busy={busy} onAction={action} />
      </div>
    </section>
  );
}

function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  return <div className="insight-pagination"><span>Page {page} of {pageCount}</span><div><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Previous</button><button type="button" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Next →</button></div></div>;
}

function CertificateDetails({ selected, detail, loading, notes, setNotes, busy, onAction }: { selected: Certificate | null; detail: { progress: ReportRow[]; assessments: ReportRow[]; assignments: ReportRow[]; history: AuditRow[] }; loading: boolean; notes: string; setNotes: (value: string) => void; busy: string; onAction: (action: "approve" | "reject" | "issue" | "revoke") => void }) {
  if (!selected) return <div className="certificate-detail-panel insight-state"><span className="detail-placeholder-icon">✦</span><strong>Select a certificate to review</strong><p>Completion evidence, review history, and authorized actions will appear here.</p></div>;
  const completion = detail.progress[0];
  return <aside className="certificate-detail-panel">
    <div className="detail-panel-heading"><div><div className="eyebrow">Certificate record</div><h2>{selected.learner_name || "Unnamed learner"}</h2><p>{selected.course_title} · {selected.course_code}</p></div><span className={statusClass(selected.status)}>{selected.status.replaceAll("_", " ")}</span></div>
    <div className="detail-id-grid"><div><span>Certificate ID</span><strong>{selected.certificate_number}</strong></div><div><span>Verification ID</span><strong>{selected.verification_id}</strong></div><div><span>Institution</span><strong>{selected.institution_name || "Direct student"}</strong></div><div><span>Completed</span><strong>{formatDate(selected.completion_date)}</strong></div></div>
    <div className="detail-section"><div className="detail-section-heading"><h3>Completion evidence</h3>{loading && <span className="detail-loading">Refreshing…</span>}</div><div className="evidence-grid"><div><span>Course progress</span><strong>{completion?.progress_percent !== undefined ? `${completion.progress_percent}%` : selected.completion_date ? "100%" : "Pending"}</strong></div><div><span>Assessments</span><strong>{detail.assessments.length ? `${detail.assessments.filter((row) => row.passed === true || row.passed === "true").length}/${detail.assessments.length} passed` : "No attempts found"}</strong></div><div><span>Assignments</span><strong>{detail.assignments.length ? `${detail.assignments.filter((row) => row.passed === true || row.passed === "true").length}/${detail.assignments.length} passed` : "No submissions found"}</strong></div></div></div>
    <div className="detail-section"><div className="detail-section-heading"><h3>Review notes</h3><span>{selected.review_notes || selected.rejection_notes || selected.revocation_reason ? "Saved notes available" : "Optional for approval"}</span></div><p className="saved-note">{selected.review_notes || selected.rejection_notes || selected.revocation_reason || "No review notes have been recorded."}</p><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} placeholder="Add notes for this decision…" /></div>
    <div className="detail-actions">
      {["ELIGIBLE_FOR_REVIEW", "APPROVED"].includes(selected.status) && <><button className="primary-button" type="button" disabled={Boolean(busy)} onClick={() => onAction("approve")}>{busy === "approve" ? "Approving…" : "Approve & issue"}</button><button className="secondary-button danger-outline" type="button" disabled={Boolean(busy)} onClick={() => onAction("reject")}>{busy === "reject" ? "Rejecting…" : "Reject"}</button></>}
      {selected.status === "APPROVED" && <button className="primary-button" type="button" disabled={Boolean(busy)} onClick={() => onAction("issue")}>{busy === "issue" ? "Issuing…" : "Issue certificate"}</button>}
      {selected.status === "ISSUED" && <button className="secondary-button danger-outline" type="button" disabled={Boolean(busy)} onClick={() => onAction("revoke")}>{busy === "revoke" ? "Revoking…" : "Revoke certificate"}</button>}
    </div>
    <div className="detail-section history-section"><div className="detail-section-heading"><h3>Review history</h3><span>{detail.history.length} recorded events</span></div>{detail.history.length === 0 ? <p className="muted-copy">No review events are available for this certificate.</p> : <ol className="review-history">{detail.history.map((entry) => <li key={entry.id}><span className="history-dot" /><div><strong>{entry.action.replaceAll("_", " ")}</strong><small>{formatDateTime(entry.created_at)}</small>{entry.new_value?.notes && <p>{String(entry.new_value.notes)}</p>}</div></li>)}</ol>}</div>
  </aside>;
}

function ReportExplorer({ apiBase }: { apiBase: string }) {
  const [report, setReport] = useState<ReportName>("students");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [filters, setFilters] = useState({ studentId: "", courseId: "", institutionId: "", instructorId: "", studentType: "", status: "", completionStatus: "", assessmentStatus: "", assignmentStatus: "", paymentStatus: "", dateFrom: "", dateTo: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 10;
  const reportMeta = reports.find((item) => item.name === report)!;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const payload = await requestJson<ApiEnvelope<{ report: ReportName; count: number; data: ReportRow[] }>>(apiBase, `/reports/${report}?${queryString(filters)}`);
      setRows(payload.data.data);
      setPage(1);
    } catch (loadError) {
      setRows([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load this report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [report, filters.studentId, filters.courseId, filters.institutionId, filters.instructorId, filters.studentType, filters.status, filters.completionStatus, filters.assessmentStatus, filters.assignmentStatus, filters.paymentStatus, filters.dateFrom, filters.dateTo]);

  const visible = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(normalized));
  }, [rows, search]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageRows = visible.slice((page - 1) * pageSize, page * pageSize);
  const update = (key: keyof typeof filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const columns = reportColumns[report];

  async function exportCsv() {
    try {
      const response = await fetch(`${apiBase}/reports/${report}/export?${queryString(filters)}`, { credentials: "include" });
      if (!response.ok) throw new Error("CSV export could not be prepared.");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `citis-${report}-report.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "CSV export could not be prepared.");
    }
  }

  return <section className="reports-workspace">
    <div className="report-tabs" role="tablist" aria-label="Available reports">{reports.map((item) => <button key={item.name} className={report === item.name ? "active" : ""} type="button" onClick={() => setReport(item.name)}>{item.label}</button>)}</div>
    <div className="report-toolbar"><div><h2>{reportMeta.label}</h2><p>{reportMeta.description}</p></div><div className="report-toolbar-actions"><button className="secondary-button" type="button" onClick={() => void load()}>Refresh</button><button className="primary-button" type="button" onClick={() => void exportCsv()}>↓ Export CSV</button></div></div>
    <div className="report-filter-grid">
      <div className="insight-search report-search"><span aria-hidden="true">⌕</span><input aria-label="Search report rows" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search loaded results" /></div>
      <input aria-label="Institution ID filter" value={filters.institutionId} onChange={(event) => update("institutionId", event.target.value)} placeholder="Institution ID" />
      <input aria-label="Student ID filter" value={filters.studentId} onChange={(event) => update("studentId", event.target.value)} placeholder="Student ID" />
      <input aria-label="Course ID filter" value={filters.courseId} onChange={(event) => update("courseId", event.target.value)} placeholder="Course ID" />
      <select aria-label="Student type filter" value={filters.studentType} onChange={(event) => update("studentType", event.target.value)}><option value="">All student types</option><option value="COLLEGE_STUDENT">College student</option><option value="DIRECT_STUDENT">Direct student</option></select>
      {report === "certificates" && <select aria-label="Certificate status filter" value={filters.status} onChange={(event) => update("status", event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>}
      {report === "progress" && <input aria-label="Completion status filter" value={filters.completionStatus} onChange={(event) => update("completionStatus", event.target.value)} placeholder="Enrollment status" />}
      {report === "assessments" && <input aria-label="Assessment status filter" value={filters.assessmentStatus} onChange={(event) => update("assessmentStatus", event.target.value)} placeholder="Attempt status" />}
      {report === "assignments" && <input aria-label="Assignment status filter" value={filters.assignmentStatus} onChange={(event) => update("assignmentStatus", event.target.value)} placeholder="Submission status" />}
      {(report === "payments" || report === "refunds") && <input aria-label="Payment status filter" value={filters.paymentStatus} onChange={(event) => update("paymentStatus", event.target.value)} placeholder="Payment status" />}
      <label>From <input type="date" value={filters.dateFrom} onChange={(event) => update("dateFrom", event.target.value)} /></label><label>To <input type="date" value={filters.dateTo} onChange={(event) => update("dateTo", event.target.value)} /></label>
    </div>
    {error && <ErrorState message={error} onRetry={() => void load()} />}
    <div className="report-summary"><span><strong>{loading ? "—" : visible.length}</strong> rows in view</span><span>Server results are scoped to your authorized admin account.</span></div>
    {loading ? <div className="insight-state"><div className="spinner" /><strong>Loading {reportMeta.label.toLowerCase()}…</strong></div> : visible.length === 0 ? <div className="insight-state"><strong>No report rows found</strong><p>Try clearing a filter or selecting a wider date range.</p></div> : <><div className="report-table-wrap"><table className="report-table"><thead><tr>{columns.map((column) => <th key={column}>{labels[column] || column}</th>)}</tr></thead><tbody>{pageRows.map((row, index) => <tr key={`${String(row.id || row.student_id || row.course_id || "row")}-${index}`}>{columns.map((column) => <td key={column} data-label={labels[column] || column}>{displayValue(row[column], column)}</td>)}</tr>)}</tbody></table></div><Pagination page={page} pageCount={pageCount} onChange={setPage} /></>}
  </section>;
}

export default function AdminInsights({ apiBase, mode, onModeChange }: { apiBase: string; mode: InsightMode; onModeChange: (mode: InsightMode) => void }) {
  return <><SectionHeader mode={mode} onModeChange={onModeChange} />{mode === "certificates" ? <CertificateReview apiBase={apiBase} /> : <ReportExplorer apiBase={apiBase} />}</>;
}