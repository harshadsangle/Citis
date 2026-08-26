"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LmsRoleField } from "@/components/lms/LmsRoleField";
import { LMS_SESSION_KEY, type LmsUser } from "@/lib/lms-auth";

export function LmsLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !email.includes("@") || !password) {
      setError("Enter a valid email and password to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/lms/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json() as { user?: LmsUser; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error ?? "Unable to sign in right now.");
        return;
      }
      window.localStorage.setItem(LMS_SESSION_KEY, JSON.stringify(result.user));
      router.push("/lms/dashboard");
    } catch {
      setError("Unable to connect to the LMS. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="lms-email">Email address</Label>
        <Input id="lms-email" name="email" type="email" autoComplete="email" placeholder="you@institution.edu" className="mt-2" />
      </div>
      <div>
        <Label htmlFor="lms-password">Password</Label>
        <Input id="lms-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="mt-2" />
      </div>
      <LmsRoleField />
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
        Sign in to LMS
        <ArrowRight />
      </Button>
    </form>
  );
}