import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { subscribers } from "@/components/admin/mock-data";

type Subscriber = (typeof subscribers)[number];
const columns: DataTableColumn<Subscriber>[] = [
  { key: "email", header: "Subscriber", render: (row) => <span className="font-medium">{row.email}</span> },
  { key: "source", header: "Source", render: (row) => <span className="text-muted-foreground">{row.source}</span> },
  { key: "date", header: "Subscribed", render: (row) => <span className="text-muted-foreground">{row.subscribed}</span> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.email} /> },
];

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminPageTitle title="Newsletter" description="Manage your audience and subscriber preferences." actionLabel="Add subscriber" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[["2,486", "Total subscribers"], ["214", "New this month"], ["42.8%", "Average open rate"]].map(([value, label]) => <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm"><p className="font-heading text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
      </div>
      <TableToolbar placeholder="Search subscribers…" filters={["All subscribers", "All sources"]} />
      <DataTable columns={columns} data={subscribers} getRowKey={(row) => row.id} emptyTitle="No subscribers yet" />
    </div>
  );
}
