import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ count = 3, variant = "cards", className }: { count?: number; variant?: "cards" | "list" | "article"; className?: string }) {
  if (variant === "article") {
    return <div className={cn("mx-auto max-w-3xl space-y-5", className)}><Skeleton className="h-10 w-4/5" /><Skeleton className="h-5 w-2/5" /><Skeleton className="aspect-video w-full" />{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-4 w-full" />)}</div>;
  }
  return (
    <div className={cn(variant === "cards" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn("rounded-xl border border-border bg-card p-5", variant === "list" && "flex items-center gap-5")}>
          <Skeleton className={cn("rounded-lg", variant === "cards" ? "aspect-[16/10] w-full" : "size-20 shrink-0")} />
          <div className={cn("space-y-3", variant === "cards" ? "mt-5" : "flex-1")}><Skeleton className="h-5 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        </div>
      ))}
    </div>
  );
}
