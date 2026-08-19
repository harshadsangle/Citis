import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export function StatsCard({ title, value, change, icon: Icon, trend = "up" }: StatsCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-blue-400/10 dark:text-blue-300">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <TrendIcon className={trend === "up" ? "size-3.5 text-emerald-600" : "size-3.5 text-rose-600"} />
        <span className="font-medium text-foreground">{change}</span>
      </div>
    </article>
  );
}
