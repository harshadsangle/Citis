import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "We could not find any items matching your request.",
  actionLabel,
  actionHref,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-6" /></span>
      <h3 className="mt-5 font-heading text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && actionHref && <Button asChild variant="outline" className="mt-6"><Link href={actionHref}><ArrowLeft />{actionLabel}</Link></Button>}
    </div>
  );
}
