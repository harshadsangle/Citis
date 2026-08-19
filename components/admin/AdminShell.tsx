"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  clearAdminSession,
  getAdminToken,
  getAdminUser,
  type AdminUser,
} from "@/lib/admin-auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    const saved = getAdminUser();
    if (token && saved) setUser(saved);
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading admin…</div>;
  }

  if (!user || !getAdminToken()) {
    return <AdminLoginGate onSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen lg:pl-64">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          userName={user.name}
          onSignOut={() => {
            clearAdminSession();
            setUser(null);
          }}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
