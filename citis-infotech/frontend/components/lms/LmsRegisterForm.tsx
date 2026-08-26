"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LmsRoleField } from "@/components/lms/LmsRoleField";
import { LMS_SESSION_KEY, type LmsRole, type LmsUser } from "@/lib/lms-auth";

export function LmsRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role") ?? "student") as LmsRole;

    if (!name || !email.includes("@") || password.length < 6) {
      setError("Enter your name, a valid email, and a password with at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/lms/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, role }) });
      const result = await response.json() as { user?: LmsUser; error?: string };
      if (!response.ok || !result.user) {
        setError(result.error ?? "Unable to create your account right now.");
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
      <div><Label htmlFor="lms-name">Full name</Label><Input id="lms-name" name="name" autoComplete="name" placeholder="Your full name" className="mt-2" /></div>
      <div><Label htmlFor="lms-register-email">Email address</Label><Input id="lms-register-email" name="email" type="email" autoComplete="email" placeholder="you@institution.edu" className="mt-2" /></div>
      <div><Label htmlFor="lms-register-password">Create password</Label><Input id="lms-register-password" name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" className="mt-2" /></div>
      <LmsRoleField />
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>Create LMS account <ArrowRight /></Button>
    </form>
  );
}