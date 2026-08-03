import Link from "next/link";
import { ArrowRight, Briefcase, Mail, Megaphone, Newspaper, Package, Plus, Users } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { applications, dashboardStats, messages } from "@/components/admin/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statIcons = [Newspaper, Briefcase, Mail, Users];
const quickActions = [
  { label: "Write a blog post", href: "/admin/blogs", icon: Newspaper, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  { label: "Add a product", href: "/admin/products", icon: Package, color: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" },
  { label: "Post a job", href: "/admin/careers", icon: Briefcase, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  { label: "Send newsletter", href: "/admin/newsletter", icon: Megaphone, color: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#0F4C81] dark:text-blue-300">Monday, August 3</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening across CITIS InfoTech.</p>
        </div>
        <Button size="sm" asChild><Link href="/admin/blogs"><Plus /> Create content</Link></Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        {dashboardStats.map((stat, index) => <StatsCard key={stat.title} {...stat} icon={statIcons[index]} />)}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-5">
            <div><CardTitle className="text-base">Recent messages</CardTitle><p className="mt-1 text-xs text-muted-foreground">Latest contact form enquiries</p></div>
            <Button asChild variant="ghost" size="sm"><Link href="/admin/messages">View all <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent className="px-5 pb-2">
            <div className="divide-y divide-border">
              {messages.slice(0, 4).map((message) => (
                <Link href="/admin/messages" key={message.id} className="flex items-start gap-3 py-3.5 transition hover:opacity-75">
                  <Avatar className="size-9"><AvatarFallback>{message.name.split(" ").map((part) => part[0]).join("")}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{message.name}</p>{message.status === "Unread" && <span className="size-1.5 rounded-full bg-blue-600" />}</div>
                    <p className="truncate text-xs font-medium text-foreground/80">{message.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{message.preview}</p>
                  </div>
                  <time className="shrink-0 text-[11px] text-muted-foreground">{message.time}</time>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between p-5 pb-2">
              <div><CardTitle className="text-base">Recent applications</CardTitle><p className="mt-1 text-xs text-muted-foreground">3 awaiting review</p></div>
              <Button asChild variant="ghost" size="sm"><Link href="/admin/careers">Manage <ArrowRight /></Link></Button>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {applications.map((application) => (
                <div key={application.name} className="flex items-center gap-3 py-2.5">
                  <Avatar className="size-8"><AvatarFallback className="text-[11px]">{application.initials}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{application.name}</p><p className="truncate text-xs text-muted-foreground">{application.role}</p></div>
                  <span className="text-[10px] text-muted-foreground">{application.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-3"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-5 pb-5">
              {quickActions.map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href} className="group rounded-lg border border-border p-3 transition hover:border-primary/30 hover:shadow-sm">
                  <span className={`mb-2 grid size-8 place-items-center rounded-lg ${color}`}><Icon className="size-4" /></span>
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
