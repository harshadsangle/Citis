"use client";

import { useEffect, useState } from "react";

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
  name?: string;
  slug?: string;
  institution_type?: string | null;
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
  first_name?: string;
  last_name?: string;
  email?: string | null;
  status?: string;
  created_at?: string | null;
  roles?: Array<{ code?: string; name?: string }>;
};

const registrationRoleCodes = new Set(["TEACHER", "INSTRUCTOR", "INSTITUTION_ADMINISTRATOR"]);

export function isPendingAccountRequest(user: AccountRequest) {
  return user.status === "PENDING"
    && Boolean(user.roles?.some((role) => registrationRoleCodes.has(role.code?.toUpperCase() || "")));
}

function requestedRole(user: AccountRequest) {
  const role = user.roles?.find((candidate) => registrationRoleCodes.has(candidate.code?.toUpperCase() || ""));
  if (role?.name) return role.name;
  if (role?.code?.toUpperCase() === "TEACHER" || role?.code?.toUpperCase() === "INSTRUCTOR") return "Instructor";
  if (role?.code?.toUpperCase() === "INSTITUTION_ADMINISTRATOR") return "Institution administrator";
  return "Staff access";
}

async function request<T>(apiBase: string, path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
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
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
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
            "/users?page=1&pageSize=100&status=PENDING&roleCode=TEACHER,INSTRUCTOR,INSTITUTION_ADMINISTRATOR",
          );
          const requests = listData<AccountRequest>(payload).filter(isPendingAccountRequest);
          if (!cancelled) {
            setAccountRequests(requests);
            onAccountRequestCountChange?.(requests.length);
          }
        } else if (mode === "institution-profile") {
          const payload = await request<unknown>(apiBase, "/institutions/scoped-options");
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
  }, [apiBase, mode, onAccountRequestCountChange]);

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
          ? accountRequests.length
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
      </div>

      {error && <div className="relationship-alert error-box"><strong>We couldn’t load this view</strong><p>{error}</p></div>}
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
            <div className="record-row" key={learner.id}>
              <div className="record-primary"><div className="record-avatar">{personName(learner).charAt(0).toUpperCase()}</div><div><strong className="record-title">{personName(learner)}</strong><span className="record-meta">{learner.email || "No email added"}</span></div></div>
              <span className="record-detail">{learner.mobile || learner.email || "No contact detail"}</span>
              <span className="record-detail">{dateLabel(learner.last_login_at)}</span>
              <span className={`status-badge ${learner.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{learner.status || "Unknown"}</span>
            </div>
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
              <button className="row-action-link" type="button" onClick={() => setSelectedRequest(accountRequest)}>Review request</button>
            </div>
          ))}
        </div>
      )}

      {!error && !loading && mode === "institution-profile" && institutions.length > 0 && (
        <div className="record-list">
          <div className="list-head"><span>Institution</span><span>Type</span><span>Slug</span><span>Status</span></div>
          {institutions.map((institution) => (
            <div className="record-row" key={institution.id}>
              <div className="record-primary"><div className="record-avatar">{(institution.name || "I").charAt(0).toUpperCase()}</div><strong className="record-title">{institution.name || "Unnamed institution"}</strong></div>
              <span className="record-detail">{institution.institution_type || "Not specified"}</span>
              <span className="record-detail">{institution.slug || "—"}</span>
              <span className={`status-badge ${institution.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{institution.status || "Unknown"}</span>
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
            <p className="modal-intro">Submitted details are shown below. This review does not approve or change the account.</p>
            <dl className="account-request-details">
              <div><dt>Applicant</dt><dd>{personName(selectedRequest)}</dd></div>
              <div><dt>Email</dt><dd>{selectedRequest.email || "Not provided"}</dd></div>
              <div><dt>Requested access</dt><dd>{requestedRole(selectedRequest)}</dd></div>
              <div><dt>Submitted</dt><dd>{dateLabel(selectedRequest.created_at)}</dd></div>
              <div><dt>Current status</dt><dd><span className="status-badge is-inactive">Pending review</span></dd></div>
            </dl>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}