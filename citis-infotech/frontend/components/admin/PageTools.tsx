import type { ReactNode } from "react";
import { Download, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPageTitle({ title, description, actionLabel = "Add new", actionIcon }: { title: string; description: string; actionLabel?: string; actionIcon?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button size="sm">{actionIcon ?? <Plus />} {actionLabel}</Button>
    </div>
  );
}

export function TableToolbar({ placeholder = "Search…", filters = ["All status"] }: { placeholder?: string; filters?: string[] }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input placeholder={placeholder} aria-label={placeholder} className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
      </div>
      {filters.map((filter) => (
        <select key={filter} aria-label={filter} defaultValue="all" className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary">
          <option value="all">{filter}</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      ))}
      <Button variant="outline" size="sm" className="sm:ml-auto"><Download /> Export</Button>
    </div>
  );
}
