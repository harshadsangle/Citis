import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { careers } from "@/components/admin/mock-data";

type Career = (typeof careers)[number];
const columns: DataTableColumn<Career>[] = [
  { key: "role", header: "Position", render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.department} · {row.location}</p></div> },
  { key: "applications", header: "Applications", render: (row) => <span className="font-medium">{row.applications}</span> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "date", header: "Posted", render: (row) => <span className="text-muted-foreground">{row.date}</span> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.title} /> },
];

export default function CareersPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Careers" description="Publish job openings and review incoming applications." actionLabel="Post a job" /><TableToolbar placeholder="Search positions…" filters={["All status", "All departments"]} /><DataTable columns={columns} data={careers} getRowKey={(row) => row.id} emptyTitle="No positions posted" /></div>;
}
