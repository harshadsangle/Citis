"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, BookOpen, Briefcase, Building2, FileText, Image, LayoutDashboard,
  Mail, Megaphone, MessageSquareQuote, Newspaper, Package, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Blogs", href: "/admin/blogs", icon: Newspaper },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Careers", href: "/admin/careers", icon: Briefcase },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Clients", href: "/admin/clients", icon: Building2 },
  { label: "Case Studies", href: "/admin/case-studies", icon: BookOpen },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Newsletter", href: "/admin/newsletter", icon: Megaphone },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0F4C81] text-white shadow-2xl transition-transform duration-200 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="grid size-8 place-items-center rounded-lg bg-white font-heading font-bold text-[#0F4C81]">C</span>
            <span className="font-heading text-sm font-semibold tracking-tight">CITIS Admin</span>
          </Link>
          <button className="rounded-md p-1.5 text-blue-100 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close sidebar"><X className="size-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-blue-200/70 uppercase">Workspace</p>
          <div className="space-y-0.5">
            {navigation.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100/80 transition-colors hover:bg-white/10 hover:text-white",
                    active && "bg-white text-[#0F4C81] shadow-sm hover:bg-white hover:text-[#0F4C81]",
                  )}
                >
                  <Icon className="size-4.5" />
                  {item.label}
                  {item.label === "Messages" && <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-[#0F4C81] text-white" : "bg-white/15")}>12</span>}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/8 p-3">
            <div className="flex items-center gap-2 text-xs font-medium"><FileText className="size-4 text-blue-200" /> Content storage</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-blue-300" /></div>
            <p className="mt-2 text-[10px] text-blue-200/70">6.2 GB of 10 GB used</p>
          </div>
        </div>
      </aside>
    </>
  );
}
