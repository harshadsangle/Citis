"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import CourseRelationships from "./CourseRelationships";

type Kind = "programmes" | "courses" | "course-modules" | "lessons" | "learning-resources";
type RelationshipMode = "enrollments" | "instructors";
type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type ResourceType = "VIDEO" | "PDF" | "DOCUMENT" | "PRESENTATION" | "LINK" | "SCORM" | "INTERACTIVE";

type ContentRecord = {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  description?: string | null;
  status: Status;
  sequence?: number;
  resource_type?: ResourceType;
  url?: string | null;
  file_path?: string | null;
  duration?: number | null;
  estimated_duration?: number | null;
  managed_file_id?: string | null;
  managed_file_name?: string | null;
  managed_file_size?: number | null;
  managed_file_mime_type?: string | null;
};

type TrailNode = { kind: Kind; id: string; label: string };
type ApiList<T> = { success: true; data: T[]; meta: { pagination: { total: number } } };
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const resourceTypes: ResourceType[] = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"];

const sections: Array<{ kind: Kind; label: string; shortLabel: string; icon: string }> = [
  { kind: "programmes", label: "Programmes", shortLabel: "Programmes", icon: "P" },
  { kind: "courses", label: "Courses", shortLabel: "Courses", icon: "C" },
  { kind: "course-modules", label: "Course modules", shortLabel: "Modules", icon: "M" },
  { kind: "lessons", label: "Lessons", shortLabel: "Lessons", icon: "L" },
  { kind: "learning-resources", label: "Learning resources", shortLabel: "Resources", icon: "R" },
];

const sectionOrder = Object.fromEntries(sections.map((section, index) => [section.kind, index]));

const sectionCopy: Record<Kind, { kicker: string; title: string; description: string }> = {
  programmes: {
    kicker: "Curriculum library",
    title: "Programmes",
    description: "Organise your institution’s learning catalogue into clear, publishable pathways.",
  },
  courses: {
    kicker: "Programme structure",
    title: "Courses",
    description: "Shape the courses that sit inside the selected programme.",
  },
  "course-modules": {
    kicker: "Course structure",
    title: "Course modules",
    description: "Arrange the major sections learners will move through.",
  },
  lessons: {
    kicker: "Module structure",
    title: "Lessons",
    description: "Build a focused sequence of lessons for this module.",
  },
  "learning-resources": {
    kicker: "Lesson content",
    title: "Learning resources",
    description: "Attach videos, documents, links, and interactive materials to the lesson.",
  },
};

const relationshipCopy: Record<RelationshipMode, { kicker: string; title: string; description: string }> = {
  enrollments: {
    kicker: "Course operations",
    title: "Enrolled learners",
    description: "Connect eligible learners to the selected published course.",
  },
  instructors: {
    kicker: "Course operations",
    title: "Assigned instructors",
    description: "Allocate eligible teachers to the selected published course.",
  },
};

function titleFor(record: ContentRecord) {
  return record.name || record.title || "Untitled";
}

function labelFor(kind: Kind) {
  return sections.find((section) => section.kind === kind)?.label || kind;
}

function endpointFor(kind: Kind) {
  return `/${kind}`;
}

function parentQuery(kind: Kind, ids: { programmeId: string; courseId: string; moduleId: string; lessonId: string }) {
  if (kind === "courses" && ids.programmeId) return `&programmeId=${encodeURIComponent(ids.programmeId)}`;
  if (kind === "course-modules" && ids.courseId) return `&courseId=${encodeURIComponent(ids.courseId)}`;
  if (kind === "lessons" && ids.moduleId) return `&moduleId=${encodeURIComponent(ids.moduleId)}`;
  if (kind === "learning-resources" && ids.lessonId) return `&lessonId=${encodeURIComponent(ids.lessonId)}`;
  return "";
}

async function request<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body instanceof FormData) {
    headers.delete("Content-Type");
  } else {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload?.message === "string"
      ? payload.message
      : typeof payload?.error?.message === "string"
        ? payload.error.message
        : typeof payload?.error === "string"
          ? payload.error
          : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function uploadResource(id: string, file: File, resourceType: ResourceType) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ success: true; data: Record<string, unknown> }>(
    `/learning-resources/${id}/${resourceType === "SCORM" ? "scorm" : "file"}`,
    { method: "POST", body: formData },
  );
}

export default function InstitutionAdminPage() {
  const [activeKind, setActiveKind] = useState<Kind>("programmes");
  const [relationshipMode, setRelationshipMode] = useState<RelationshipMode | null>(null);
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [trail, setTrail] = useState<TrailNode[]>([]);
  const [ids, setIds] = useState({ programmeId: "", courseId: "", moduleId: "", lessonId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const currentSection = relationshipMode ? relationshipCopy[relationshipMode] : sectionCopy[activeKind];
  const selectedParent = trail[trail.length - 1];
  const activeParentId = activeKind === "courses"
    ? ids.programmeId
    : activeKind === "course-modules"
      ? ids.courseId
      : activeKind === "lessons"
        ? ids.moduleId
        : activeKind === "learning-resources"
          ? ids.lessonId
          : "";
  const visibleRecords = records;
  const publishedCount = records.filter((record) => record.status === "PUBLISHED").length;
  const draftCount = records.filter((record) => record.status === "DRAFT").length;
  const archivedCount = records.filter((record) => record.status === "ARCHIVED").length;

  const canLoad = activeKind === "programmes" || Boolean(activeParentId);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (relationshipMode) {
        setRecords([]);
        setLoading(false);
        return;
      }
      if (!canLoad) {
        setRecords([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      const query = status === "ALL" ? "" : `&status=${status}`;
      try {
        const payload = await request<ApiList<ContentRecord>>(
          `${endpointFor(activeKind)}?page=1&pageSize=100${parentQuery(activeKind, ids)}${query}`,
        );
        if (!cancelled) setRecords(payload.data);
      } catch (loadError) {
        if (!cancelled) {
          setRecords([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load this section.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeKind, canLoad, ids, refreshToken, relationshipMode, status]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navSummary = useMemo(() => {
    if (relationshipMode) return `${trail.map((node) => node.label).join(" / ")} / ${relationshipCopy[relationshipMode].title}`;
    if (!trail.length) return "Start with a programme";
    return trail.map((node) => node.label).join(" / ");
  }, [relationshipMode, trail]);

  function showSection(kind: Kind) {
    setRelationshipMode(null);
    setActiveKind(kind);
    setStatus("ALL");
    if (kind === "programmes") {
      setTrail([]);
      setIds({ programmeId: "", courseId: "", moduleId: "", lessonId: "" });
    }
  }

  function openRelationship(mode: RelationshipMode, courseId: string, courseLabel: string) {
    const courseNode = { kind: "courses" as Kind, id: courseId, label: courseLabel };
    setIds((current) => ({ ...current, courseId, moduleId: "", lessonId: "" }));
    setTrail((current) => [...current.slice(0, 1), courseNode]);
    setRelationshipMode(mode);
  }

  function selectRecord(record: ContentRecord) {
    if (activeKind === "learning-resources") return;
    const node = { kind: activeKind, id: record.id, label: titleFor(record) };
    if (activeKind === "programmes") {
      setIds({ programmeId: record.id, courseId: "", moduleId: "", lessonId: "" });
      setTrail([node]);
      setActiveKind("courses");
    } else if (activeKind === "courses") {
      setIds((current) => ({ ...current, courseId: record.id, moduleId: "", lessonId: "" }));
      setTrail((current) => [...current.slice(0, 1), node]);
      setActiveKind("course-modules");
    } else if (activeKind === "course-modules") {
      setIds((current) => ({ ...current, moduleId: record.id, lessonId: "" }));
      setTrail((current) => [...current.slice(0, 2), node]);
      setActiveKind("lessons");
    } else if (activeKind === "lessons") {
      setIds((current) => ({ ...current, lessonId: record.id }));
      setTrail((current) => [...current.slice(0, 3), node]);
      setActiveKind("learning-resources");
    }
  }

  function selectTrail(node: TrailNode) {
    setRelationshipMode(null);
    const nodeIndex = sectionOrder[node.kind];
    setTrail((current) => current.slice(0, nodeIndex + 1));
    setActiveKind(node.kind);
    if (node.kind === "programmes") {
      setIds((current) => ({ ...current, programmeId: node.id, courseId: "", moduleId: "", lessonId: "" }));
    } else if (node.kind === "courses") {
      setIds((current) => ({ ...current, courseId: node.id, moduleId: "", lessonId: "" }));
    } else if (node.kind === "course-modules") {
      setIds((current) => ({ ...current, moduleId: node.id, lessonId: "" }));
    } else if (node.kind === "lessons") {
      setIds((current) => ({ ...current, lessonId: node.id }));
    }
  }

  function openCreate() {
    const nextSequence = records.reduce((highest, record) => Math.max(highest, Number(record.sequence) || 0), 0) + 1;
    setEditing(null);
    setSelectedFile(null);
    setForm({
      institutionId: "",
      name: "",
      title: "",
      code: "",
      description: "",
      sequence: String(nextSequence),
      estimatedDuration: "",
      resourceType: "VIDEO",
      url: "",
      filePath: "",
      duration: "",
    });
    setModalOpen(true);
  }

  function openEdit(record: ContentRecord) {
    setEditing(record);
    setSelectedFile(null);
    setForm({
      name: record.name || "",
      title: record.title || "",
      code: record.code || "",
      description: record.description || "",
      sequence: record.sequence ? String(record.sequence) : "",
      estimatedDuration: record.estimated_duration ? String(record.estimated_duration) : "",
      resourceType: record.resource_type || "VIDEO",
      url: record.url || "",
      filePath: record.file_path || "",
      duration: record.duration ? String(record.duration) : "",
    });
    setModalOpen(true);
  }

  function formValue(key: string) {
    return form[key] || "";
  }

  function updateForm(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const isProgramme = activeKind === "programmes";
    const isCourse = activeKind === "courses";
    const isModule = activeKind === "course-modules";
    const isLesson = activeKind === "lessons";
    const body: Record<string, string | number> = {};

    if (!editing && isProgramme) body.institutionId = formValue("institutionId").trim();
    if (!editing && isCourse) body.programmeId = ids.programmeId;
    if (!editing && isModule) body.courseId = ids.courseId;
    if (!editing && isLesson) body.moduleId = ids.moduleId;
    if (!editing && activeKind === "learning-resources") body.lessonId = ids.lessonId;
    if (isProgramme) {
      body.name = formValue("name").trim();
      if (!editing) body.code = formValue("code").trim();
    } else {
      body.title = formValue("title").trim();
      if (!editing && isCourse) body.code = formValue("code").trim();
    }
    body.description = formValue("description").trim();
    if (["course-modules", "lessons", "learning-resources"].includes(activeKind)) {
      body.sequence = Number(formValue("sequence"));
    }
    if (isLesson && formValue("estimatedDuration")) body.estimatedDuration = Number(formValue("estimatedDuration"));
    if (activeKind === "learning-resources") {
      body.resourceType = formValue("resourceType");
      if (formValue("url")) body.url = formValue("url").trim();
      if (formValue("filePath")) body.filePath = formValue("filePath").trim();
      if (formValue("duration")) body.duration = Number(formValue("duration"));
    }

    try {
      const path = `${endpointFor(activeKind)}${editing ? `/${editing.id}` : ""}`;
      const saved = await request<{ success: true; data: ContentRecord }>(path, { method: editing ? "PATCH" : "POST", body: JSON.stringify(body) });
      if (activeKind === "learning-resources" && selectedFile) {
        await uploadResource(editing?.id || saved.data.id, selectedFile, formValue("resourceType") as ResourceType);
      }
      setModalOpen(false);
      setRefreshToken((current) => current + 1);
      setToast(selectedFile ? "Resource saved and file uploaded." : editing ? `${labelFor(activeKind).slice(0, -1)} updated.` : `${labelFor(activeKind).slice(0, -1)} created.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save this item.");
    } finally {
      setSaving(false);
    }
  }

  async function launchScorm(record: ContentRecord) {
    try {
      const payload = await request<{ success: true; data: { launchUrl: string } }>(`/learning-resources/${record.id}/scorm/launch`);
      window.open(payload.data.launchUrl, "_blank", "noopener,noreferrer");
    } catch (launchError) {
      setError(launchError instanceof Error ? launchError.message : "Unable to launch this SCORM package.");
    }
  }

  async function changeStatus(record: ContentRecord, nextStatus: Status) {
    if (nextStatus === "ARCHIVED" && !window.confirm(`Archive “${titleFor(record)}”? It will remain available in the archive but cannot be used as an active parent.`)) {
      return;
    }
    try {
      await request(`${endpointFor(activeKind)}/${record.id}/${nextStatus === "PUBLISHED" ? "publish" : "archive"}`, { method: "POST" });
      setRefreshToken((current) => current + 1);
      setToast(`${titleFor(record)} marked ${nextStatus.toLowerCase()}.`);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update the status.");
    }
  }

  async function moveRecord(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    const current = records[index];
    const target = records[targetIndex];
    if (!current || !target || current.sequence === undefined || target.sequence === undefined) return;
    try {
      await request(`${endpointFor(activeKind)}/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sequence: target.sequence }),
      });
      await request(`${endpointFor(activeKind)}/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sequence: current.sequence }),
      });
      setRefreshToken((value) => value + 1);
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Unable to reorder this content.");
    }
  }

  const formTitle = editing ? `Edit ${labelFor(activeKind).slice(0, -1).toLowerCase()}` : `Create ${labelFor(activeKind).slice(0, -1).toLowerCase()}`;
  const supportsOrdering = ["course-modules", "lessons", "learning-resources"].includes(activeKind);

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">C</span>
          <span><strong>CITIS</strong><small>Skills Excellence Centre</small></span>
        </Link>
        <div className="sidebar-label">Institution portal</div>
        <nav className="primary-nav" aria-label="Primary navigation">
          <button className="nav-link active" type="button"><span className="nav-icon">▦</span> Overview</button>
          <button className="nav-link" type="button"><span className="nav-icon">⌂</span> Institution profile</button>
          <button className="nav-link" type="button"><span className="nav-icon">⌘</span> Campuses</button>
          <button className="nav-link" type="button"><span className="nav-icon">♙</span> Users</button>
          <button className="nav-link" type="button"><span className="nav-icon">◈</span> Roles & permissions</button>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-label">Learning management</div>
        <nav className="primary-nav" aria-label="Learning management navigation">
          {sections.map((section) => (
            <button
              className={`nav-link ${activeKind === section.kind ? "active" : ""}`}
              key={section.kind}
              type="button"
              onClick={() => showSection(section.kind)}
            >
              <span className="nav-icon">{section.icon}</span>{section.shortLabel}
            </button>
          ))}
           <button
             className={`nav-link ${relationshipMode === "enrollments" ? "active" : ""}`}
             type="button"
             disabled={!ids.courseId}
             onClick={() => ids.courseId && openRelationship("enrollments", ids.courseId, trail.at(-1)?.label || "Selected course")}
           >
             <span className="nav-icon">E</span>Learners
           </button>
           <button
             className={`nav-link ${relationshipMode === "instructors" ? "active" : ""}`}
             type="button"
             disabled={!ids.courseId}
             onClick={() => ids.courseId && openRelationship("instructors", ids.courseId, trail.at(-1)?.label || "Selected course")}
           >
             <span className="nav-icon">T</span>Instructors
           </button>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">IA</div>
          <div><strong>Institution admin</strong><span>Secure workspace</span></div>
          <button className="more-button" type="button" aria-label="More account options">•••</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">C</span><strong>CITIS</strong></div>
          <div className="topbar-actions">
            <span className="environment-pill"><span className="online-dot" /> Connected workspace</span>
            <button className="icon-button" type="button" aria-label="Notifications">♢<span className="notification-dot" /></button>
            <a className="help-link" href="/lms/login">Need help?</a>
          </div>
        </header>

        <div className="workspace-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{currentSection.kicker}</div>
              <h1>{currentSection.title}</h1>
              <p>{currentSection.description}</p>
            </div>
             <button className="primary-button" type="button" onClick={openCreate} disabled={Boolean(relationshipMode) || (activeKind !== "programmes" && !activeParentId)}>
              <span>+</span> New {labelFor(activeKind).slice(0, -1)}
            </button>
          </div>

           <div className="breadcrumb-bar">
            <button type="button" className={trail.length === 0 ? "crumb current" : "crumb"} onClick={() => showSection("programmes")}>All programmes</button>
            {trail.map((node) => (
              <span className="crumb-group" key={node.id}>
                <span className="crumb-separator">/</span>
                <button type="button" className={node.kind === activeKind ? "crumb current" : "crumb"} onClick={() => selectTrail(node)}>{node.label}</button>
              </span>
            ))}
             {!relationshipMode && activeKind !== "programmes" && <><span className="crumb-separator">/</span><span className="crumb current">{labelFor(activeKind)}</span></>}
             {relationshipMode && <><span className="crumb-separator">/</span><span className="crumb current">{relationshipCopy[relationshipMode].title}</span></>}
          </div>

           {!relationshipMode && <div className="metric-grid">
            <article className="metric-card"><span className="metric-label">Total in view</span><strong>{loading ? "—" : visibleRecords.length}</strong><span className="metric-foot">Current collection</span></article>
            <article className="metric-card"><span className="metric-label">Published</span><strong className="green-text">{loading ? "—" : publishedCount}</strong><span className="metric-foot">Ready for learners</span></article>
            <article className="metric-card"><span className="metric-label">Drafts</span><strong className="amber-text">{loading ? "—" : draftCount}</strong><span className="metric-foot">Still in progress</span></article>
            <article className="metric-card muted-metric"><span className="metric-label">Archived</span><strong>{loading ? "—" : archivedCount}</strong><span className="metric-foot">Not in active flow</span></article>
           </div>}

           {relationshipMode ? (
             <CourseRelationships apiBase={API_BASE} courseId={ids.courseId} courseLabel={trail.at(-1)?.label || "Selected course"} mode={relationshipMode} />
           ) : <section className="content-panel">
            <div className="panel-toolbar">
              <div>
                <h2>{activeKind === "programmes" ? "Your programmes" : selectedParent ? `${labelFor(activeKind)} in ${selectedParent.label}` : labelFor(activeKind)}</h2>
                <span className="panel-subtitle">{navSummary}</span>
              </div>
              <div className="toolbar-controls">
                <label className="filter-label" htmlFor="status-filter">Status</label>
                <select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value as "ALL" | Status)}>
                  <option value="ALL">All statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="state-box error-box">
                <div className="state-symbol">!</div>
                <div><strong>We couldn’t load this workspace</strong><p>{error}</p><a href="/lms/login">Sign in to continue</a></div>
              </div>
            )}
            {!error && loading && (
              <div className="state-box"><div className="spinner" /><div><strong>Loading {labelFor(activeKind).toLowerCase()}…</strong><p>Checking your tenant-scoped catalogue.</p></div></div>
            )}
            {!error && !loading && !canLoad && (
              <div className="state-box"><div className="state-symbol soft">→</div><div><strong>Choose a parent to continue</strong><p>Select a {labelFor(activeKind === "courses" ? "programmes" : activeKind === "course-modules" ? "courses" : activeKind === "lessons" ? "course-modules" : "lessons").slice(0, -1).toLowerCase()} from the previous level.</p></div></div>
            )}
            {!error && !loading && canLoad && visibleRecords.length === 0 && (
              <div className="state-box empty-box"><div className="state-symbol soft">+</div><div><strong>No {labelFor(activeKind).toLowerCase()} yet</strong><p>Start building this part of the learning hierarchy. New items begin as drafts.</p><button className="text-button" type="button" onClick={openCreate}>Create the first one →</button></div></div>
            )}
            {!error && !loading && visibleRecords.length > 0 && (
              <div className="record-list">
                <div className="list-head"><span>{supportsOrdering ? "Order" : "Name"}</span><span>Details</span><span>Status</span><span>Updated</span><span aria-hidden="true" /></div>
                {visibleRecords.map((record, index) => (
                   <article className="record-row" key={record.id}>
                    <div className="record-primary">
                      {supportsOrdering ? (
                        <div className="order-controls"><button type="button" onClick={() => moveRecord(index, -1)} disabled={index === 0} aria-label="Move up">↑</button><span>{record.sequence || index + 1}</span><button type="button" onClick={() => moveRecord(index, 1)} disabled={index === visibleRecords.length - 1} aria-label="Move down">↓</button></div>
                      ) : <div className="record-avatar">{(titleFor(record)[0] || "?").toUpperCase()}</div>}
                      <div><button className="record-title" type="button" onClick={() => selectRecord(record)}>{titleFor(record)}</button><span className="record-meta">{record.code || record.resource_type || (record.description ? record.description.slice(0, 44) : "No description")}</span></div>
                    </div>
                    <div className="record-detail">{record.resource_type ? `${record.resource_type.toLowerCase()}${record.duration ? ` · ${record.duration} min` : ""}${record.managed_file_name ? ` · ${record.managed_file_name}` : ""}` : record.description || "No description added"}</div>
                    <div><span className={`status-badge ${record.status.toLowerCase()}`}><span />{record.status.charAt(0) + record.status.slice(1).toLowerCase()}</span></div>
                    <div className="updated-detail">Recently edited</div>
                     <div className="row-actions"><button type="button" onClick={() => openEdit(record)}>Edit</button>{activeKind === "courses" && <><button type="button" onClick={() => openRelationship("enrollments", record.id, titleFor(record))}>Learners</button><button type="button" onClick={() => openRelationship("instructors", record.id, titleFor(record))}>Instructors</button></>}{record.resource_type && record.managed_file_id && ["PDF", "DOCUMENT", "PRESENTATION"].includes(record.resource_type) && <a className="row-action-link" href={`${API_BASE}/learning-resources/${record.id}/file`} target="_blank" rel="noreferrer">Open file</a>}{record.resource_type === "SCORM" && record.managed_file_id && <button type="button" onClick={() => launchScorm(record)}>Launch</button>}{record.status !== "PUBLISHED" && <button type="button" onClick={() => changeStatus(record, "PUBLISHED")}>Publish</button>}{record.status !== "ARCHIVED" && <button className="danger-action" type="button" onClick={() => changeStatus(record, "ARCHIVED")}>Archive</button>}</div>
                  </article>
                ))}
              </div>
            )}
           </section>}
           <p className="scope-note"><span>✓</span> {relationshipMode ? "All relationships are institution-scoped and recorded in the audit trail." : "All content is isolated to your authenticated tenant and recorded in the audit trail."}</p>
        </div>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="content-form-title">
            <div className="modal-heading"><div><div className="eyebrow">{editing ? "Update content" : "Add to hierarchy"}</div><h2 id="content-form-title">{formTitle}</h2></div><button type="button" className="close-button" onClick={() => setModalOpen(false)} aria-label="Close form">×</button></div>
            <p className="modal-intro">Fields marked with <span>*</span> are required. New content is saved as a draft.</p>
            <form onSubmit={submitForm}>
              {activeKind === "programmes" && !editing && <label>Institution ID *<input required value={formValue("institutionId")} onChange={(event) => updateForm("institutionId", event.target.value)} placeholder="UUID from your institution profile" /></label>}
              {(activeKind === "programmes") ? <label>Programme name *<input required minLength={2} value={formValue("name")} onChange={(event) => updateForm("name", event.target.value)} placeholder="e.g. Digital Skills Foundation" /></label> : <label>{activeKind === "learning-resources" ? "Resource title" : `${labelFor(activeKind).slice(0, -1)} title`} *<input required minLength={2} value={formValue("title")} onChange={(event) => updateForm("title", event.target.value)} placeholder="Give this content a clear title" /></label>}
              {!editing && (activeKind === "programmes" || activeKind === "courses") && <label>{activeKind === "programmes" ? "Programme code" : "Course code"} *<input required minLength={2} value={formValue("code")} onChange={(event) => updateForm("code", event.target.value)} placeholder="e.g. DSF-101" /></label>}
              {activeKind === "learning-resources" && <label>Resource type *<select required value={formValue("resourceType")} onChange={(event) => updateForm("resourceType", event.target.value)}>{resourceTypes.map((type) => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}</select></label>}
              <label>Description<textarea value={formValue("description")} onChange={(event) => updateForm("description", event.target.value)} placeholder="What will learners or administrators find here?" rows={3} /></label>
              {(supportsOrdering || activeKind === "learning-resources") && <label>Order *<input required type="number" min={1} value={formValue("sequence")} onChange={(event) => updateForm("sequence", event.target.value)} /></label>}
              {activeKind === "lessons" && <label>Estimated duration (minutes)<input type="number" min={0} value={formValue("estimatedDuration")} onChange={(event) => updateForm("estimatedDuration", event.target.value)} placeholder="Optional" /></label>}
              {activeKind === "learning-resources" && <><label>URL<input type="url" value={formValue("url")} onChange={(event) => updateForm("url", event.target.value)} placeholder="https://…" /></label>{["PDF", "DOCUMENT", "PRESENTATION", "SCORM"].includes(formValue("resourceType")) && <label>{formValue("resourceType") === "SCORM" ? "SCORM package (.zip)" : "Managed file"}<input type="file" accept={formValue("resourceType") === "SCORM" ? ".zip,application/zip" : ".pdf,.doc,.docx,.odt,.ppt,.pptx,.odp"} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />{selectedFile && <span className="selected-file">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>}</label>}<label>Duration (minutes)<input type="number" min={0} value={formValue("duration")} onChange={(event) => updateForm("duration", event.target.value)} placeholder="Optional" /></label><p className="field-hint">Files are stored inside your tenant, scanned for safe paths, and served only after permission checks. SCORM packages must contain imsmanifest.xml.</p></>}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create draft"}</button></div>
            </form>
          </section>
        </div>
      )}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}