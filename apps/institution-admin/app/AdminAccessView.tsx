"use client";

import { Fragment, type FormEvent, useEffect, useState } from "react";
import InstitutionOnboarding from "./InstitutionOnboarding";
import StudentLoginActivityCalendar from "../../shared/login-activity-calendar/StudentLoginActivityCalendar";

export type AdminAccessMode = "learners" | "institution-profile" | "campuses" | "roles" | "account-requests";

type Learner = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  mobile?: string | null;
  status?: string;
  last_login_at?: string | null;
  roles?: Array<{ code?: string; name?: string }>;
};

type Institution = {
  id: string;
  tenant_id?: string;
  name?: string;
  slug?: string;
  institution_type?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status?: string;
};

type Campus = {
  id: string;
  institution_id: string;
  name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status?: string;
};

type Role = {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
  status?: string;
};

export type AccountRequest = {
  id: string;
  tenant_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  status?: string;
  created_at?: string | null;
  roles?: Array<{ code?: string; name?: string }>;
};

const registrationRoleCodes = new Set(["TEACHER", "INSTRUCTOR", "INSTITUTION_ADMINISTRATOR"]);
const instructorRoleCodes = new Set(["TEACHER", "INSTRUCTOR"]);

export function isPendingAccountRequest(user: AccountRequest) {
  return user.status === "PENDING"
    && Boolean(user.roles?.some((role) => registrationRoleCodes.has(role.code?.toUpperCase() || "")));
}

function isInstructorRequest(user: AccountRequest) {
  return user.roles?.some((role) => instructorRoleCodes.has(role.code?.toUpperCase() || "")) === true;
}

function requestedRole(user: AccountRequest) {
  const role = user.roles?.find((candidate) => registrationRoleCodes.has(candidate.code?.toUpperCase() || ""));
  if (role?.name) return role.name;
  if (role?.code?.toUpperCase() === "TEACHER" || role?.code?.toUpperCase() === "INSTRUCTOR") return "Instructor";
  if (role?.code?.toUpperCase() === "INSTITUTION_ADMINISTRATOR") return "Institution administrator";
  return "Staff access";
}

async function request<T>(apiBase: string, path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(`${apiBase}${path}`, {
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
        : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

function listData<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === "object" && payload !== null && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  throw new Error("The response did not contain a list.");
}

function hasCitisAdminRole(user: unknown) {
  if (typeof user !== "object" || user === null) return false;
  const roles = (user as { roles?: unknown }).roles;
  return Array.isArray(roles) && roles.some((role: unknown) => {
    if (typeof role !== "object" || role === null) return false;
    const code = (role as { code?: unknown }).code;
    return typeof code === "string" && code.trim().toUpperCase() === "CITIS_ADMIN";
  });
}

function personName(person: Learner) {
  return `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Unnamed learner";
}

function dateLabel(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function locationLabel(campus: Campus) {
  return [campus.address, campus.city, campus.state, campus.country].filter(Boolean).join(", ") || "Location not provided";
}

export default function AdminAccessView({
  apiBase,
  mode,
  onAccountRequestCountChange,
}: {
  apiBase: string;
  mode: AdminAccessMode;
  onAccountRequestCountChange?: (count: number) => void;
}) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loginActivityLearnerId, setLoginActivityLearnerId] = useState("");
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [accountRequestTotal, setAccountRequestTotal] = useState(0);
  const [accountRequestPage, setAccountRequestPage] = useState(1);
  const [accountRequestTotalPages, setAccountRequestTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [requestInstitutions, setRequestInstitutions] = useState<Institution[]>([]);
  const [requestCampuses, setRequestCampuses] = useState<Campus[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingRequest, setRejectingRequest] = useState(false);
  const [requestOptionsLoading, setRequestOptionsLoading] = useState(false);
  const [requestActionBusy, setRequestActionBusy] = useState(false);
  const [requestActionError, setRequestActionError] = useState("");
  const [requestNotice, setRequestNotice] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [canCreateInstitution, setCanCreateInstitution] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [institutionFlowOpen, setInstitutionFlowOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [savingInstitution, setSavingInstitution] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoginActivityLearnerId("");
    setLoading(true);
    setError("");

    async function load() {
      try {
        if (mode === "learners") {
          const payload = await request<unknown>(apiBase, "/users?page=1&pageSize=100");
          const scopedLearners = listData<Learner>(payload).filter((user) => (
            user.roles?.some((role) => role.code?.toUpperCase() === "STUDENT")
          ));
          if (!cancelled) setLearners(scopedLearners);
        } else if (mode === "account-requests") {
          const payload = await request<unknown>(
            apiBase,
            `/users?page=${accountRequestPage}&pageSize=100&status=PENDING&roleCode=TEACHER,INSTRUCTOR,INSTITUTION_ADMINISTRATOR`,
          );
          if (typeof payload !== "object" || payload === null || !Array.isArray((payload as { data?: unknown }).data)) {
            throw new Error("The response did not contain account requests.");
          }
          const paginated = payload as {
            data: AccountRequest[];
            meta?: { pagination?: { total?: number; totalPages?: number } };
          };
          const requests = paginated.data.filter(isPendingAccountRequest);
          if (!cancelled) {
            setAccountRequests(requests);
            const total = paginated.meta?.pagination?.total ?? requests.length;
            setAccountRequestTotal(total);
            setAccountRequestTotalPages(Math.max(1, paginated.meta?.pagination?.totalPages ?? 1));
            onAccountRequestCountChange?.(total);
          }
        } else if (mode === "institution-profile") {
          const payload = canCreateInstitution
            ? await request<unknown>(apiBase, "/institutions?page=1&pageSize=100")
            : await request<unknown>(apiBase, "/institutions/scoped-options");
          if (!cancelled) setInstitutions(listData<Institution>(payload));
        } else if (mode === "campuses") {
          const [institutionPayload, campusPayload] = await Promise.all([
            request<unknown>(apiBase, "/institutions/scoped-options"),
            request<unknown>(apiBase, "/campuses/scoped-options"),
          ]);
          if (!cancelled) {
            setInstitutions(listData<Institution>(institutionPayload));
            setCampuses(listData<Campus>(campusPayload));
          }
        } else {
          const payload = await request<unknown>(apiBase, "/roles/instructor-options");
          if (!cancelled) setRoles(listData<Role>(payload));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load this view.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [accountRequestPage, apiBase, canCreateInstitution, mode, onAccountRequestCountChange]);

  useEffect(() => {
    if (mode !== "account-requests" || !selectedRequest || !isInstructorRequest(selectedRequest)) {
      setRequestOptionsLoading(false);
      return;
    }

    let cancelled = false;
    const tenantQuery = selectedRequest.tenant_id
      ? `?tenantId=${encodeURIComponent(selectedRequest.tenant_id)}`
      : "";
    setRequestOptionsLoading(true);
    setRequestActionError("");

    async function loadRequestOptions() {
      try {
        const [institutionPayload, campusPayload] = await Promise.all([
          request<unknown>(apiBase, `/institutions/scoped-options${tenantQuery}`),
          request<unknown>(apiBase, `/campuses/scoped-options${tenantQuery}`),
        ]);
        const nextInstitutions = listData<Institution>(institutionPayload);
        const nextCampuses = listData<Campus>(campusPayload);
        if (cancelled) return;
        const activeInstitutions = nextInstitutions.filter((institution) => !institution.status || institution.status === "ACTIVE");
        setRequestInstitutions(nextInstitutions);
        setRequestCampuses(nextCampuses);
        setSelectedInstitutionId(activeInstitutions.length === 1 ? activeInstitutions[0].id : "");
      } catch (loadError) {
        if (!cancelled) {
          setRequestActionError(loadError instanceof Error ? loadError.message : "The institution options could not be loaded.");
        }
      } finally {
        if (!cancelled) setRequestOptionsLoading(false);
      }
    }

    void loadRequestOptions();
    return () => {
      cancelled = true;
    };
  }, [apiBase, mode, selectedRequest]);

  function openAccountRequest(accountRequest: AccountRequest) {
    setSelectedRequest(accountRequest);
    setSelectedInstitutionId("");
    setSelectedCampusId("");
    setRejectionReason("");
    setRejectingRequest(false);
    setRequestActionError("");
  }

  function completeAccountRequest(request: AccountRequest, outcome: "approved" | "rejected") {
    const nextTotal = Math.max(0, accountRequestTotal - 1);
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / 100));
    setAccountRequests((current) => current.filter((item) => item.id !== request.id));
    setAccountRequestTotal(nextTotal);
    setAccountRequestTotalPages(nextTotalPages);
    if (accountRequestPage > nextTotalPages) setAccountRequestPage(nextTotalPages);
    onAccountRequestCountChange?.(nextTotal);
    setRequestNotice(outcome === "approved"
      ? `${personName(request)} was approved. Their instructor account is active.`
      : `${personName(request)} was rejected. The reason was recorded.`);
    setSelectedRequest(null);
    setRejectingRequest(false);
  }

  async function approveAccountRequest() {
    if (!selectedRequest || !isInstructorRequest(selectedRequest) || !selectedInstitutionId || requestActionBusy) return;
    setRequestActionBusy(true);
    setRequestActionError("");
    try {
      await request(apiBase, `/users/${selectedRequest.id}/instructor-request/approve`, {
        method: "POST",
        body: JSON.stringify({
          institutionId: selectedInstitutionId,
          ...(selectedCampusId ? { campusId: selectedCampusId } : {}),
        }),
      });
      completeAccountRequest(selectedRequest, "approved");
    } catch (actionError) {
      setRequestActionError(actionError instanceof Error ? actionError.message : "The instructor request could not be approved.");
    } finally {
      setRequestActionBusy(false);
    }
  }

  async function rejectAccountRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRequest || !isInstructorRequest(selectedRequest) || requestActionBusy) return;
    const reason = rejectionReason.trim();
    if (reason.length < 3) {
      setRequestActionError("Enter a reason for rejecting this request.");
      return;
    }
    setRequestActionBusy(true);
    setRequestActionError("");
    try {
      await request(apiBase, `/users/${selectedRequest.id}/instructor-request/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      completeAccountRequest(selectedRequest, "rejected");
    } catch (actionError) {
      setRequestActionError(actionError instanceof Error ? actionError.message : "The instructor request could not be rejected.");
    } finally {
      setRequestActionBusy(false);
    }
  }

  useEffect(() => {
    if (mode !== "institution-profile") {
      setInstitutionFlowOpen(false);
      return;
    }

    let cancelled = false;
    async function loadCurrentAdmin() {
      try {
        const payload = await request<unknown>(apiBase, "/auth/me", { cache: "no-store" });
        if (typeof payload !== "object" || payload === null || !("data" in payload)) {
          throw new Error("The current account could not be read.");
        }
        const user = (payload as { data?: unknown }).data;
        if (typeof user !== "object" || user === null) throw new Error("The current account could not be read.");
        const currentAdmin = user as { tenantId?: unknown; tenant_id?: unknown };
        if (!cancelled) {
          const tenantId = currentAdmin.tenantId ?? currentAdmin.tenant_id;
          setCanCreateInstitution(hasCitisAdminRole(user));
          setTenantId(typeof tenantId === "string" ? tenantId : "");
        }
      } catch {
        if (!cancelled) {
          setCanCreateInstitution(false);
          setTenantId("");
        }
      }
    }

    void loadCurrentAdmin();
    return () => {
      cancelled = true;
    };
  }, [apiBase, mode]);

  function beginInstitutionEdit(institution: Institution) {
    setEditingInstitution(institution);
    setEditName(institution.name || "");
    setEditStatus(institution.status || "ACTIVE");
    setEditEmail(institution.email || "");
    setEditPhone(institution.phone || "");
    setEditWebsite(institution.website || "");
    setError("");
  }

  async function saveInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingInstitution) return;
    const name = editName.trim();
    if (name.length < 2 || name.length > 180) {
      setError("Enter an institution name between 2 and 180 characters.");
      return;
    }
    setSavingInstitution(true);
    setError("");
    try {
      const payload = await request<{ data: Institution }>(apiBase, `/institutions/${editingInstitution.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          status: editStatus,
          email: editEmail.trim() || undefined,
          phone: editPhone.trim() || undefined,
          website: editWebsite.trim() || undefined,
        }),
      });
      const updated = payload.data;
      if (!updated?.id) throw new Error("The institution was updated, but its details could not be read.");
      setInstitutions((current) => current.map((institution) => (
        institution.id === updated.id ? { ...institution, ...updated } : institution
      )));
      setEditingInstitution(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The institution could not be updated.");
    } finally {
      setSavingInstitution(false);
    }
  }

  const title = mode === "learners"
    ? "Learners"
    : mode === "institution-profile"
      ? "Institution profile"
      : mode === "campuses"
        ? "Campuses"
            : mode === "account-requests"
              ? "Pending account requests"
              : "Teaching roles";
  const count = mode === "learners"
    ? learners.length
    : mode === "institution-profile"
      ? institutions.length
      : mode === "campuses"
        ? campuses.length
        : mode === "account-requests"
          ? accountRequestTotal
          : roles.length;
  const summary = loading
    ? mode === "account-requests" ? "Loading staff registrations awaiting review…" : "Loading records in your current institution scope…"
    : mode === "roles"
      ? `${count} active teaching ${count === 1 ? "role" : "roles"} available to this portal.`
      : mode === "account-requests"
        ? `${count} staff ${count === 1 ? "request" : "requests"} awaiting administrator review. Opening a request does not change its status.`
      : `${count} ${mode === "learners" ? "learners" : mode === "institution-profile" ? "institutions" : "campuses"} in your current scope.`;

  return (
    <section className="content-panel">
      <div className="panel-toolbar">
        <div>
          <h2>{title}</h2>
          <span className="panel-subtitle">{summary}</span>
        </div>
        {mode === "institution-profile" && canCreateInstitution && (
          <button
            className="primary-button institution-create-button"
            type="button"
            aria-haspopup="dialog"
            onClick={() => setInstitutionFlowOpen(true)}
          >
            <span>+</span> Create Institution
          </button>
        )}
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t load this view</strong><p>{error}</p></div>}
      {requestNotice && mode === "account-requests" && <div className="relationship-alert success-box" role="status"><strong>Request updated</strong><p>{requestNotice}</p></div>}
      {!error && loading && <div className="state-box"><div className="spinner" /><div><strong>Loading {title.toLowerCase()}…</strong><p>Checking your institution-scoped records.</p></div></div>}
      {!error && !loading && count === 0 && (
        <div className="state-box empty-box">
          <div className="state-symbol soft">+</div>
          <div><strong>No {title.toLowerCase()} found</strong><p>There are no matching records in your current institution scope.</p></div>
        </div>
      )}

      {!error && !loading && mode === "learners" && learners.length > 0 && (
        <div className="record-list">
          <div className="list-head"><span>Learner</span><span>Contact</span><span>Last sign-in</span><span>Status</span></div>
          {learners.map((learner) => (
            <Fragment key={learner.id}>
              <div className="record-row">
                <div className="record-primary">
                  <div className="record-avatar">{personName(learner).charAt(0).toUpperCase()}</div>
                  <div>
                    <strong className="record-title">{personName(learner)}</strong>
                    <span className="record-meta">{learner.email || "No email added"}</span>
                    <button
                      className="row-action-link login-activity-toggle"
                      type="button"
                      aria-expanded={loginActivityLearnerId === learner.id}
                      aria-controls={`admin-login-activity-${learner.id}`}
                      onClick={() => setLoginActivityLearnerId((current) => current === learner.id ? "" : learner.id)}
                    >
                      {loginActivityLearnerId === learner.id ? "Hide sign-in calendar" : "View sign-in calendar"}
                    </button>
                  </div>
                </div>
                <span className="record-detail">{learner.mobile || learner.email || "No contact detail"}</span>
                <span className="record-detail">{dateLabel(learner.last_login_at)}</span>
                <span className={`status-badge ${learner.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{learner.status || "Unknown"}</span>
              </div>
              {loginActivityLearnerId === learner.id && (
                <div className="login-activity-detail" id={`admin-login-activity-${learner.id}`}>
                  <StudentLoginActivityCalendar key={learner.id} apiBase={apiBase} studentId={learner.id} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}

      {!error && !loading && mode === "account-requests" && accountRequests.length > 0 && (
        <div className="record-list">
          <div className="list-head account-request-list-head"><span>Applicant</span><span>Email</span><span>Requested access</span><span>Review</span></div>
          {accountRequests.map((accountRequest) => (
            <div className="record-row account-request-row" key={accountRequest.id}>
              <div className="record-primary">
                <div className="record-avatar">{personName(accountRequest).charAt(0).toUpperCase()}</div>
                <div>
                  <strong className="record-title">{personName(accountRequest)}</strong>
                  <span className="record-meta">Submitted {dateLabel(accountRequest.created_at)}</span>
                </div>
              </div>
              <span className="record-detail">{accountRequest.email || "No email provided"}</span>
              <span className="record-detail">{requestedRole(accountRequest)}</span>
              <button className="row-action-link" type="button" onClick={() => openAccountRequest(accountRequest)}>Review request</button>
            </div>
          ))}
          {accountRequestTotalPages > 1 && (
            <div className="account-request-pagination" aria-label="Account request pages">
              <span>Page {accountRequestPage} of {accountRequestTotalPages}</span>
              <button type="button" onClick={() => setAccountRequestPage((page) => Math.max(1, page - 1))} disabled={accountRequestPage <= 1}>Previous</button>
              <button type="button" onClick={() => setAccountRequestPage((page) => Math.min(accountRequestTotalPages, page + 1))} disabled={accountRequestPage >= accountRequestTotalPages}>Next</button>
            </div>
          )}
        </div>
      )}

      {!error && !loading && mode === "institution-profile" && institutions.length > 0 && (
        <div className="record-list">
          <div className="list-head"><span>Institution</span><span>Type</span><span>Contact</span><span>Status</span><span>Manage</span></div>
          {institutions.map((institution) => (
            <div className="record-row" key={institution.id}>
              <div className="record-primary"><div className="record-avatar">{(institution.name || "I").charAt(0).toUpperCase()}</div><strong className="record-title">{institution.name || "Unnamed institution"}</strong></div>
              <span className="record-detail">{institution.institution_type || "Not specified"}</span>
              <span className="record-detail">{institution.email || institution.phone || "No contact details"}</span>
              <span className={`status-badge ${institution.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{institution.status || "Unknown"}</span>
              {canCreateInstitution ? (
                <button className="row-action-link" type="button" onClick={() => beginInstitutionEdit(institution)}>Manage</button>
              ) : <span className="record-detail">—</span>}
            </div>
          ))}
        </div>
      )}

      {!error && !loading && mode === "campuses" && campuses.length > 0 && (
        <div className="record-list">
          <div className="list-head"><span>Campus</span><span>Institution</span><span>Location</span><span>Status</span></div>
          {campuses.map((campus) => (
            <div className="record-row" key={campus.id}>
              <div className="record-primary"><div className="record-avatar">{(campus.name || "C").charAt(0).toUpperCase()}</div><strong className="record-title">{campus.name || "Unnamed campus"}</strong></div>
              <span className="record-detail">{institutions.find((institution) => institution.id === campus.institution_id)?.name || "Institution scope"}</span>
              <span className="record-detail">{locationLabel(campus)}</span>
              <span className={`status-badge ${campus.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{campus.status || "Unknown"}</span>
            </div>
          ))}
        </div>
      )}

      {!error && !loading && mode === "roles" && roles.length > 0 && (
        <div className="record-list">
          <div className="list-head"><span>Role</span><span>Code</span><span>Description</span><span>Status</span></div>
          {roles.map((role) => (
            <div className="record-row" key={role.id}>
              <div className="record-primary"><div className="record-avatar">{(role.name || "R").charAt(0).toUpperCase()}</div><strong className="record-title">{role.name || role.code || "Unnamed role"}</strong></div>
              <span className="record-detail">{role.code || "—"}</span>
              <span className="record-detail">{role.description || "Teaching role available in this institution scope"}</span>
              <span className={`status-badge ${role.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{role.status || "ACTIVE"}</span>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && mode === "account-requests" && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal account-request-modal" role="dialog" aria-modal="true" aria-labelledby="account-request-title">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">Staff registration</div>
                <h2 id="account-request-title">Review account request</h2>
              </div>
              <button className="close-button" type="button" onClick={() => setSelectedRequest(null)} aria-label="Close request details">×</button>
            </div>
            <p className="modal-intro">{isInstructorRequest(selectedRequest) ? "Review the instructor request, assign its institution scope, then approve or reject it." : "Submitted details are shown below. This request type is view-only."}</p>
            <dl className="account-request-details">
              <div><dt>Applicant</dt><dd>{personName(selectedRequest)}</dd></div>
              <div><dt>Email</dt><dd>{selectedRequest.email || "Not provided"}</dd></div>
              <div><dt>Requested access</dt><dd>{requestedRole(selectedRequest)}</dd></div>
              <div><dt>Submitted</dt><dd>{dateLabel(selectedRequest.created_at)}</dd></div>
              <div><dt>Current status</dt><dd><span className="status-badge is-inactive">Pending review</span></dd></div>
            </dl>
            {isInstructorRequest(selectedRequest) ? (
              <>
                <div className="account-request-scope">
                  <label htmlFor="instructor-request-institution">Institution for teaching access</label>
                  <select
                    id="instructor-request-institution"
                    value={selectedInstitutionId}
                    onChange={(event) => {
                      setSelectedInstitutionId(event.target.value);
                      setSelectedCampusId("");
                    }}
                    disabled={requestActionBusy || requestOptionsLoading}
                    required
                  >
                    <option value="">Choose an active institution</option>
                    {requestInstitutions.filter((institution) => !institution.status || institution.status === "ACTIVE").map((institution) => (
                      <option key={institution.id} value={institution.id}>{institution.name || "Unnamed institution"}</option>
                    ))}
                  </select>
                  <label htmlFor="instructor-request-campus">Campus (optional)</label>
                  <select
                    id="instructor-request-campus"
                    value={selectedCampusId}
                    onChange={(event) => setSelectedCampusId(event.target.value)}
                    disabled={requestActionBusy || requestOptionsLoading || !selectedInstitutionId}
                  >
                    <option value="">All campuses</option>
                    {requestCampuses.filter((campus) => campus.institution_id === selectedInstitutionId && (!campus.status || campus.status === "ACTIVE")).map((campus) => (
                      <option key={campus.id} value={campus.id}>{campus.name || "Unnamed campus"}</option>
                    ))}
                  </select>
                </div>
                {requestInstitutions.filter((institution) => !institution.status || institution.status === "ACTIVE").length === 0 && (
                  <div className="relationship-alert error-box" role="alert"><strong>No active institution scope</strong><p>Teaching access cannot be activated until an active institution is available in your scope.</p></div>
                )}
                {requestOptionsLoading && <div className="state-box" role="status"><div className="spinner" /><div><strong>Loading institution scope…</strong><p>Checking the institutions available for this request.</p></div></div>}
                {requestActionError && <div className="relationship-alert error-box" role="alert"><strong>Request not updated</strong><p>{requestActionError}</p></div>}
                {rejectingRequest ? (
                  <form className="account-request-rejection" onSubmit={(event) => void rejectAccountRequest(event)}>
                    <label htmlFor="instructor-request-reason">Reason for rejection</label>
                    <textarea
                      id="instructor-request-reason"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      minLength={3}
                      maxLength={1000}
                      rows={4}
                      required
                      disabled={requestActionBusy}
                    />
                    <div className="modal-actions">
                      <button className="secondary-button" type="button" onClick={() => { setRejectingRequest(false); setRequestActionError(""); }} disabled={requestActionBusy}>Back</button>
                      <button className="primary-button" type="submit" disabled={requestActionBusy || rejectionReason.trim().length < 3}>{requestActionBusy ? "Rejecting…" : "Confirm rejection"}</button>
                    </div>
                  </form>
                ) : (
                  <div className="modal-actions">
                    <button className="secondary-button" type="button" onClick={() => setSelectedRequest(null)} disabled={requestActionBusy}>Close</button>
                    <button className="secondary-button" type="button" onClick={() => { setRejectingRequest(true); setRequestActionError(""); }} disabled={requestActionBusy}>Reject</button>
                    <button className="primary-button" type="button" onClick={() => void approveAccountRequest()} disabled={requestActionBusy || requestOptionsLoading || !selectedInstitutionId || requestInstitutions.filter((institution) => !institution.status || institution.status === "ACTIVE").length === 0}>{requestActionBusy ? "Approving…" : "Approve & activate"}</button>
                  </div>
                )}
              </>
            ) : (
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setSelectedRequest(null)}>Close</button>
              </div>
            )}
          </section>
        </div>
      )}

      {editingInstitution && mode === "institution-profile" && canCreateInstitution && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal institution-onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="institution-edit-title">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">Institution management</div>
                <h2 id="institution-edit-title">Manage institution</h2>
              </div>
              <button className="close-button" type="button" onClick={() => setEditingInstitution(null)} disabled={savingInstitution} aria-label="Close institution management">×</button>
            </div>
            {error && <div className="relationship-alert error-box" role="alert"><strong>Could not update institution</strong><p>{error}</p></div>}
            <form className="institution-onboarding-form" onSubmit={(event) => void saveInstitution(event)}>
              <label htmlFor="edit-institution-name">Institution name</label>
              <input id="edit-institution-name" type="text" value={editName} onChange={(event) => setEditName(event.target.value)} minLength={2} maxLength={180} required autoFocus />
              <label htmlFor="edit-institution-status">Status</label>
              <select id="edit-institution-status" value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <div className="form-grid-two">
                <div>
                  <label htmlFor="edit-institution-email">Contact email</label>
                  <input id="edit-institution-email" type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
                </div>
                <div>
                  <label htmlFor="edit-institution-phone">Phone</label>
                  <input id="edit-institution-phone" type="tel" value={editPhone} onChange={(event) => setEditPhone(event.target.value)} minLength={7} maxLength={30} />
                </div>
              </div>
              <label htmlFor="edit-institution-website">Website</label>
              <input id="edit-institution-website" type="url" value={editWebsite} onChange={(event) => setEditWebsite(event.target.value)} />
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setEditingInstitution(null)} disabled={savingInstitution}>Cancel</button>
                <button className="primary-button" type="submit" disabled={savingInstitution}>{savingInstitution ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {canCreateInstitution && tenantId && (
        <InstitutionOnboarding
          apiBase={apiBase}
          tenantId={tenantId}
          existingInstitutions={institutions}
          open={institutionFlowOpen}
          onClose={() => setInstitutionFlowOpen(false)}
          onInstitutionCreated={(institution) => {
            setInstitutions((current) => {
              if (current.some((existing) => existing.id === institution.id)) return current;
              return [...current, institution].sort((left, right) => (left.name || "").localeCompare(right.name || ""));
            });
          }}
        />
      )}
    </section>
  );
}