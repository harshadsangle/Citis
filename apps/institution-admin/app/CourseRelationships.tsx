"use client";

import { useEffect, useMemo, useState } from "react";

type RelationshipMode = "enrollments" | "instructors";
type Person = { id: string; first_name: string; last_name: string; email?: string | null; mobile?: string | null };
type Relationship = Person & {
  id: string;
  learner_id?: string;
  instructor_id?: string;
  learner_first_name?: string;
  learner_last_name?: string;
  learner_email?: string | null;
  instructor_first_name?: string;
  instructor_last_name?: string;
  instructor_email?: string | null;
  enrolled_at?: string;
  assigned_at?: string;
};
type ApiList<T> = { success: true; data: T[]; meta: { pagination: { total: number } } };

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
        : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function displayName(person: Person | Relationship, mode?: RelationshipMode) {
  if (mode === "enrollments" && "learner_first_name" in person) {
    return `${person.learner_first_name || ""} ${person.learner_last_name || ""}`.trim() || "Unnamed learner";
  }
  if (mode === "instructors" && "instructor_first_name" in person) {
    return `${person.instructor_first_name || ""} ${person.instructor_last_name || ""}`.trim() || "Unnamed instructor";
  }
  return `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Unnamed person";
}

export default function CourseRelationships({ apiBase, courseId, courseLabel, mode }: {
  apiBase: string;
  courseId: string;
  courseLabel: string;
  mode: RelationshipMode;
}) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [candidates, setCandidates] = useState<Person[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isEnrollment = mode === "enrollments";
  const noun = isEnrollment ? "learner" : "instructor";
  const plural = isEnrollment ? "learners" : "instructors";
  const endpoint = isEnrollment ? "enrollments" : "instructor-assignments";
  const candidateEndpoint = isEnrollment ? "enrollment-candidates" : "instructor-candidates";
  const title = isEnrollment ? "Enrolled learners" : "Assigned instructors";

  async function loadRelationships() {
    setLoading(true);
    try {
      const payload = await request<ApiList<Relationship>>(apiBase, `/courses/${courseId}/${endpoint}?status=ACTIVE&page=1&pageSize=100`);
      setRelationships(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : `Unable to load ${plural}.`);
    } finally {
      setLoading(false);
    }
  }

  async function loadCandidates(nextSearch = search) {
    setCandidateLoading(true);
    try {
      const query = nextSearch.trim() ? `&search=${encodeURIComponent(nextSearch.trim())}` : "";
      const payload = await request<ApiList<Person>>(apiBase, `/courses/${courseId}/${candidateEndpoint}?page=1&pageSize=100${query}`);
      setCandidates(payload.data);
      setSelectedId((current) => payload.data.some((person) => person.id === current) ? current : "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : `Unable to load ${noun} candidates.`);
    } finally {
      setCandidateLoading(false);
    }
  }

  useEffect(() => {
    setError("");
    setNotice("");
    void loadRelationships();
    void loadCandidates("");
    // The course and relationship kind define this isolated management view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, mode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCandidates(search), 240);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function addRelationship() {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    try {
      await request(apiBase, `/courses/${courseId}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(isEnrollment ? { learnerId: selectedId } : { instructorId: selectedId }),
      });
      setSelectedId("");
      setNotice(`${noun.charAt(0).toUpperCase() + noun.slice(1)} added to this course.`);
      await Promise.all([loadRelationships(), loadCandidates(search)]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Unable to add the ${noun}.`);
    } finally {
      setSaving(false);
    }
  }

  async function removeRelationship(relationship: Relationship) {
    const person = displayName(relationship, mode);
    if (!window.confirm(`Remove ${person} from “${courseLabel}”? This keeps the history but ends the active relationship.`)) return;
    setError("");
    try {
      await request(apiBase, `/courses/${courseId}/${endpoint}/${relationship.id}/remove`, { method: "POST" });
      setNotice(`${person} removed from this course.`);
      await Promise.all([loadRelationships(), loadCandidates(search)]);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : `Unable to remove the ${noun}.`);
    }
  }

  const summary = useMemo(() => {
    if (loading) return "Checking the current course roster…";
    return `${relationships.length} active ${relationships.length === 1 ? noun : plural}`;
  }, [loading, noun, plural, relationships.length]);

  return (
    <section className="relationship-panel">
      <div className="relationship-heading">
        <div>
          <div className="eyebrow">Course operations</div>
          <h2>{title}</h2>
          <p>{summary} for <strong>{courseLabel}</strong>. Only active institution members with the correct role can be selected.</p>
        </div>
        <div className="relationship-count"><strong>{loading ? "—" : relationships.length}</strong><span>Active</span></div>
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t complete that action</strong><p>{error}</p></div>}
      {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}

      <div className="relationship-add">
        <div>
          <h3>Add a {noun}</h3>
          <p>Search by name or email, then choose a person to add.</p>
        </div>
        <div className="relationship-controls">
          <input aria-label={`Search ${plural}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${plural}…`} />
          <select aria-label={`Choose ${noun}`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={candidateLoading}>
            <option value="">{candidateLoading ? "Loading candidates…" : `Choose a ${noun}`}</option>
            {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{displayName(candidate)}{candidate.email ? ` · ${candidate.email}` : ""}</option>)}
          </select>
          <button className="primary-button" type="button" onClick={() => void addRelationship()} disabled={!selectedId || saving}>{saving ? "Adding…" : `Add ${noun}`}</button>
        </div>
      </div>

      <div className="relationship-list">
        <div className="relationship-list-heading"><span>{title}</span><span>Contact</span><span>Action</span></div>
        {!loading && relationships.length === 0 && (
          <div className="relationship-empty"><div className="state-symbol soft">+</div><div><strong>No active {plural} yet</strong><p>Add the first {noun} to this published course using the selector above.</p></div></div>
        )}
        {loading && <div className="relationship-empty"><div className="spinner" /><div><strong>Loading {plural}…</strong><p>Checking your institution-scoped roster.</p></div></div>}
        {!loading && relationships.map((relationship) => (
          <div className="relationship-row" key={relationship.id}>
            <div className="relationship-person"><div className="record-avatar">{displayName(relationship, mode).charAt(0).toUpperCase()}</div><strong>{displayName(relationship, mode)}</strong></div>
            <span>{relationship[`${isEnrollment ? "learner" : "instructor"}_email`] || "No email added"}</span>
            <button className="danger-action" type="button" onClick={() => void removeRelationship(relationship)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}