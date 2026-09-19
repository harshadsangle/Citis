"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Role = { id: string; code?: string; name?: string; institution_id?: string | null; campus_id?: string | null };
type User = {
  id: string;
  email?: string | null;
  mobile?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string;
  last_login_at?: string | null;
  created_at?: string | null;
  roles?: Role[];
};
type Institution = { id: string; name?: string; code?: string };
type Campus = { id: string; name?: string; institution_id?: string | null };
type List<T> = { data?: T[]; meta?: { pagination?: { total?: number } } };

async function request<T>(apiBase: string, path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error?.message || payload?.error || "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function listData<T>(payload: List<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.data || [];
}
function personName(user: User) {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unnamed instructor";
}
function initials(user: User) {
  return `${user.first_name?.[0] || ""}${user.last_name?.[0] || user.email?.[0] || "I"}`.toUpperCase();
}
function dateLabel(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Unknown" : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function InstructorManager({ apiBase }: { apiBase: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partialError, setPartialError] = useState("");
  const [createdAccountId, setCreatedAccountId] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", mobile: "", password: "", roleId: "", institutionId: "", campusId: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [userPayload, rolePayload, institutionPayload, campusPayload] = await Promise.all([
        request<List<User>>(apiBase, "/users?page=1&pageSize=100"),
        request<List<Role>>(apiBase, "/roles/instructor-options"),
        request<List<Institution> | Institution[]>(apiBase, "/institutions/scoped-options"),
        request<List<Campus> | Campus[]>(apiBase, "/campuses/scoped-options"),
      ]);
      setUsers(listData(userPayload));
      setRoles(listData(rolePayload));
      setInstitutions(listData(institutionPayload));
      setCampuses(listData(campusPayload));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load instructor access.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const instructorRoles = useMemo(() => roles.filter((role) => ["TEACHER", "INSTRUCTOR"].includes((role.code || "").toUpperCase())), [roles]);
  const eligibleRole = useMemo(() => instructorRoles.find((role) => role.code?.toUpperCase() === "TEACHER") || instructorRoles.find((role) => role.code?.toUpperCase() === "INSTRUCTOR"), [instructorRoles]);
  const instructorUsers = useMemo(() => users.filter((user) => user.roles?.some((role) => ["TEACHER", "INSTRUCTOR"].includes((role.code || "").toUpperCase()))), [users]);
  const visibleUsers = useMemo(() => instructorUsers.filter((user) => {
    const haystack = `${personName(user)} ${user.email || ""} ${user.mobile || ""}`.toLowerCase();
    return (statusFilter === "ALL" || user.status === statusFilter) && haystack.includes(query.trim().toLowerCase());
  }), [instructorUsers, query, statusFilter]);
  const scopedCampuses = useMemo(() => campuses.filter((campus) => !form.institutionId || campus.institution_id === form.institutionId), [campuses, form.institutionId]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value, ...(key === "institutionId" ? { campusId: "" } : {}) }));
  }
  function openCreate() {
    setPartialError("");
    setCreatedAccountId("");
    setForm({ firstName: "", lastName: "", email: "", mobile: "", password: "", roleId: eligibleRole?.id || "", institutionId: "", campusId: "" });
    setModalOpen(true);
  }
  function validate() {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.email.trim() && !form.mobile.trim()) return "Add an email address or mobile number.";
    if (form.password.length < 10 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) return "Use at least 10 characters with uppercase, lowercase, and a number.";
    if (!form.roleId) return "Choose an instructor role.";
    if (!form.institutionId) return "Choose an institution.";
    return "";
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    if (validation) { setPartialError(validation); return; }
    setSaving(true); setPartialError(""); setError("");
    try {
      const created = await request<{ data?: User } | User>(apiBase, "/users", {
        method: "POST",
        body: JSON.stringify({ firstName: form.firstName.trim(), lastName: form.lastName.trim() || undefined, email: form.email.trim() || undefined, mobile: form.mobile.trim() || undefined, password: form.password }),
      });
      const createdUser = (created as { data?: User }).data || created as User;
      try {
        await request(apiBase, `/users/${createdUser.id}/roles`, { method: "POST", body: JSON.stringify({ roleId: form.roleId, institutionId: form.institutionId, ...(form.campusId ? { campusId: form.campusId } : {}) }) });
        setModalOpen(false);
        setNotice(`${personName(createdUser)} was created and granted teaching access.`);
        await load();
      } catch (roleError) {
        setCreatedAccountId(createdUser.id);
        setPartialError(`Account created, but teaching access was not assigned. ${roleError instanceof Error ? roleError.message : "Retry role assignment from the account record."}`);
        await load();
      }
    } catch (createError) {
      setPartialError(createError instanceof Error ? createError.message : "Unable to create this account.");
    } finally { setSaving(false); }
  }
  async function retryRoleAssignment() {
    if (!createdAccountId || !form.roleId || !form.institutionId) return;
    setSaving(true); setPartialError("");
    try {
      await request(apiBase, `/users/${createdAccountId}/roles`, { method: "POST", body: JSON.stringify({ roleId: form.roleId, institutionId: form.institutionId, ...(form.campusId ? { campusId: form.campusId } : {}) }) });
      setModalOpen(false); setCreatedAccountId(""); setNotice("Teaching access was assigned to the newly created account."); await load();
    } catch (retryError) {
      setPartialError(retryError instanceof Error ? retryError.message : "Teaching access is still pending. Confirm the scope and try again.");
    } finally { setSaving(false); }
  }
  async function toggleStatus(user: User) {
    const next = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`${next === "ACTIVE" ? "Activate" : "Deactivate"} ${personName(user)}?`)) return;
    try {
      await request(apiBase, `/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: next } : item));
      setNotice(`${personName(user)} is now ${next === "ACTIVE" ? "active" : "inactive"}.`);
    } catch (toggleError) { setError(toggleError instanceof Error ? toggleError.message : "Unable to update account status."); }
  }

  return <section className="instructor-workspace">
    <div className="instructor-summary">
      <div><span className="summary-label">Teaching access</span><strong>{instructorUsers.length}</strong><small>{instructorUsers.filter((user) => user.status === "ACTIVE").length} active accounts</small></div>
      <div><span className="summary-label">Last reviewed</span><strong className="summary-date">{dateLabel(new Date().toISOString())}</strong><small>Institution-scoped directory</small></div>
      <div className="summary-callout"><strong>Access is scoped</strong><span>Assign an institution to every instructor. Campus access is optional.</span></div>
    </div>
    {notice && <div className="relationship-alert success-box"><strong>Saved</strong><p>{notice}</p></div>}
    {error && <div className="relationship-alert error-box"><strong>We couldn’t load this directory</strong><p>{error}</p><button className="text-button" type="button" onClick={() => void load()}>Try again</button></div>}
    <div className="content-panel instructor-panel">
      <div className="panel-toolbar instructor-toolbar">
        <div><h2>Instructor directory</h2><span className="panel-subtitle">Manage people who can teach across your institution.</span></div>
        <button className="primary-button" type="button" onClick={openCreate} disabled={!eligibleRole || !institutions.length}><span>+</span> Add instructor</button>
      </div>
      <div className="instructor-filters"><label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone" aria-label="Search instructors" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} aria-label="Filter by status"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><span className="filter-count">{visibleUsers.length} shown</span></div>
      {loading ? <div className="state-box"><div className="skeleton-lines"><i /><i /><i /></div></div> : !error && visibleUsers.length === 0 ? <div className="state-box empty-box"><div className="state-symbol soft">+</div><div><strong>{instructorUsers.length ? "No instructors match these filters" : "No instructors yet"}</strong><p>{instructorUsers.length ? "Try a different name or status." : "Create an account to grant teaching access."}</p>{!instructorUsers.length && <button className="text-button" type="button" onClick={openCreate}>Add the first instructor</button>}</div></div> : <div className="instructor-table"><div className="instructor-head"><span>Person</span><span>Role and scope</span><span>Last sign-in</span><span>Status</span><span /></div>{visibleUsers.map((user) => { const role = user.roles?.find((item) => ["TEACHER", "INSTRUCTOR"].includes((item.code || "").toUpperCase())); const institution = institutions.find((item) => item.id === role?.institution_id); const campus = campuses.find((item) => item.id === role?.campus_id); return <div className="instructor-row" key={user.id}><div className="record-primary"><div className="record-avatar">{initials(user)}</div><div><strong className="record-title">{personName(user)}</strong><span className="record-meta">{user.email || user.mobile || "No contact detail"}</span></div></div><div className="scope-copy"><strong>{role?.name || role?.code || "Teaching role"}</strong><span>{institution?.name || "Institution scope"}{campus ? ` · ${campus.name}` : " · All campuses"}</span></div><span className="record-detail">{dateLabel(user.last_login_at)}</span><span className={`status-badge ${user.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{user.status === "ACTIVE" ? "Active" : "Inactive"}</span><button className="row-action-link" type="button" onClick={() => void toggleStatus(user)}>{user.status === "ACTIVE" ? "Deactivate" : "Activate"}</button></div>; })}</div>}
    </div>
    {modalOpen && <div className="modal-backdrop" role="presentation"><section className="modal instructor-modal" role="dialog" aria-modal="true" aria-labelledby="add-instructor-title"><div className="modal-heading"><div><div className="eyebrow">Teaching access</div><h2 id="add-instructor-title">Add instructor</h2></div><button className="close-button" type="button" onClick={() => setModalOpen(false)} aria-label="Close form">×</button></div><p className="modal-intro">Create the account first, then attach a scoped teaching role. Fields marked with <span>*</span> are required.</p>{partialError && <div className="relationship-alert error-box"><strong>Action needs attention</strong><p>{partialError}</p>{createdAccountId && <button className="text-button" type="button" onClick={() => void retryRoleAssignment()} disabled={saving}>Retry teaching access</button>}</div>}<form onSubmit={create}><div className="form-two"><label>First name *<input required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label><label>Last name<input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label></div><div className="form-two"><label>Email {form.mobile ? "" : "*"}<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>Mobile {form.email ? "" : "*"}<input value={form.mobile} onChange={(event) => update("mobile", event.target.value)} /></label></div><label>Initial password *<input type="password" required value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="10+ characters, upper, lower, number" /><span className="field-hint">The instructor can change this after signing in.</span></label><label>Teaching role *<select required value={form.roleId} onChange={(event) => update("roleId", event.target.value)}><option value="">Choose a role</option>{instructorRoles.map((role) => <option key={role.id} value={role.id}>{role.name || role.code}</option>)}</select></label><label>Institution *<select required value={form.institutionId} onChange={(event) => update("institutionId", event.target.value)}><option value="">Choose an institution</option>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name || institution.code || institution.id}</option>)}</select></label><label>Campus scope <select value={form.campusId} onChange={(event) => update("campusId", event.target.value)} disabled={!form.institutionId}><option value="">All campuses</option>{scopedCampuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name || campus.id}</option>)}</select></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Creating account…" : "Create and grant access"}</button></div></form></section></div>}
  </section>;
}