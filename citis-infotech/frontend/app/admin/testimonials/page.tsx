import { Quote } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { testimonials } from "@/components/admin/mock-data";

type Testimonial = (typeof testimonials)[number];
const columns: DataTableColumn<Testimonial>[] = [
  { key: "person", header: "Client", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.company}</p></div> },
  { key: "quote", header: "Testimonial", className: "max-w-xl", render: (row) => <div className="flex gap-2 text-muted-foreground"><Quote className="mt-0.5 size-4 shrink-0 text-primary/50" /><p className="line-clamp-2">{row.quote}</p></div> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.name} /> },
];

export default function TestimonialsPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Testimonials" description="Curate customer stories and social proof shown on the site." actionLabel="Add testimonial" /><TableToolbar placeholder="Search testimonials…" /><DataTable columns={columns} data={testimonials} getRowKey={(row) => row.id} emptyTitle="No testimonials yet" /></div>;
}
