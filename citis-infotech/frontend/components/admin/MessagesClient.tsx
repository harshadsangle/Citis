"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, LoaderCircle, Mail, MailOpen, RefreshCw, Trash2 } from "lucide-react";
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
import { contactService } from "@/services/api";
import type { Contact } from "@/types";

function statusLabel(status?: Contact["status"]) {
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

export function MessagesClient() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Contact | null>(null);
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
      const response = await contactService.list(token, {
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100,
      });
      setItems(response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (item: Contact, status: "new" | "read" | "replied") => {
    const id = String(item._id ?? item.id);
    const token = getAdminToken();
    if (!token || !id) return;
    setBusyId(id);
    try {
      const response = await contactService.updateStatus(token, id, status);
      setItems((prev) => prev.map((row) => (String(row._id ?? row.id) === id ? response.data : row)));
      setSelected((current) => (current && String(current._id ?? current.id) === id ? response.data : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update message");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item: Contact) => {
    const id = String(item._id ?? item.id);
    const token = getAdminToken();
    if (!token || !id) return;
    if (!window.confirm(`Delete message from ${item.name}?`)) return;
    setBusyId(id);
    try {
      await contactService.remove(token, id);
      setItems((prev) => prev.filter((row) => String(row._id ?? row.id) !== id));
      setSelected((current) => (current && String(current._id ?? current.id) === id ? null : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete message");
    } finally {
      setBusyId("");
    }
  };

  const columns: DataTableColumn<Contact>[] = useMemo(
    () => [
      {
        key: "sender",
        header: "Sender",
        render: (row) => (
          <div className="flex items-center gap-3">
            {row.status === "new" ? (
              <Mail className="size-4 text-blue-600" />
            ) : (
              <MailOpen className="size-4 text-muted-foreground" />
            )}
            <div>
              <p className={row.status === "new" ? "font-semibold" : "font-medium"}>{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "message",
        header: "Message",
        className: "max-w-xl",
        render: (row) => (
          <div>
            <p className={row.status === "new" ? "font-semibold" : "font-medium"}>
              {row.subject || "General inquiry"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.message}</p>
          </div>
        ),
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
        className: "w-28",
        render: (row) => {
          const id = String(row._id ?? row.id);
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="View message"
                disabled={busyId === id}
                onClick={() => {
                  setSelected(row);
                  if (row.status === "new") void updateStatus(row, "read");
                }}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                aria-label="Delete message"
                disabled={busyId === id}
                onClick={() => void remove(row)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
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
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live Contact Us enquiries from MongoDB.
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
          placeholder="Search messages…"
          aria-label="Search messages"
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
          <span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" /> Loading messages…</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          getRowKey={(row) => String(row._id ?? row.id)}
          emptyTitle="Inbox zero"
          emptyDescription="No contact form submissions yet. Submit one from /contact."
        />
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject || "General inquiry"}</DialogTitle>
                <DialogDescription>
                  From {selected.name} ({selected.email}) · {formatWhen(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {selected.phone && <p><span className="font-semibold">Phone:</span> {selected.phone}</p>}
                {selected.company && <p><span className="font-semibold">Organization:</span> {selected.company}</p>}
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
                <Button size="sm" variant="destructive" onClick={() => void remove(selected)}>
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
