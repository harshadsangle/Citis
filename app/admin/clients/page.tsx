import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { clients } from "@/components/admin/mock-data";

type Client = (typeof clients)[number];
const columns: DataTableColumn<Client>[] = [
  { key: "client", header: "Client", render: (row) => <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg border border-border bg-slate-50 text-xs font-bold text-[#0F4C81] dark:bg-slate-900">{row.initials}</span><p className="font-medium">{row.name}</p></div> },
  { key: "industry", header: "Industry", render: (row) => <span className="text-muted-foreground">{row.industry}</span> },
  { key: "status", header: "Visibility", render: (row) => <StatusBadge status={row.status} /> },
  { key: "added", header: "Added", render: (row) => <span className="text-muted-foreground">{row.added}</span> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.name} /> },
];

export default function ClientsPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Clients" description="Manage client logos and homepage visibility." actionLabel="Add client" /><TableToolbar placeholder="Search clients…" filters={["All visibility", "All industries"]} /><DataTable columns={columns} data={clients} getRowKey={(row) => row.id} emptyTitle="No clients yet" /></div>;
}
