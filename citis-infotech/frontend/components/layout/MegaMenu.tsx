"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { MEGA_MENUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MegaMenuKey = keyof typeof MEGA_MENUS;

export function MegaMenu({
  menu,
  className,
  onNavigate,
}: {
  menu: MegaMenuKey;
  className?: string;
  onNavigate?: () => void;
}) {
  const content = MEGA_MENUS[menu];
  const pathname = usePathname();

  return (
    <div
      role="menu"
      className={cn(
        "min-w-[280px] overflow-hidden rounded-xl border border-[#0F4C81]/15 bg-white p-2 shadow-[0_18px_50px_rgba(15,76,129,0.16)]",
        className,
      )}
    >
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
        {content.eyebrow}
      </p>
      <ul className="flex flex-col gap-1">
        {content.items.map((item) => {
          const Icon = item.icon;
          // Exact match only — parent "/about" must not stay active on "/about/vision-mission"
          const active = pathname === item.href;
          return (
            <li key={item.href} role="none">
              <Link
                role="menuitem"
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  active
                    ? "bg-[#0F4C81] text-white"
                    : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-md",
                    active ? "bg-white/15 text-orange-300" : "bg-[#0F4C81]/10 text-[#0F4C81]",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 font-heading text-sm font-semibold">{item.title}</span>
                <ArrowRight
                  className={cn(
                    "size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100",
                    active && "opacity-80",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
