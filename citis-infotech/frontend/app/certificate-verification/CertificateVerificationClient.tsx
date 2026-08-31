"use client";

import { useState } from "react";
import { CheckCircle2, Search, ShieldAlert } from "lucide-react";

type VerificationResult = {
  valid: boolean;
  certificate_number?: string;
  verification_id?: string;
  learner_name?: string;
  course_title?: string;
  course_code?: string;
  institution_name?: string;
  issue_date?: string;
};

export function CertificateVerificationClient() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) {
      setError("Enter a certificate number or verification ID.");
      setResult(null);
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`/api/v1/public/certificates/verify/${encodeURIComponent(value)}`);
      const body = await response.json().catch(() => null) as { data?: VerificationResult; error?: { message?: string } } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error?.message || "Verification is temporarily unavailable.");
      setResult(body.data);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Verification is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface mx-auto mt-10 max-w-2xl rounded-3xl p-6 sm:p-10">
      <form onSubmit={verify} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="certificate-identifier" className="sr-only">Certificate number or verification ID</label>
        <input
          id="certificate-identifier"
          value={identifier}
          onChange={(event) => { setIdentifier(event.target.value); setError(""); }}
          placeholder="e.g. CITIS-2026-ABC1234567"
          className="min-h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70">
          <Search className="size-4" />
          {busy ? "Checking…" : "Verify certificate"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
      {result && (
        result.valid ? (
          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-6" />
              <h2 className="font-heading text-xl font-semibold">Certificate verified</h2>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Learner</dt><dd className="mt-1 font-semibold">{result.learner_name}</dd></div>
              <div><dt className="text-muted-foreground">Course</dt><dd className="mt-1 font-semibold">{result.course_title}</dd></div>
              <div><dt className="text-muted-foreground">Institution</dt><dd className="mt-1 font-semibold">{result.institution_name}</dd></div>
              <div><dt className="text-muted-foreground">Issued</dt><dd className="mt-1 font-semibold">{result.issue_date ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(result.issue_date)) : "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Certificate number</dt><dd className="mt-1 font-semibold">{result.certificate_number}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="size-6" />
              <h2 className="font-heading text-xl font-semibold">Certificate not found</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">We couldn’t verify that certificate number or verification ID. Check the value and try again.</p>
          </div>
        )
      )}
    </div>
  );
}