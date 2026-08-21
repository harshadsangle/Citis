"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, LoaderCircle, Mail, MailOpen, RefreshCw } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminToken } from "@/lib/admin-auth";
import { partnerService } from "@/services/api";
import type { PartnerInquiry } from "@/types";

function statusLabel(status?: PartnerInquiry["status"]) {
  if (status === "read") return "Read";
  if (status === "replied") return "Replied";
  return "Unread";
}

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function typeLabel(value?: string) {
  const map: Record<string, string> = {
    academic: "Academic",
    industry: "Industry",
    delivery: "Delivery",
    technology: "Technology",
  };
  return value ? map[value] || value : "—";
}

export function PartnersClient() {
  const [items, setItems] = useState<PartnerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<PartnerInquiry | null>(null);
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
      const response = await partnerService.list(token, {
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100,
      });
      setItems(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load partner inquiries");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (item: PartnerInquiry, status: "new" | "read" | "replied") => {
    const id = String(item._id ?? item.id);
    const token = getAdminToken();
    if (!token || !id) return;
    setBusyId(id);
    try {
      const response = await partnerService.updateStatus(token, id, status);
      setItems((prev) => prev.map((row) => (String(row._id ?? row.id) === id ? response.data : row)));
      setSelected((current) => (current && String(current._id ?? current.id) === id ? response.data : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update inquiry");
    } finally {
      setBusyId("");
    }
  };

  const columns: DataTableColumn<PartnerInquiry>[] = useMemo(
    () => [
      {
        key: "sender",
        header: "Organization",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.status === "new" ? (
              <Mail className="size-4 text-blue-600" />
            ) : (
              <MailOpen className="size-4 text-muted-foreground" />
            )}
            <div>
              <p className={row.status === "new" ? "font-semibold" : "font-medium"}>
                {row.organization || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.name} · {row.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Model",
        render: (row) => <span className="text-muted-foreground">{typeLabel(row.partnershipType)}</span>,
      },
      {
        key: "message",
        header: "Message",
        className: "max-w-xl",
        render: (row) => <p className="truncate text-sm text-muted-foreground">{row.message}</p>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={statusLabel(row.status)} />,
      },
      {
        key: "time",
        header: "Received",
        render: (row) => (
          <span className="whitespace-nowrap text-muted-foreground">{formatWhen(row.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-16",
        render: (row) => {
          const id = String(row._id ?? row.id);
          return (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="View inquiry"
              disabled={busyId === id}
              onClick={() => {
                setSelected(row);
                if (row.status === "new") void updateStatus(row, "read");
              }}
            >
              <Eye className="size-4" />
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
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Partners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live partnership inquiries from /partner.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inquiries…"
          aria-label="Search partner inquiries"
          className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:max-w-xs"
        />
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="new">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" /> Loading inquiries…
          </span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => String(row._id ?? row.id)}
          emptyTitle="No partner inquiries yet"
          emptyDescription="Submit one from /partner to see it here."
        />
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.organization || "Partnership inquiry"}</DialogTitle>
                <DialogDescription>
                  From {selected.name} ({selected.email}) · {formatWhen(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-semibold">Model:</span> {typeLabel(selected.partnershipType)}
                </p>
                {selected.phone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {selected.phone}
                  </p>
                )}
                {selected.website && (
                  <p>
                    <span className="font-semibold">Website:</span> {selected.website}
                  </p>
                )}
                <p className="rounded-lg border border-border bg-muted/40 p-4 leading-7 whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void updateStatus(selected, "read")}>
                  Mark read
                </Button>
                <Button size="sm" variant="accent" onClick={() => void updateStatus(selected, "replied")}>
                  Mark replied
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
