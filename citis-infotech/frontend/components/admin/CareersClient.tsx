"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, LoaderCircle, RefreshCw } from "lucide-react";
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
import { careerService } from "@/services/api";
import type { AdminCareer, AdminJobApplication } from "@/types";

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function applicationStatusLabel(status: AdminJobApplication["status"]) {
  if (status === "reviewed") return "Reviewed";
  if (status === "shortlisted") return "Shortlisted";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function careerTitle(row: AdminJobApplication) {
  if (row.career && typeof row.career === "object") return row.career.title;
  return "Open role";
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(
  /\/api\/v1\/?$/,
  "",
);

function resumeHref(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function CareersClient() {
  const [tab, setTab] = useState<"positions" | "applications">("applications");
  const [positions, setPositions] = useState<AdminCareer[]>([]);
  const [applications, setApplications] = useState<AdminJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<AdminJobApplication | null>(null);
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
      const [careersRes, appsRes] = await Promise.all([
        careerService.list(token),
        careerService.listApplications(token),
      ]);
      setPositions((careersRes.data as AdminCareer[]) ?? []);
      setApplications(appsRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load careers data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      const title = careerTitle(row).toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        title.includes(q)
      );
    });
  }, [applications, search, statusFilter]);

  const filteredPositions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return positions.filter((row) => {
      if (statusFilter === "open" && row.status !== "open") return false;
      if (statusFilter === "closed" && row.status !== "closed") return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q)
      );
    });
  }, [positions, search, statusFilter]);

  const updateApplication = async (
    item: AdminJobApplication,
    status: AdminJobApplication["status"],
  ) => {
    const id = String(item._id ?? item.id);
    const token = getAdminToken();
    if (!token || !id) return;
    setBusyId(id);
    try {
      const response = await careerService.updateApplication(token, id, { status });
      setApplications((prev) =>
        prev.map((row) => (String(row._id ?? row.id) === id ? response.data : row)),
      );
      setSelected((current) =>
        current && String(current._id ?? current.id) === id ? response.data : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update application");
    } finally {
      setBusyId("");
    }
  };

  const positionColumns: DataTableColumn<AdminCareer>[] = useMemo(
    () => [
      {
        key: "role",
        header: "Position",
        render: (row) => (
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground">
              {row.department} · {row.location}
            </p>
          </div>
        ),
      },
      {
        key: "applications",
        header: "Applications",
        render: (row) => <span className="font-medium">{row.applicationsCount ?? 0}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status === "open" ? "Open" : "Closed"} />,
      },
      {
        key: "date",
        header: "Posted",
        render: (row) => (
          <span className="text-muted-foreground">{formatWhen(row.createdAt)}</span>
        ),
      },
    ],
    [],
  );

  const applicationColumns: DataTableColumn<AdminJobApplication>[] = useMemo(
    () => [
      {
        key: "candidate",
        header: "Candidate",
        render: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (row) => <span className="text-muted-foreground">{careerTitle(row)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={applicationStatusLabel(row.status)} />,
      },
      {
        key: "time",
        header: "Applied",
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
              aria-label="View application"
              disabled={busyId === id}
              onClick={() => {
                setSelected(row);
                if (row.status === "pending") void updateApplication(row, "reviewed");
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
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Careers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live open roles and applications from MongoDB.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={tab === "applications" ? "default" : "outline"}
          onClick={() => {
            setTab("applications");
            setStatusFilter("all");
            setSearch("");
          }}
        >
          Applications ({applications.length})
        </Button>
        <Button
          size="sm"
          variant={tab === "positions" ? "default" : "outline"}
          onClick={() => {
            setTab("positions");
            setStatusFilter("all");
            setSearch("");
          }}
        >
          Positions ({positions.length})
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "applications" ? "Search applications…" : "Search positions…"}
          aria-label="Search careers"
          className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:max-w-xs"
        />
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary"
        >
          {tab === "applications" ? (
            <>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </>
          ) : (
            <>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </>
          )}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="animate-spin" /> Loading careers…
          </span>
        </div>
      ) : tab === "applications" ? (
        <DataTable
          columns={applicationColumns}
          data={filteredApplications}
          getRowKey={(row) => String(row._id ?? row.id)}
          emptyTitle="No applications yet"
          emptyDescription="Apply from a /careers role page after seeding jobs."
        />
      ) : (
        <DataTable
          columns={positionColumns}
          data={filteredPositions}
          getRowKey={(row) => String(row._id ?? row.id)}
          emptyTitle="No positions posted"
          emptyDescription="Run npm run seed in backend to create the open roles."
        />
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {careerTitle(selected)} · {formatWhen(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-semibold">Email:</span> {selected.email}
                </p>
                {selected.phone && (
                  <p>
                    <span className="font-semibold">Phone:</span> {selected.phone}
                  </p>
                )}
                {selected.linkedIn && (
                  <p>
                    <span className="font-semibold">LinkedIn:</span>{" "}
                    <a className="text-primary underline" href={selected.linkedIn} target="_blank" rel="noreferrer">
                      {selected.linkedIn}
                    </a>
                  </p>
                )}
                {selected.portfolio && (
                  <p>
                    <span className="font-semibold">Portfolio:</span>{" "}
                    <a className="text-primary underline" href={selected.portfolio} target="_blank" rel="noreferrer">
                      {selected.portfolio}
                    </a>
                  </p>
                )}
                {selected.skills?.length ? (
                  <p>
                    <span className="font-semibold">Skills:</span> {selected.skills.join(", ")}
                  </p>
                ) : null}
                {selected.coverLetter && (
                  <p className="rounded-lg border border-border bg-muted/40 p-4 leading-7 whitespace-pre-wrap">
                    {selected.coverLetter}
                  </p>
                )}
                <p>
                  <a
                    className="font-semibold text-primary underline"
                    href={resumeHref(selected.resume)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download résumé
                  </a>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void updateApplication(selected, "reviewed")}>
                  Reviewed
                </Button>
                <Button size="sm" variant="accent" onClick={() => void updateApplication(selected, "shortlisted")}>
                  Shortlist
                </Button>
                <Button size="sm" variant="destructive" onClick={() => void updateApplication(selected, "rejected")}>
                  Reject
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
