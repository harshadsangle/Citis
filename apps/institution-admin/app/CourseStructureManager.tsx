"use client";

import { useEffect, useMemo, useState } from "react";

type StructureStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type StructureNode = {
  id: string;
  title: string;
  description?: string | null;
  sequence: number;
  status: StructureStatus;
  unit_id?: string;
};
type ApiArray<T> = { success: true; data: T[] };

async function request<T>(apiBase: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers });
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

function statusLabel(status: StructureStatus) {
  return status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Draft";
}

function nextSequence(records: StructureNode[]) {
  return records.reduce((highest, record) => Math.max(highest, record.sequence || 0), 0) + 1;
}

/**
 * Manages the blueprint course hierarchy levels that sit between modules and
 * lessons: Course -> Unit -> Chapter. The unit and chapter endpoints, their
 * permissions, and their tenant scoping already exist in the API, so this view
 * only surfaces them. It is intentionally isolated from the workspace content
 * list so the existing course/module/lesson/resource navigation is untouched.
 */
export default function CourseStructureManager({ apiBase, courseId, courseLabel }: {
  apiBase: string;
  courseId: string;
  courseLabel: string;
}) {
  const [units, setUnits] = useState<StructureNode[]>([]);
  const [chapters, setChapters] = useState<StructureNode[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [unitSequence, setUnitSequence] = useState("");
  const [editingUnitId, setEditingUnitId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [chapterSequence, setChapterSequence] = useState("");
  const [editingChapterId, setEditingChapterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadUnits() {
    setLoading(true);
    try {
      const payload = await request<ApiArray<StructureNode>>(apiBase, `/course-units?courseId=${encodeURIComponent(courseId)}`);
      setUnits(Array.isArray(payload.data) ? payload.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load course units.");
    } finally {
      setLoading(false);
    }
  }

  async function loadChapters(unitId: string) {
    if (!unitId) {
      setChapters([]);
      return;
    }
    setChapterLoading(true);
    try {
      const payload = await request<ApiArray<StructureNode>>(apiBase, `/course-chapters?unitId=${encodeURIComponent(unitId)}`);
      setChapters(Array.isArray(payload.data) ? payload.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load chapters.");
    } finally {
      setChapterLoading(false);
    }
  }

  useEffect(() => {
    setError("");
    setNotice("");
    setChapters([]);
    setSelectedUnitId("");
    setEditingUnitId("");
    setEditingChapterId("");
    void loadUnits();
    // The course defines this isolated structure view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, courseId]);

  useEffect(() => {
    void loadChapters(selectedUnitId);
    // The selected unit defines the chapter list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId]);

  function resetUnitForm() {
    setUnitTitle("");
    setUnitDescription("");
    setUnitSequence("");
    setEditingUnitId("");
  }

  function resetChapterForm() {
    setChapterTitle("");
    setChapterDescription("");
    setChapterSequence("");
    setEditingChapterId("");
  }

  function startEditingUnit(unit: StructureNode) {
    setEditingUnitId(unit.id);
    setUnitTitle(unit.title || "");
    setUnitDescription(unit.description || "");
    setUnitSequence(String(unit.sequence || ""));
    setError("");
  }

  function startEditingChapter(chapter: StructureNode) {
    setEditingChapterId(chapter.id);
    setChapterTitle(chapter.title || "");
    setChapterDescription(chapter.description || "");
    setChapterSequence(String(chapter.sequence || ""));
    setError("");
  }

  async function saveUnit() {
    const title = unitTitle.trim();
    if (title.length < 2) {
      setError("Unit titles must be at least 2 characters.");
      return;
    }
    const sequence = Number(unitSequence || nextSequence(units));
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Unit order must be a whole number of 1 or more.");
      return;
    }
    setSaving(true);
    setError("");
    const body: Record<string, string | number> = { title, sequence };
    if (unitDescription.trim()) body.description = unitDescription.trim();
    try {
      if (editingUnitId) {
        await request(apiBase, `/course-units/${encodeURIComponent(editingUnitId)}`, { method: "PATCH", body: JSON.stringify(body) });
        setNotice(`Unit “${title}” updated.`);
      } else {
        await request(apiBase, "/course-units", { method: "POST", body: JSON.stringify({ ...body, courseId }) });
        setNotice(`Unit “${title}” created as a draft.`);
      }
      resetUnitForm();
      await loadUnits();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this unit.");
    } finally {
      setSaving(false);
    }
  }

  async function saveChapter() {
    if (!selectedUnitId) return;
    const title = chapterTitle.trim();
    if (title.length < 2) {
      setError("Chapter titles must be at least 2 characters.");
      return;
    }
    const sequence = Number(chapterSequence || nextSequence(chapters));
    if (!Number.isInteger(sequence) || sequence < 1) {
      setError("Chapter order must be a whole number of 1 or more.");
      return;
    }
    setSaving(true);
    setError("");
    const body: Record<string, string | number> = { title, sequence };
    if (chapterDescription.trim()) body.description = chapterDescription.trim();
    try {
      if (editingChapterId) {
        await request(apiBase, `/course-chapters/${encodeURIComponent(editingChapterId)}`, { method: "PATCH", body: JSON.stringify(body) });
        setNotice(`Chapter “${title}” updated.`);
      } else {
        await request(apiBase, "/course-chapters", { method: "POST", body: JSON.stringify({ ...body, unitId: selectedUnitId }) });
        setNotice(`Chapter “${title}” created as a draft.`);
      }
      resetChapterForm();
      await loadChapters(selectedUnitId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this chapter.");
    } finally {
      setSaving(false);
    }
  }

  async function moveRecord(kind: "unit" | "chapter", records: StructureNode[], index: number, direction: -1 | 1) {
    const current = records[index];
    const target = records[index + direction];
    if (!current || !target) return;
    const endpoint = kind === "unit" ? "/course-units/reorder" : "/course-chapters/reorder";
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request(apiBase, endpoint, {
        method: "POST",
        body: JSON.stringify({ id: current.id, swapWithId: target.id }),
      });
      await loadUnits();
      if (selectedUnitId) await loadChapters(selectedUnitId);
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Unable to reorder this content.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(kind: "unit" | "chapter", id: string, action: "publish" | "unpublish" | "archive") {
    const endpoint = kind === "unit" ? "course-units" : "course-chapters";
    setSaving(true);
    setError("");
    try {
      await request(apiBase, `/${endpoint}/${encodeURIComponent(id)}/${action}`, { method: "POST" });
      setNotice(`${kind === "unit" ? "Unit" : "Chapter"} ${action === "archive" ? "archived" : action === "publish" ? "published" : "moved back to draft"}.`);
      await loadUnits();
      if (selectedUnitId) await loadChapters(selectedUnitId);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update this status.");
    } finally {
      setSaving(false);
    }
  }

  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);
  const summary = useMemo(() => {
    if (loading) return "Checking the unit structure…";
    if (units.length === 0) return "No units yet";
    const noun = units.length === 1 ? "unit" : "units";
    return `${units.length} ${noun} in this course`;
  }, [loading, units]);

  return (
    <section className="relationship-panel">
      <div className="relationship-heading">
        <div>
          <div className="eyebrow">Course structure</div>
          <h2>Units &amp; chapters</h2>
          <p>
            {summary} for <strong>{courseLabel}</strong>. Units group the chapters that sit between a course and its lessons.
            Every unit and chapter is scoped to this course and recorded in the audit trail.
          </p>
        </div>
        <div className="relationship-count"><strong>{loading ? "—" : units.length}</strong><span>Units</span></div>
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t complete that action</strong><p>{error}</p></div>}
      {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}

      <div className="relationship-add">
        <div>
          <h3>{editingUnitId ? "Edit unit" : "Add a unit"}</h3>
          <p>Units are created as drafts. Publish a unit when its chapters are ready.</p>
        </div>
        <div className="relationship-controls">
          <input aria-label="Unit title" value={unitTitle} onChange={(event) => setUnitTitle(event.target.value)} placeholder="Unit title" maxLength={180} />
          <input aria-label="Unit order" value={unitSequence} onChange={(event) => setUnitSequence(event.target.value)} placeholder={`Order (default ${nextSequence(units)})`} inputMode="numeric" />
          <button className="primary-button" type="button" onClick={() => void saveUnit()} disabled={saving}>{saving ? "Saving…" : editingUnitId ? "Save unit" : "Add unit"}</button>
          {editingUnitId && <button className="secondary-button" type="button" onClick={resetUnitForm}>Cancel</button>}
          <textarea aria-label="Unit description" value={unitDescription} onChange={(event) => setUnitDescription(event.target.value)} placeholder="Optional description" maxLength={2000} />
        </div>
      </div>

      <div className="relationship-list">
        <div className="relationship-list-heading"><span>Unit</span><span>Details</span><span>Action</span></div>
        {loading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading units…</strong><p>Checking the unit structure for this course.</p></div></div>}
        {!loading && units.length === 0 && (
          <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No units yet</strong><p>Add the first unit to start grouping this course’s chapters.</p></div></div>
        )}
        {!loading && units.map((unit, unitIndex) => (
          <div key={unit.id}>
            <div className="relationship-row">
              <div className="relationship-person">
                <div className="order-controls">
                  <button type="button" onClick={() => void moveRecord("unit", units, unitIndex, -1)} disabled={saving || unitIndex === 0} aria-label={`Move ${unit.title} up`}>↑</button>
                  <span>{unit.sequence}</span>
                  <button type="button" onClick={() => void moveRecord("unit", units, unitIndex, 1)} disabled={saving || unitIndex === units.length - 1} aria-label={`Move ${unit.title} down`}>↓</button>
                </div>
                <div className="record-avatar">{(unit.title || "?").charAt(0).toUpperCase()}</div>
                <strong>{unit.title}</strong>
              </div>
              <span>
                {statusLabel(unit.status)} · order {unit.sequence}
                {unit.description ? ` · ${unit.description.slice(0, 60)}` : ""}
              </span>
              <div className="relationship-actions">
                <button type="button" onClick={() => setSelectedUnitId(selectedUnitId === unit.id ? "" : unit.id)}>
                  {selectedUnitId === unit.id ? "Hide chapters" : "Chapters"}
                </button>
                <button type="button" onClick={() => startEditingUnit(unit)}>Edit</button>
                {unit.status !== "PUBLISHED" && unit.status !== "ARCHIVED" && <button type="button" onClick={() => void changeStatus("unit", unit.id, "publish")} disabled={saving}>Publish</button>}
                {unit.status === "PUBLISHED" && <button type="button" onClick={() => void changeStatus("unit", unit.id, "unpublish")} disabled={saving}>Unpublish</button>}
                {unit.status !== "ARCHIVED" && <button className="danger-action" type="button" onClick={() => void changeStatus("unit", unit.id, "archive")} disabled={saving}>Archive</button>}
              </div>
            </div>

            {selectedUnitId === unit.id && (
              <div className="relationship-list">
                <div className="relationship-list-heading"><span>Chapter</span><span>Details</span><span>Action</span></div>
                {chapterLoading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading chapters…</strong><p>Checking the chapters in this unit.</p></div></div>}
                {!chapterLoading && chapters.length === 0 && (
                  <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No chapters in this unit yet</strong><p>Use the form below to add the first chapter.</p></div></div>
                )}
                {!chapterLoading && chapters.map((chapter, chapterIndex) => (
                  <div className="relationship-row" key={chapter.id}>
                    <div className="relationship-person">
                      <div className="order-controls">
                        <button type="button" onClick={() => void moveRecord("chapter", chapters, chapterIndex, -1)} disabled={saving || chapterIndex === 0} aria-label={`Move ${chapter.title} up`}>↑</button>
                        <span>{chapter.sequence}</span>
                        <button type="button" onClick={() => void moveRecord("chapter", chapters, chapterIndex, 1)} disabled={saving || chapterIndex === chapters.length - 1} aria-label={`Move ${chapter.title} down`}>↓</button>
                      </div>
                      <div className="record-avatar">{(chapter.title || "?").charAt(0).toUpperCase()}</div>
                      <strong>{chapter.title}</strong>
                    </div>
                    <span>
                      {statusLabel(chapter.status)} · order {chapter.sequence}
                      {chapter.description ? ` · ${chapter.description.slice(0, 60)}` : ""}
                    </span>
                    <div className="relationship-actions">
                      <button type="button" onClick={() => startEditingChapter(chapter)}>Edit</button>
                      {chapter.status !== "PUBLISHED" && chapter.status !== "ARCHIVED" && <button type="button" onClick={() => void changeStatus("chapter", chapter.id, "publish")} disabled={saving}>Publish</button>}
                      {chapter.status === "PUBLISHED" && <button type="button" onClick={() => void changeStatus("chapter", chapter.id, "unpublish")} disabled={saving}>Unpublish</button>}
                      {chapter.status !== "ARCHIVED" && <button className="danger-action" type="button" onClick={() => void changeStatus("chapter", chapter.id, "archive")} disabled={saving}>Archive</button>}
                    </div>
                  </div>
                ))}

                <div className="relationship-add">
                  <div>
                    <h3>{editingChapterId ? "Edit chapter" : "Add a chapter"}</h3>
                    <p>Chapters are created as drafts inside “{selectedUnit?.title || "this unit"}”.</p>
                  </div>
                  <div className="relationship-controls">
                    <input aria-label="Chapter title" value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="Chapter title" maxLength={180} />
                    <input aria-label="Chapter order" value={chapterSequence} onChange={(event) => setChapterSequence(event.target.value)} placeholder={`Order (default ${nextSequence(chapters)})`} inputMode="numeric" />
                    <button className="primary-button" type="button" onClick={() => void saveChapter()} disabled={saving}>{saving ? "Saving…" : editingChapterId ? "Save chapter" : "Add chapter"}</button>
                    {editingChapterId && <button className="secondary-button" type="button" onClick={resetChapterForm}>Cancel</button>}
                    <textarea aria-label="Chapter description" value={chapterDescription} onChange={(event) => setChapterDescription(event.target.value)} placeholder="Optional description" maxLength={2000} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
