"use client";

import { useEffect, useState } from "react";

type LiveClassProvider = "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "WEBEX";
type LiveClassStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED" | "ARCHIVED";
type ApiList<T> = { success: true; data: T[]; meta: { pagination: { total: number } } };

type CourseOption = { id: string; name?: string; title?: string; code?: string; status?: string };
type StructureOption = { id: string; title: string };

type LiveClass = {
  id: string;
  course_id: string;
  course_title?: string;
  course_code?: string;
  module_id?: string | null;
  unit_id?: string | null;
  chapter_id?: string | null;
  title: string;
  description?: string | null;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  provider: LiveClassProvider;
  meeting_url: string;
  recording_url?: string | null;
  status: LiveClassStatus;
};

const PROVIDERS: Array<{ value: LiveClassProvider; label: string; hint: string }> = [
  { value: "ZOOM", label: "Zoom", hint: "https://zoom.us/j/…" },
  { value: "GOOGLE_MEET", label: "Google Meet", hint: "https://meet.google.com/…" },
  { value: "MICROSOFT_TEAMS", label: "Microsoft Teams", hint: "https://teams.microsoft.com/l/meetup-join/…" },
  { value: "WEBEX", label: "Webex", hint: "https://webex.com/…" },
];

const providerLabel = (value: string) =>
  PROVIDERS.find((provider) => provider.value === value)?.label || value;

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  const parsed = Number(hour);
  if (!Number.isFinite(parsed)) return value;
  const suffix = parsed >= 12 ? "PM" : "AM";
  const display = parsed % 12 === 0 ? 12 : parsed % 12;
  return `${display}:${minute} ${suffix}`;
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

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

function emptyDraft() {
  return {
    title: "",
    description: "",
    courseId: "",
    moduleId: "",
    unitId: "",
    chapterId: "",
    scheduledDate: "",
    startTime: "",
    durationMinutes: "60",
    provider: "ZOOM" as LiveClassProvider,
    meetingUrl: "",
    recordingUrl: "",
  };
}

/**
 * Schedules the blueprint's live classes for a course. Only the meeting
 * provider and link are stored; attendance capture, recording processing and
 * external meeting API integrations are deliberately out of scope, so the
 * recording is a plain stored link.
 */
export default function LiveClassManager({ apiBase }: { apiBase: string }) {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [modules, setModules] = useState<StructureOption[]>([]);
  const [units, setUnits] = useState<StructureOption[]>([]);
  const [chapters, setChapters] = useState<StructureOption[]>([]);
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadClasses() {
    setLoading(true);
    try {
      const payload = await request<ApiList<LiveClass>>(apiBase, "/live-classes?page=1&pageSize=100");
      setClasses(Array.isArray(payload.data) ? payload.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load live classes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setError("");
    setNotice("");
    void loadClasses();
    // apiBase is the single API root for this isolated view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(() => {
    let active = true;
    request<ApiList<CourseOption>>(apiBase, "/courses?page=1&pageSize=100")
      .then((payload) => {
        if (active) setCourses(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (active) setCourses([]);
      });
    return () => {
      active = false;
    };
  }, [apiBase]);

  // Structure pickers follow the selected course, matching the workspace
  // hierarchy: course -> module -> unit -> chapter.
  useEffect(() => {
    const courseId = draft.courseId;
    setModules([]);
    setUnits([]);
    setChapters([]);
    if (!courseId) return;
    let active = true;
    const query = `page=1&pageSize=100`;
    void Promise.all([
      request<ApiList<StructureOption>>(apiBase, `/course-modules?courseId=${encodeURIComponent(courseId)}&${query}`).catch(() => ({ data: [] })),
      request<ApiList<StructureOption>>(apiBase, `/course-units?courseId=${encodeURIComponent(courseId)}`).catch(() => ({ data: [] })),
    ]).then(([modulePayload, unitPayload]) => {
      if (!active) return;
      setModules(Array.isArray(modulePayload.data) ? modulePayload.data : []);
      setUnits(Array.isArray(unitPayload.data) ? unitPayload.data : []);
    });
    return () => {
      active = false;
    };
  }, [apiBase, draft.courseId]);

  useEffect(() => {
    const unitId = draft.unitId;
    setChapters([]);
    if (!unitId) return;
    let active = true;
    request<ApiList<StructureOption>>(apiBase, `/course-chapters?unitId=${encodeURIComponent(unitId)}`)
      .then((payload) => {
        if (active) setChapters(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch(() => {
        if (active) setChapters([]);
      });
    return () => {
      active = false;
    };
  }, [apiBase, draft.unitId]);

  const update = (key: keyof ReturnType<typeof emptyDraft>, next: string) => {
    setDraft((current) => ({ ...current, [key]: next }));
  };

  function resetForm() {
    setDraft(emptyDraft());
    setEditingId("");
  }

  function startEditing(item: LiveClass) {
    setEditingId(item.id);
    setDraft({
      title: item.title || "",
      description: item.description || "",
      courseId: item.course_id,
      moduleId: item.module_id || "",
      unitId: item.unit_id || "",
      chapterId: item.chapter_id || "",
      scheduledDate: (item.scheduled_date || "").slice(0, 10),
      startTime: (item.start_time || "").slice(0, 5),
      durationMinutes: String(item.duration_minutes ?? 60),
      provider: item.provider,
      meetingUrl: item.meeting_url || "",
      recordingUrl: item.recording_url || "",
    });
    setError("");
    setNotice("");
  }

  async function save() {
    if (!draft.courseId) {
      setError("Choose the course this live class belongs to.");
      return;
    }
    if (draft.title.trim().length < 2) {
      setError("Live class titles must be at least 2 characters.");
      return;
    }
    if (!draft.scheduledDate) {
      setError("Choose a date for the live class.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime)) {
      setError("Start time must use 24-hour HH:MM format.");
      return;
    }
    const duration = Number(draft.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setError("Duration must be a whole number of minutes between 1 and 1440.");
      return;
    }
    if (!/^https?:\/\//i.test(draft.meetingUrl.trim())) {
      setError("Meeting link must be a full http or https URL.");
      return;
    }
    if (draft.recordingUrl.trim() && !/^https?:\/\//i.test(draft.recordingUrl.trim())) {
      setError("Recording link must be a full http or https URL.");
      return;
    }
    setSaving(true);
    setError("");
    const body: Record<string, string | number | null> = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      scheduledDate: draft.scheduledDate,
      startTime: draft.startTime,
      durationMinutes: duration,
      provider: draft.provider,
      meetingUrl: draft.meetingUrl.trim(),
      recordingUrl: draft.recordingUrl.trim() || null,
      moduleId: draft.moduleId || null,
      unitId: draft.unitId || null,
      chapterId: draft.chapterId || null,
    };
    try {
      if (editingId) {
        await request(apiBase, `/live-classes/${encodeURIComponent(editingId)}`, { method: "PATCH", body: JSON.stringify(body) });
        setNotice(`Live class “${body.title}” updated.`);
      } else {
        await request(apiBase, "/live-classes", { method: "POST", body: JSON.stringify({ ...body, courseId: draft.courseId }) });
        setNotice(`Live class “${body.title}” scheduled.`);
      }
      resetForm();
      await loadClasses();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this live class.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: LiveClass, status: LiveClassStatus) {
    const verb = status === "ARCHIVED" ? "archive" : status === "CANCELLED" ? "cancel" : `mark as ${statusLabel(status).toLowerCase()}`;
    if (!window.confirm(`${statusLabel(verb)} “${item.title}”?`)) return;
    setSaving(true);
    setError("");
    try {
      if (status === "ARCHIVED") {
        await request(apiBase, `/live-classes/${encodeURIComponent(item.id)}/archive`, { method: "POST" });
      } else {
        await request(apiBase, `/live-classes/${encodeURIComponent(item.id)}/status`, {
          method: "POST",
          body: JSON.stringify({ status }),
        });
      }
      setNotice(`Live class “${item.title}” updated.`);
      if (editingId === item.id) resetForm();
      await loadClasses();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update this live class.");
    } finally {
      setSaving(false);
    }
  }

  const selectedProvider = PROVIDERS.find((provider) => provider.value === draft.provider) || PROVIDERS[0];

  return (
    <section className="relationship-panel">
      <div className="relationship-heading">
        <div>
          <div className="eyebrow">Live classes</div>
          <h2>Schedule a live class</h2>
          <p>
            {loading ? "Checking scheduled classes…" : `${classes.length} scheduled ${classes.length === 1 ? "class" : "classes"}`}.
            Store the meeting link for Zoom, Google Meet, Microsoft Teams, or Webex. Attendance and recording processing are handled outside this portal.
          </p>
        </div>
        <div className="relationship-count"><strong>{loading ? "—" : classes.length}</strong><span>Classes</span></div>
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t complete that action</strong><p>{error}</p></div>}
      {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}

      <div className="relationship-add">
        <div>
          <h3>{editingId ? "Edit live class" : "New live class"}</h3>
          <p>Pick the course, optionally narrow to a module, unit, or chapter, then add the meeting details.</p>
        </div>
        <div className="relationship-controls">
          <select aria-label="Course" value={draft.courseId} onChange={(event) => update("courseId", event.target.value)}>
            <option value="">Choose a course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name || course.title || course.code || course.id}</option>)}
          </select>
          <select aria-label="Module" value={draft.moduleId} onChange={(event) => update("moduleId", event.target.value)} disabled={!draft.courseId}>
            <option value="">{draft.courseId ? "Whole course" : "Choose a course first"}</option>
            {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
          </select>
          <select aria-label="Unit" value={draft.unitId} onChange={(event) => { update("unitId", event.target.value); update("chapterId", ""); }} disabled={!draft.courseId}>
            <option value="">Whole course</option>
            {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
          </select>
          <select aria-label="Chapter" value={draft.chapterId} onChange={(event) => update("chapterId", event.target.value)} disabled={!draft.unitId}>
            <option value="">{draft.unitId ? "Whole unit" : "Choose a unit first"}</option>
            {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
          </select>
          <input aria-label="Live class title" value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="Live class title" maxLength={180} />
          <input aria-label="Date" type="date" value={draft.scheduledDate} onChange={(event) => update("scheduledDate", event.target.value)} />
          <input aria-label="Start time" type="time" value={draft.startTime} onChange={(event) => update("startTime", event.target.value)} />
          <input aria-label="Duration in minutes" type="number" min={1} max={1440} value={draft.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)} />
          <select aria-label="Meeting provider" value={draft.provider} onChange={(event) => update("provider", event.target.value)}>
            {PROVIDERS.map((provider) => <option key={provider.value} value={provider.value}>{provider.label}</option>)}
          </select>
          <input aria-label="Meeting link" value={draft.meetingUrl} onChange={(event) => update("meetingUrl", event.target.value)} placeholder={selectedProvider.hint} maxLength={2048} />
          <input aria-label="Recording link" value={draft.recordingUrl} onChange={(event) => update("recordingUrl", event.target.value)} placeholder="Optional recording link" maxLength={2048} />
          <button className="primary-button" type="button" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Schedule class"}</button>
          {editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}
          <textarea aria-label="Live class description" value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="Optional description" maxLength={2000} />
        </div>
      </div>

      <div className="relationship-list">
        <div className="relationship-list-heading"><span>Live class</span><span>When &amp; where</span><span>Action</span></div>
        {loading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading live classes…</strong><p>Checking the schedule for your courses.</p></div></div>}
        {!loading && classes.length === 0 && (
          <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No live classes scheduled</strong><p>Use the form above to schedule the first class for a course.</p></div></div>
        )}
        {!loading && classes.map((item) => (
          <div className="relationship-row" key={item.id}>
            <div className="relationship-person">
              <div className="record-avatar">{(item.title || "?").charAt(0).toUpperCase()}</div>
              <strong>{item.title}</strong>
            </div>
            <span>
              {formatDate(item.scheduled_date)} · {formatTime(item.start_time)} · {item.duration_minutes} min · {providerLabel(item.provider)}
              {item.course_title ? ` · ${item.course_title}` : ""}
              {item.status !== "SCHEDULED" ? ` · ${statusLabel(item.status)}` : ""}
            </span>
            <div className="relationship-actions">
              <a className="row-action-link" href={item.meeting_url} target="_blank" rel="noreferrer">Join</a>
              {item.recording_url && <a className="row-action-link" href={item.recording_url} target="_blank" rel="noreferrer">Recording</a>}
              <button type="button" onClick={() => startEditing(item)} disabled={saving}>Edit</button>
              {item.status === "SCHEDULED" && <button type="button" onClick={() => void changeStatus(item, "COMPLETED")} disabled={saving}>Complete</button>}
              {item.status === "SCHEDULED" && <button type="button" onClick={() => void changeStatus(item, "CANCELLED")} disabled={saving}>Cancel</button>}
              {item.status !== "ARCHIVED" && <button className="danger-action" type="button" onClick={() => void changeStatus(item, "ARCHIVED")} disabled={saving}>Archive</button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
