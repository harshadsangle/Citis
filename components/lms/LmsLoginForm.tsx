"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LmsLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    router.push("/lms/dashboard");
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
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="accent" size="lg" className="w-full">
        Sign in to LMS
        <ArrowRight />
      </Button>
    </form>
  );
}