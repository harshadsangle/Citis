"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, UserMinus, UserPlus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { getAdminToken } from "@/lib/admin-auth";
import { newsletterService } from "@/services/api";
import type { NewsletterSubscriber } from "@/types";

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function NewsletterClient() {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setError("Sign in required");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await newsletterService.list(token, {
        search: search.trim() || undefined,
        limit: 100,
      });
      setItems(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load subscribers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (statusFilter === "active") return items.filter((row) => row.isActive);
    if (statusFilter === "inactive") return items.filter((row) => !row.isActive);
    return items;
  }, [items, statusFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((row) => row.isActive).length;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newThisMonth = items.filter((row) => {
      const when = row.subscribedAt || row.createdAt;
      return when ? new Date(when) >= monthStart : false;
    }).length;
    return { total, active, newThisMonth };
  }, [items]);

  const setActive = async (item: NewsletterSubscriber, isActive: boolean) => {
    const id = String(item._id ?? item.id);
    const token = getAdminToken();
    if (!token || !id) return;
    setBusyId(id);
    try {
      const response = await newsletterService.setActive(token, id, isActive);
      setItems((prev) => prev.map((row) => (String(row._id ?? row.id) === id ? response.data : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update subscriber");
    } finally {
      setBusyId("");
    }
  };

  const columns: DataTableColumn<NewsletterSubscriber>[] = useMemo(
    () => [
      {
        key: "email",
        header: "Subscriber",
        render: (row) => <span className="font-medium">{row.email}</span>,
      },
      {
        key: "date",
        header: "Subscribed",
        render: (row) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatWhen(row.subscribedAt || row.createdAt)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.isActive ? "Subscribed" : "Unsubscribed"} />,
      },
      {
        key: "actions",
        header: "",
        className: "w-36",
        render: (row) => {
          const id = String(row._id ?? row.id);
          return (
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === id}
              onClick={() => void setActive(row, !row.isActive)}
            >
              {row.isActive ? (
                <>
                  <UserMinus className="size-3.5" /> Unsubscribe
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5" /> Reactivate
                </>
              )}
            </Button>
          );
        },
      },
    ],
    [busyId],
  );

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live footer subscribers from MongoDB.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          [String(stats.total), "Total subscribers"],
          [String(stats.active), "Active"],
          [String(stats.newThisMonth), "New this month"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="font-heading text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subscribers…"
          aria-label="Search subscribers"
          className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:max-w-xs"
        />
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary"
        >
          <option value="all">All subscribers</option>
          <option value="active">Active</option>
          <option value="inactive">Unsubscribed</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" /> Loading subscribers…
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visible}
          getRowKey={(row) => String(row._id ?? row.id)}
          emptyTitle="No subscribers yet"
          emptyDescription="Subscribe from the site footer to see emails here."
        />
      )}
    </div>
  );
}
