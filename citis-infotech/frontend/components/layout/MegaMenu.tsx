"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
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
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <div
      role="menu"
      className={cn(
        "max-h-[calc(100vh-6rem)] min-w-[280px] overflow-y-auto rounded-xl border border-[#0F4C81]/15 bg-white p-2 shadow-[0_18px_50px_rgba(15,76,129,0.16)]",
        className,
      )}
    >
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
        {content.eyebrow}
      </p>
      <ul className="flex flex-col gap-1">
        {content.items.map((item) => {
          const Icon = item.icon;
          const hasChildren = "children" in item && item.children.length > 0;
          // Exact match only — parent "/about" must not stay active on "/about/vision-mission"
          const active = pathname === item.href || (hasChildren && pathname.startsWith(`${item.href}/`));
          return (
            <li
              key={item.href}
              role="none"
              className="relative"
              onMouseEnter={() => hasChildren && setOpenSubmenu(item.title)}
              onMouseLeave={() => hasChildren && setOpenSubmenu(null)}
            >
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-lg transition-colors",
                  active
                    ? "bg-[#0F4C81] text-white"
                    : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
                )}
              >
                <Link
                  role="menuitem"
                  href={item.href}
                  onClick={onNavigate}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5"
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
                </Link>
                {hasChildren ? (
                  <button
                    type="button"
                    aria-label={`Show ${item.title} submenu`}
                    aria-expanded={openSubmenu === item.title}
                    className="mr-1 grid size-9 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setOpenSubmenu((current) => (current === item.title ? null : item.title))}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <ArrowRight
                    className={cn(
                      "mr-3 size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100",
                      active && "opacity-80",
                    )}
                  />
                )}
              </div>
              {hasChildren && openSubmenu === item.title && (
                <div className="absolute top-0 left-full z-[60]">
                  <div className="max-h-[calc(100vh-6rem)] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[#0F4C81]/15 bg-white p-3 shadow-[0_18px_50px_rgba(15,76,129,0.16)]">
                    <p className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
                      Global Certifications
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href} role="none">
                            <Link
                              role="menuitem"
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                childActive
                                  ? "bg-[#0F4C81] text-white"
                                  : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
                              )}
                            >
                              <span
                                className={cn(
                                  "grid size-9 shrink-0 place-items-center rounded-md",
                                  childActive ? "bg-white/15 text-orange-300" : "bg-[#0F4C81]/10 text-[#0F4C81]",
                                )}
                              >
                                <ChildIcon className="size-4" />
                              </span>
                              <span className="flex-1 font-heading text-sm font-semibold">{child.title}</span>
                              <ArrowRight
                                className={cn(
                                  "size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100",
                                  childActive && "opacity-80",
                                )}
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
