import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { caseStudies } from "@/components/admin/mock-data";

type CaseStudy = (typeof caseStudies)[number];
const columns: DataTableColumn<CaseStudy>[] = [
  { key: "study", header: "Case study", render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{row.client}</p></div> },
  { key: "service", header: "Service", render: (row) => <span className="text-muted-foreground">{row.service}</span> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "date", header: "Updated", render: (row) => <span className="text-muted-foreground">{row.date}</span> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.title} /> },
];

export default function CaseStudiesPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Case Studies" description="Showcase measurable outcomes delivered for your clients." actionLabel="New case study" /><TableToolbar placeholder="Search case studies…" filters={["All status", "All services"]} /><DataTable columns={columns} data={caseStudies} getRowKey={(row) => row.id} emptyTitle="No case studies yet" /></div>;
}
