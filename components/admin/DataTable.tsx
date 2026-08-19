import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle = "Nothing here yet",
  emptyDescription = "New items will appear here when they are added.",
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
        <div>
          <span className="mx-auto mb-4 grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground"><Inbox className="size-5" /></span>
          <h3 className="font-heading text-sm font-semibold">{emptyTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50/80 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase dark:bg-slate-900/40">
            <tr>
              {columns.map((column) => <th key={column.key} className={cn("px-5 py-3", column.className)}>{column.header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={getRowKey(row)} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                {columns.map((column) => <td key={column.key} className={cn("px-5 py-4 align-middle", column.className)}>{column.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-slate-50/50 px-5 py-3 text-xs text-muted-foreground dark:bg-slate-900/20">
        <span>Showing {data.length} {data.length === 1 ? "item" : "items"}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
