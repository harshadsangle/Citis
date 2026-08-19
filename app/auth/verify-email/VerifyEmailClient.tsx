"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await apiFetch(`/auth/verify-email/${encodeURIComponent(token)}`, {
          method: "GET",
          revalidate: false,
        });
        if (!cancelled) {
          setStatus("success");
          setMessage("Your email has been verified. You can now sign in.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Verification failed or the link expired.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="surface mx-auto max-w-lg rounded-3xl p-7 sm:p-10">
      {status === "loading" && (
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <LoaderCircle className="size-6 animate-spin" />
        </span>
      )}
      {status === "success" && (
        <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-6" />
        </span>
      )}
      {status === "error" && (
        <span className="grid size-12 place-items-center rounded-xl bg-red-500/10 text-red-600">
          <XCircle className="size-6" />
        </span>
      )}
      <h1 className="mt-6 font-heading text-3xl font-semibold">
        {status === "success" ? "Email verified" : status === "error" ? "Verification issue" : "Verifying email"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
      <Link href="/auth/login" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" />
        Return to sign in
      </Link>
    </div>
  );
}
