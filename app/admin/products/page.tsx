import { Box } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AdminPageTitle, TableToolbar } from "@/components/admin/PageTools";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { products } from "@/components/admin/mock-data";

type Product = (typeof products)[number];
const columns: DataTableColumn<Product>[] = [
  { key: "name", header: "Product", render: (row) => <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-[#0F4C81] dark:bg-blue-500/10"><Box className="size-4" /></span><div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.category}</p></div></div> },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "updated", header: "Last updated", render: (row) => <span className="text-muted-foreground">{row.updated}</span> },
  { key: "actions", header: "", className: "w-12", render: (row) => <RowActions label={row.name} /> },
];

export default function ProductsPage() {
  return <div className="mx-auto max-w-[1600px]"><AdminPageTitle title="Products" description="Manage your product portfolio and product page visibility." actionLabel="Add product" /><TableToolbar placeholder="Search products…" /><DataTable columns={columns} data={products} getRowKey={(row) => row.id} emptyTitle="No products yet" /></div>;
}
