import { ArrowUpRight, Clock3, Eye, MousePointerClick, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const traffic = [
  { day: "Mon", value: 58 }, { day: "Tue", value: 72 }, { day: "Wed", value: 64 },
  { day: "Thu", value: 86 }, { day: "Fri", value: 76 }, { day: "Sat", value: 48 }, { day: "Sun", value: 67 },
];
const content = [
  { label: "Blog posts", value: 24, total: 30, color: "bg-[#0F4C81]" },
  { label: "Case studies", value: 12, total: 20, color: "bg-blue-500" },
  { label: "Products", value: 4, total: 10, color: "bg-cyan-500" },
  { label: "Open careers", value: 8, total: 10, color: "bg-indigo-500" },
];
const sources = [["Organic search", "48%", "12,840"], ["Direct", "27%", "7,223"], ["Social", "16%", "4,281"], ["Referral", "9%", "2,408"]];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><h1 className="font-heading text-2xl font-semibold tracking-tight">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Website performance and content engagement at a glance.</p></div>
        <select defaultValue="30" className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Page views", value: "26,752", change: "12.4%", icon: Eye },
          { label: "Unique visitors", value: "18,429", change: "9.7%", icon: Users },
          { label: "Avg. session", value: "3m 42s", change: "5.1%", icon: Clock3 },
          { label: "Engagement rate", value: "62.8%", change: "3.2%", icon: MousePointerClick },
        ].map(({ label, value, change, icon: Icon }) => (
          <Card key={label} className="p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 font-heading text-2xl font-semibold">{value}</p></div><span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-[#0F4C81] dark:bg-blue-500/10 dark:text-blue-300"><Icon className="size-4.5" /></span></div>
            <p className="mt-3 flex items-center gap-1 text-xs text-emerald-600"><ArrowUpRight className="size-3.5" /> {change} <span className="text-muted-foreground">vs prior period</span></p>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="p-5"><CardTitle className="text-base">Page views</CardTitle><p className="text-xs text-muted-foreground">Daily traffic over the last 7 days</p></CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="relative h-64">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-muted-foreground">
                {[4, 3, 2, 1, 0].map((line) => <div key={line} className="flex items-center gap-2"><span className="w-7">{line * 1.5}k</span><span className="h-px flex-1 bg-border" /></div>)}
              </div>
              <svg viewBox="0 0 700 220" preserveAspectRatio="none" className="absolute inset-x-10 top-2 h-[195px] w-[calc(100%-2.5rem)]" role="img" aria-label="Page views line chart">
                <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity=".28" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 165 C55 145,75 100,115 112 S190 155,230 126 S300 42,350 66 S430 130,470 102 S540 55,585 78 S650 64,700 30 L700 220 L0 220 Z" fill="url(#chartFill)" />
                <path d="M0 165 C55 145,75 100,115 112 S190 155,230 126 S300 42,350 66 S430 130,470 102 S540 55,585 78 S650 64,700 30" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-x-9 bottom-0 flex justify-between pl-1 text-[10px] text-muted-foreground">{traffic.map((item) => <span key={item.day}>{item.day}</span>)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-5"><CardTitle className="text-base">Content inventory</CardTitle><p className="text-xs text-muted-foreground">Published and active content</p></CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            {content.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-xs"><span className="font-medium">{item.label}</span><span className="text-muted-foreground">{item.value}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / item.total) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="p-5"><CardTitle className="text-base">Traffic by source</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="divide-y divide-border">{sources.map(([source, share, visits]) => <div key={source} className="grid grid-cols-[1fr_auto_auto] items-center gap-6 py-3 text-sm"><span className="font-medium">{source}</span><span className="text-muted-foreground">{visits}</span><span className="w-10 text-right font-semibold">{share}</span></div>)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-5"><CardTitle className="text-base">Weekly engagement</CardTitle><p className="text-xs text-muted-foreground">Average engagement score by day</p></CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex h-44 items-end justify-between gap-3 border-b border-border pt-4">
              {traffic.map((item) => <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="relative flex-1"><div className="absolute inset-x-0 bottom-0 rounded-t-md bg-[#0F4C81] transition-opacity hover:opacity-80" style={{ height: `${item.value}%` }} title={`${item.value}%`} /></div><span className="text-center text-[10px] text-muted-foreground">{item.day}</span></div>)}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
