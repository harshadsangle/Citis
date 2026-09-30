"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

// Same-origin /api/v1, proxied by next.config.ts rewrites. See the note in
// app/page.tsx: calling the API host directly triggers a CORS preflight that
// the production WEB_ORIGIN allowlist rejects for this portal.
const base = (process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "/api/v1").replace(/\/$/, "");

type Row = {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  status?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  faculty_id?: string;
  department_id?: string | null;
  course_id?: string;
  semester_id?: string;
  institution_id?: string;
  section?: string;
};

type ListResponse = { data?: Row[] };
type ResourceKind = "programmes" | "faculties" | "departments" | "semesters" | "course-offerings";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${base}${path}`, { ...init, credentials: "include", headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
    throw new Error(message || "Request failed.");
  }
  return payload as T;
}

const kinds: ResourceKind[] = ["programmes", "faculties", "departments", "semesters", "course-offerings"];
const titleFor = (kind: ResourceKind) => kind === "course-offerings" ? "Course offerings" : kind[0].toUpperCase() + kind.slice(1);
const dateValue = (value?: string) => value ? value.slice(0, 10) : "";

export default function AcademicStructurePage() {
  const [kind, setKind] = useState<ResourceKind>("faculties");
  const [rows, setRows] = useState<Row[]>([]);
  const [institutions, setInstitutions] = useState<Row[]>([]);
  const [faculties, setFaculties] = useState<Row[]>([]);
  const [departments, setDepartments] = useState<Row[]>([]);
  const [semesters, setSemesters] = useState<Row[]>([]);
  const [courses, setCourses] = useState<Row[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [section, setSection] = useState("");
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const listRequestId = useRef(0);

  async function loadRows() {
    const requestId = ++listRequestId.current;
    if (!institutionId) {
      setRows([]);
      return;
    }
    const query = `?institutionId=${encodeURIComponent(institutionId)}&page=1&pageSize=100`;
    try {
      const result = await request<ListResponse>(kind === "programmes" ? `/programmes${query}` : `/academic/${kind}${query}`);
      if (requestId === listRequestId.current) setRows(result.data || []);
    } catch (caught) {
      if (requestId === listRequestId.current) {
        setError(caught instanceof Error ? caught.message : "Unable to load academic records.");
      }
    }
  }

  useEffect(() => {
    request<ListResponse>("/institutions/scoped-options")
      .then((result) => {
        const choices = result.data || [];
        setInstitutions(choices);
        if (choices[0]) setInstitutionId(choices[0].id);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load institutions in your scope."));
  }, []);

  useEffect(() => {
    setError("");
    setNotice("");
    setEditingId("");
    setName("");
    setCode("");
    setDescription("");
    setFacultyId("");
    setDepartmentId("");
    setCourseId("");
    setSemesterId("");
    setStartDate("");
    setEndDate("");
    setSection("");
    setRows([]);
    void loadRows();
  // loadRows intentionally follows the selected resource and institution.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, institutionId]);

  useEffect(() => {
    if (!institutionId) return;
    let current = true;
    setFaculties([]);
    setDepartments([]);
    setSemesters([]);
    setCourses([]);
    const query = `?institutionId=${encodeURIComponent(institutionId)}&page=1&pageSize=100`;
    const loadOptions = async () => {
      if (kind === "departments") {
        try {
          const result = await request<ListResponse>(`/academic/faculties${query}`);
          if (current) setFaculties(result.data || []);
        } catch (caught) {
          if (current) setError(caught instanceof Error ? caught.message : "Unable to load faculties.");
        }
      }
      if (kind === "programmes") {
        try {
          const result = await request<ListResponse>(`/academic/departments${query}`);
          if (current) setDepartments(result.data || []);
        } catch (caught) {
          if (current) setError(caught instanceof Error ? caught.message : "Unable to load departments.");
        }
      }
      if (kind === "course-offerings") {
        const [semesterResult, courseResult] = await Promise.allSettled([
          request<ListResponse>(`/academic/semesters${query}`),
          request<ListResponse>(`/academic/course-options?institutionId=${encodeURIComponent(institutionId)}`),
        ]);
        if (semesterResult.status === "fulfilled") {
          if (current) setSemesters((semesterResult.value.data || []).filter((item) => item.status !== "ARCHIVED"));
        } else if (current) {
          setError(semesterResult.reason instanceof Error ? semesterResult.reason.message : "Unable to load semesters.");
        }
        if (courseResult.status === "fulfilled") {
          if (current) setCourses(courseResult.value.data || []);
        } else if (current) {
          setError(courseResult.reason instanceof Error ? courseResult.reason.message : "Unable to load courses.");
        }
      }
    };
    void loadOptions();
    return () => { current = false; };
  }, [kind, institutionId]);

  function resetForm() {
    setEditingId("");
    setName("");
    setCode("");
    setDescription("");
    setFacultyId("");
    setDepartmentId("");
    setCourseId("");
    setSemesterId("");
    setStartDate("");
    setEndDate("");
    setSection("");
  }

  function beginEdit(row: Row) {
    setError("");
    setNotice("");
    setEditingId(row.id);
    setName(row.name || "");
    setCode(row.code || "");
    setDescription(row.description || "");
    setFacultyId(row.faculty_id || "");
    setDepartmentId(row.department_id || "");
    setCourseId(row.course_id || "");
    setSemesterId(row.semester_id || "");
    setStartDate(dateValue(row.start_date));
    setEndDate(dateValue(row.end_date));
    setSection(row.section || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!institutionId) {
      setError("Select an institution first.");
      return;
    }
    const body: Record<string, unknown> = {};
    if (kind === "programmes") {
      if (editingId) Object.assign(body, { name, description, departmentId: departmentId || null });
      else Object.assign(body, { institutionId, name, code, description, departmentId: departmentId || undefined });
    } else if (kind === "faculties") {
      Object.assign(body, { name, code, description });
      if (editingId) body.code = code;
      else body.institutionId = institutionId;
    } else if (kind === "departments") {
      Object.assign(body, { name, code, description, facultyId });
      if (editingId) body.code = code;
      else body.institutionId = institutionId;
    } else if (kind === "semesters") {
      Object.assign(body, { name, code, startDate, endDate });
      if (editingId) body.code = code;
      else body.institutionId = institutionId;
    } else {
      Object.assign(body, { section });
      if (!editingId) Object.assign(body, { institutionId, courseId, semesterId });
    }

    setBusy(true);
    try {
      const path = kind === "programmes" ? "/programmes" : `/academic/${kind}`;
      await request(`${path}${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      resetForm();
      setNotice(`${titleFor(kind)} ${editingId ? "updated" : "created"}.`);
      await loadRows();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(row: Row, action: "archive" | "restore" | "publish") {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (kind === "programmes") {
        await request(`/programmes/${row.id}/${action}`, { method: "POST" });
      } else if (action === "archive") {
        await request(`/academic/${kind}/${row.id}/archive`, { method: "POST" });
      } else {
        const status = kind === "semesters" ? "DRAFT" : "ACTIVE";
        await request(`/academic/${kind}/${row.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      }
      setNotice(`${titleFor(kind)} status updated.`);
      await loadRows();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update status.");
    } finally {
      setBusy(false);
    }
  }

  const styles = {
    page: { maxWidth: 1120, margin: "32px auto", padding: "24px", color: "#172033", fontFamily: "Arial, sans-serif" },
    card: { background: "#fff", border: "1px solid #dce3ed", borderRadius: 12, padding: 20, margin: "20px 0" },
    input: { minHeight: 40, width: "100%", boxSizing: "border-box" as const, border: "1px solid #c8d1df", borderRadius: 7, padding: "8px 10px", background: "#fff" },
    label: { display: "grid", gap: 6, fontSize: 14, fontWeight: 600 as const },
    button: { border: "1px solid #bac7d8", borderRadius: 7, background: "#fff", color: "#15233a", padding: "9px 13px", cursor: "pointer" },
  };

  const activeOptions = (items: Row[]) => items.filter((item) => item.status !== "ARCHIVED");

  return (
    <main style={styles.page}>
      <h1 style={{ marginBottom: 6 }}>Academic structure</h1>
      <p style={{ color: "#536176", marginTop: 0 }}>
        Manage institution-scoped faculties, departments, semesters, programmes, and course offerings.
      </p>

      <section style={styles.card}>
        <label style={{ ...styles.label, maxWidth: 460 }}>
          Institution
          <select style={styles.input} value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} required>
            <option value="">Select institution</option>
            {institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <nav aria-label="Academic structure resources" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
          {kinds.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(item)}
              aria-current={kind === item ? "page" : undefined}
              style={{ ...styles.button, background: kind === item ? "#173b68" : "#fff", color: kind === item ? "#fff" : "#15233a" }}
            >
              {titleFor(item)}
            </button>
          ))}
        </nav>
      </section>

      {error && <p role="alert" style={{ color: "#a32626", background: "#fff1f0", padding: 12, borderRadius: 8 }}>{error}</p>}
      {notice && <p role="status" style={{ color: "#146c43", background: "#ecf8f1", padding: 12, borderRadius: 8 }}>{notice}</p>}

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>{editingId ? `Edit ${titleFor(kind).toLowerCase()}` : `Create ${titleFor(kind).toLowerCase()}`}</h2>
        <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {kind === "departments" && (
            <label style={styles.label}>Faculty
              <select style={styles.input} value={facultyId} onChange={(event) => setFacultyId(event.target.value)} required>
                <option value="">Select faculty</option>
                {activeOptions(faculties).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </select>
            </label>
          )}
          {kind === "programmes" && (
            <label style={styles.label}>Department (optional)
              <select style={styles.input} value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                <option value="">No department</option>
                {activeOptions(departments).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </select>
            </label>
          )}
          {kind === "course-offerings" && (
            <>
              <label style={styles.label}>Course
                <select style={styles.input} value={courseId} onChange={(event) => setCourseId(event.target.value)} required disabled={!!editingId}>
                  <option value="">Select course</option>
                  {courses.map((item) => <option key={item.id} value={item.id}>{item.title || item.name} ({item.code})</option>)}
                </select>
              </label>
              <label style={styles.label}>Semester
                <select style={styles.input} value={semesterId} onChange={(event) => setSemesterId(event.target.value)} required disabled={!!editingId}>
                  <option value="">Select semester</option>
                  {semesters.filter((item) => item.status === "ACTIVE" || item.status === "DRAFT")
                    .map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
                </select>
              </label>
              <label style={styles.label}>Section
                <input style={styles.input} value={section} onChange={(event) => setSection(event.target.value)} maxLength={80} placeholder="Optional section" />
              </label>
            </>
          )}
          {kind !== "course-offerings" && (
            <>
              <label style={styles.label}>{kind === "programmes" ? "Programme name" : `${titleFor(kind).replace(/s$/, "")} name`}
                <input style={styles.input} value={name} onChange={(event) => setName(event.target.value)} minLength={1} maxLength={160} required />
              </label>
              {(kind !== "programmes" || !editingId) && <label style={styles.label}>Code
                <input style={styles.input} value={code} onChange={(event) => setCode(event.target.value)} minLength={1} maxLength={48} required />
              </label>}
              {(kind === "programmes" || kind === "faculties" || kind === "departments") && (
                <label style={styles.label}>Description
                  <input style={styles.input} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} />
                </label>
              )}
              {kind === "semesters" && (
                <>
                  <label style={styles.label}>Start date
                    <input style={styles.input} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                  </label>
                  <label style={styles.label}>End date
                    <input style={styles.input} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
                  </label>
                </>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
            <button type="submit" disabled={busy || !institutionId} style={{ ...styles.button, background: "#173b68", color: "#fff" }}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Create"}
            </button>
            {editingId && <button type="button" onClick={resetForm} style={styles.button}>Cancel edit</button>}
          </div>
        </form>
        {kind === "course-offerings" && !courses.length && (
          <p style={{ color: "#536176" }}>No published courses in this institution are available to offer.</p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>{titleFor(kind)}</h2>
        {!rows.length ? <p style={{ color: "#536176" }}>No records found for this institution.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr>{["Name / course", "Code / section", "Details", "Status", "Actions"].map((heading) => (
                  <th key={heading} style={{ borderBottom: "1px solid #dce3ed", padding: "10px 8px", fontSize: 13 }}>{heading}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const course = courses.find((item) => item.id === row.course_id);
                  const semester = semesters.find((item) => item.id === row.semester_id);
                  const faculty = faculties.find((item) => item.id === row.faculty_id);
                  const displayName = kind === "course-offerings" ? (course?.title || course?.name || row.course_id) : row.name;
                  const displayCode = kind === "course-offerings" ? (row.section || "—") : row.code;
                  const details = kind === "departments" ? faculty?.name
                    : kind === "programmes" ? departments.find((item) => item.id === row.department_id)?.name
                      : kind === "semesters" ? `${dateValue(row.start_date)} – ${dateValue(row.end_date)}`
                        : kind === "course-offerings" ? semester?.name : row.description;
                  return (
                    <tr key={row.id}>
                      <td style={{ borderBottom: "1px solid #edf0f5", padding: 8 }}>{displayName || "—"}</td>
                      <td style={{ borderBottom: "1px solid #edf0f5", padding: 8 }}>{displayCode || "—"}</td>
                      <td style={{ borderBottom: "1px solid #edf0f5", padding: 8 }}>{details || "—"}</td>
                      <td style={{ borderBottom: "1px solid #edf0f5", padding: 8 }}>{row.status || "—"}</td>
                      <td style={{ borderBottom: "1px solid #edf0f5", padding: 8, whiteSpace: "nowrap" }}>
                        <button type="button" disabled={busy} onClick={() => beginEdit(row)} style={styles.button}>Edit</button>{" "}
                        {row.status === "ARCHIVED" ? (
                          kind !== "programmes" && <button type="button" disabled={busy} onClick={() => void changeStatus(row, "restore")} style={styles.button}>Restore</button>
                        ) : (
                          <button type="button" disabled={busy} onClick={() => void changeStatus(row, "archive")} style={styles.button}>Archive</button>
                        )}
                        {kind === "programmes" && row.status === "DRAFT" && (
                          <>{" "}<button type="button" disabled={busy} onClick={() => void changeStatus(row, "publish")} style={styles.button}>Publish</button></>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}