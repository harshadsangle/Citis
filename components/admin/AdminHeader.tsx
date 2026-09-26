"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, ExternalLink, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const labels: Record<string, string> = {
  blogs: "Blogs", products: "Products", careers: "Careers", testimonials: "Testimonials",
  clients: "Clients", "case-studies": "Case Studies", messages: "Messages",
  newsletter: "Newsletter", media: "Media Library", analytics: "Analytics",
};

export function AdminHeader({
  onMenuClick,
  userName = "Admin User",
  onSignOut,
}: {
  onMenuClick: () => void;
  userName?: string;
  onSignOut?: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/")[2];
  const title = segment ? labels[segment] ?? "Admin" : "Dashboard";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button onClick={onMenuClick} className="mr-3 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open sidebar"><Menu className="size-5" /></button>
      <div className="min-w-0">
        <p className="truncate font-heading text-base font-semibold">{title}</p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">CITIS InfoTech content workspace</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="relative hidden xl:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Search admin" placeholder="Search anything…" className="h-9 w-56 rounded-lg border border-border bg-muted/50 pr-3 pl-9 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10" />
        </div>
        <Link href="/" target="_blank" className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="View website"><ExternalLink className="size-4.5" /></Link>
        <button className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="size-4.5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-muted">
              <Avatar className="size-8"><AvatarFallback className="bg-[#0F4C81] text-xs text-white">{initials || "AD"}</AvatarFallback></Avatar>
              <span className="hidden text-left md:block">
                <span className="block text-xs font-semibold">{userName}</span>
                <span className="block text-[10px] text-muted-foreground">Administrator</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm text-foreground">{userName}</span>
              <span className="font-normal">Administrator</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="size-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="size-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onSignOut?.()}
            >
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
