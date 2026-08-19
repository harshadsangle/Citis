import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { blogs } from "@/components/admin/mock-data";

type Blog = (typeof blogs)[number];
const columns: DataTableColumn<Blog>[] = [
  { key: "title", header: "Article", render: (row) => <div><p className="font-medium">{row.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{row.category}</p></div> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "date", header: "Published / updated", render: (row) => <span className="text-muted-foreground">{row.date}</span> },
  { key: "actions", header: "", className: "w-12 text-right", render: (row) => <RowActions label={row.title} /> },
];

export default function BlogsPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Blogs" description="Create, review, and publish insights from your team." actionLabel="New article" /><TableToolbar placeholder="Search articles…" filters={["All status", "All categories"]} /><DataTable columns={columns} data={blogs} getRowKey={(row) => row.id} emptyTitle="No articles yet" /></div>;
}
