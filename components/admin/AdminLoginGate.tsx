"use client";

import { useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAdminSession, type AdminUser } from "@/lib/admin-auth";
import { authService } from "@/services/api";

export function AdminLoginGate({ onSuccess }: { onSuccess: (user: AdminUser) => void }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(email.trim(), password);
      const token = response.data.accessToken || response.data.token;
      if (!token) throw new Error("No access token returned");
      const user = {
        _id: String((response.data.user as { _id?: string; id?: string })._id ?? response.data.user.id),
        name: response.data.user.name,
        email: response.data.user.email,
        role: String(response.data.user.role),
      };
      if (!["admin", "super_admin"].includes(user.role)) {
        throw new Error("This account does not have admin access");
      }
      setAdminSession(token, user);
      onSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold">Admin sign in</h1>
            <p className="text-sm text-muted-foreground">Use your seeded admin account to manage messages.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><LoaderCircle className="animate-spin" />Signing in…</> : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
