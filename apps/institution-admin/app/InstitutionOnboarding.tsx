"use client";

import { type FormEvent, useState } from "react";

type Institution = {
  id: string;
  tenant_id?: string;
  name: string;
  slug?: string;
  institution_type?: string | null;
  status?: string;
};

type ImportRow = {
  row_number: number;
  college_user_id?: string | null;
  status: string;
  reason?: string | null;
};

type ImportResult = {
  id: string;
  original_filename?: string;
  status: "COMPLETED" | "PARTIAL" | "FAILED" | string;
  total_rows: number;
  imported_count: number;
  updated_count: number;
  duplicate_count: number;
  invalid_count: number;
  failed_count: number;
  rows: ImportRow[];
};

type ApiEnvelope<T> = { success: true; data: T };

async function request<T>(apiBase: string, path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const rawMessage = typeof payload?.message === "string"
      ? payload.message
      : Array.isArray(payload?.message)
        ? payload.message.filter((item: unknown) => typeof item === "string").join(" ")
        : typeof payload?.error?.message === "string"
          ? payload.error.message
          : typeof payload?.error === "string"
            ? payload.error
            : "The request could not be completed.";
    throw new Error(rawMessage);
  }
  return payload as T;
}

function generatedSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatCount(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export default function InstitutionOnboarding({
  apiBase,
  tenantId,
  existingInstitutions,
  open,
  onClose,
  onInstitutionCreated,
}: {
  apiBase: string;
  tenantId: string;
  existingInstitutions: Array<{ slug?: string }>;
  open: boolean;
  onClose: () => void;
  onInstitutionCreated: (institution: Institution) => void;
}) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  async function createInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 180) {
      setError("Enter an institution name between 2 and 180 characters.");
      return;
    }
    if (!tenantId) {
      setError("Your tenant scope could not be identified. Sign in again and retry.");
      return;
    }

    const slug = generatedSlug(cleanName);
    if (slug && existingInstitutions.some((current) => current.slug?.toLowerCase() === slug)) {
      setError("An institution with this generated slug already exists in the current tenant.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const response = await request<ApiEnvelope<Institution>>(apiBase, "/institutions", {
        method: "POST",
        body: JSON.stringify({ name: cleanName, tenantId }),
      });
      if (!response.data?.id || !response.data.name) {
        throw new Error("The institution was created, but the response did not include its details.");
      }
      setInstitution(response.data);
      setName(cleanName);
      setFile(null);
      setResult(null);
      onInstitutionCreated(response.data);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "The institution could not be created.");
    } finally {
      setCreating(false);
    }
  }

  function chooseFile(selected: File | null) {
    setError("");
    setResult(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Choose a .csv file.");
      return;
    }
    if (selected.size === 0) {
      setFile(null);
      setError("The CSV file is empty.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("The CSV file exceeds the 5 MB limit.");
      return;
    }
    setFile(selected);
  }

  async function importStudents(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!institution || !file) {
      setError("Create an institution and choose a CSV file before importing.");
      return;
    }
    const confirmed = window.confirm(
      `Import students for ${institution.name}? Existing College User IDs in this institution will be updated, including their password and active status.`,
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("institutionId", institution.id);
    setImporting(true);
    setError("");
    setResult(null);
    try {
      const response = await request<ApiEnvelope<ImportResult>>(apiBase, "/college-students/imports", {
        method: "POST",
        body: formData,
      });
      if (!response.data || !Array.isArray(response.data.rows)) {
        throw new Error("The import finished, but its row results could not be read.");
      }
      setResult(response.data);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "The CSV could not be imported.");
    } finally {
      setImporting(false);
    }
  }

  function startAnotherInstitution() {
    const confirmed = window.confirm(
      "Start a new institution flow? The institution already created and any imported student records will remain.",
    );
    if (!confirmed) return;
    setInstitution(null);
    setName("");
    setFile(null);
    setResult(null);
    setError("");
  }

  if (!open) return null;

  const problemRows = result?.rows.filter((row) => (
    row.status === "INVALID" || row.status === "DUPLICATE" || row.status === "FAILED"
  )) ?? [];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !creating && !importing) onClose();
      }}
    >
      <section
        className="modal institution-onboarding-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="institution-onboarding-title"
      >
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Institution setup</div>
            <h2 id="institution-onboarding-title">{institution ? "Import college students" : "Create institution"}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} disabled={creating || importing} aria-label="Close institution setup">×</button>
        </div>

        {!institution ? (
          <>
            <p className="modal-intro">
              Create the institution in your current tenant, then upload its student CSV using the existing College Student importer.
            </p>
            {error && <div className="relationship-alert error-box" role="alert"><strong>Could not create institution</strong><p>{error}</p></div>}
            <form className="institution-onboarding-form" onSubmit={(event) => void createInstitution(event)}>
              <label htmlFor="institution-name">Institution name</label>
              <input
                id="institution-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={180}
                autoFocus
                required
                placeholder="Enter the institution name"
              />
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={onClose} disabled={creating}>Cancel</button>
                <button className="primary-button" type="submit" disabled={creating || !tenantId}>
                  {creating ? "Creating…" : "Create institution"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="modal-intro">
              <strong>{institution.name}</strong> is created. Choose a CSV to add or update its College Student accounts.
            </p>
            <div className="institution-created-summary">
              <strong>Institution ready</strong>
              <span>{institution.slug ? `Slug: ${institution.slug}` : "The institution is available in the current tenant."}</span>
            </div>

            <div className="institution-csv-guidance">
              <strong>CSV format and validation</strong>
              <p>Required headers: <b>College User ID</b>, <b>Student Name</b>, <b>Password</b>, and <b>Active/Inactive status</b>.</p>
              <p><b>Email</b> and <b>Phone</b> are optional. The selected institution is applied to each row; if a <b>College/University</b> column is included, each value must match this institution.</p>
              <p>Passwords must be 8–128 characters with uppercase, lowercase, and a number. Status must be Active or Inactive. Maximum 5 MB and 5,000 rows.</p>
              <p>Existing College User IDs in this institution are updated, including password and active status. Duplicate IDs within the same CSV are reported, not imported twice.</p>
            </div>

            {error && <div className="relationship-alert error-box" role="alert"><strong>CSV import needs attention</strong><p>{error}</p></div>}

            <form className="institution-onboarding-form" onSubmit={(event) => void importStudents(event)}>
              <label htmlFor="institution-student-csv">Student CSV</label>
              <input
                id="institution-student-csv"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                disabled={importing}
              />
              {file && <span className="institution-file-name">{file.name} · {(file.size / 1024).toFixed(1)} KB</span>}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={onClose} disabled={importing}>Close</button>
                <button className="primary-button" type="submit" disabled={!file || importing}>
                  {importing ? "Validating and importing…" : "Validate and import"}
                </button>
              </div>
            </form>

            {result && (
              <section className={`institution-import-result ${result.status.toLowerCase()}`} aria-live="polite">
                <div className="institution-import-result-heading">
                  <div>
                    <strong>{result.status === "COMPLETED" ? "Import completed" : result.status === "PARTIAL" ? "Import completed with issues" : "Import failed"}</strong>
                    <span>{result.original_filename || "CSV import"} · {formatCount(result.total_rows)} rows</span>
                  </div>
                  <span className={`status-badge ${result.status === "COMPLETED" ? "is-active" : "is-inactive"}`}>{result.status}</span>
                </div>
                <div className="institution-import-counts">
                  <span><strong>{formatCount(result.imported_count)}</strong> imported</span>
                  <span><strong>{formatCount(result.updated_count)}</strong> updated</span>
                  <span><strong>{formatCount(result.duplicate_count)}</strong> duplicates</span>
                  <span><strong>{formatCount(result.invalid_count)}</strong> invalid</span>
                  <span><strong>{formatCount(result.failed_count)}</strong> failed</span>
                </div>
                {result.total_rows === 0 ? (
                  <p className="institution-import-clean">The CSV contained no student rows. Add at least one row below the header and import again.</p>
                ) : problemRows.length > 0 ? (
                  <div className="institution-import-issues">
                    <strong>Rows needing attention</strong>
                    <ul>
                      {problemRows.slice(0, 50).map((row) => (
                        <li key={`${row.row_number}-${row.status}`}>
                          <b>Row {row.row_number}</b>
                          {row.college_user_id ? ` · ${row.college_user_id}` : ""}
                          {` · ${row.status.toLowerCase()}`}
                          {row.reason ? ` — ${row.reason}` : ""}
                        </li>
                      ))}
                    </ul>
                    {problemRows.length > 50 && <p>Showing the first 50 of {problemRows.length} rows needing attention.</p>}
                  </div>
                ) : (
                  <p className="institution-import-clean">All rows were imported without validation issues.</p>
                )}
              </section>
            )}
            <div className="institution-import-actions">
              <button className="secondary-button" type="button" onClick={startAnotherInstitution} disabled={importing}>
                Create another institution
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}