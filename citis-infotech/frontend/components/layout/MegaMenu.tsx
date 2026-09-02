"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { MEGA_MENUS, type MegaMenuItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MegaMenuKey = keyof typeof MEGA_MENUS;
type MenuItemsVariant = "default" | "certification";

function CertificationMegaPanel({
  courses,
  pathname,
  onNavigate,
}: {
  courses: readonly MegaMenuItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mega-menu w-[min(640px,calc(100vw-2rem))] rounded-2xl border border-primary/15 bg-card p-3 shadow-[0_18px_50px_rgba(18,75,115,0.16)]">
      <p className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
        Certification Courses
      </p>
      <MenuItems
        items={courses}
        pathname={pathname}
        onNavigate={onNavigate}
        variant="certification"
        className="grid grid-cols-2 gap-1.5"
      />
    </div>
  );
}

function MenuItems({
  items,
  pathname,
  onNavigate,
  variant = "default",
  className,
}: {
  items: readonly MegaMenuItem[];
  pathname: string;
  onNavigate?: () => void;
  variant?: MenuItemsVariant;
  className?: string;
}) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [certificationPanelLeft, setCertificationPanelLeft] = useState<number | null>(null);

  return (
    <ul className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const active = pathname === item.href || (hasChildren && pathname.startsWith(`${item.href}/`));
        const isCertificationItem = variant === "certification";
        return (
          <li
            key={`${item.title}-${item.href}`}
            role="none"
            className="relative"
            onMouseEnter={(event) => {
              if (!hasChildren) return;
              setOpenSubmenu(item.href);
              if (item.title === "Global Certifications") {
                const anchor = event.currentTarget.getBoundingClientRect();
                const panelWidth = Math.min(640, window.innerWidth - 32);
                setCertificationPanelLeft(Math.max(16, Math.min(anchor.right + 8, window.innerWidth - panelWidth - 16)));
              }
            }}
            onMouseLeave={() => {
              if (item.title !== "Global Certifications") setOpenSubmenu(null);
            }}
          >
            <div
              className={cn(
                isCertificationItem
                  ? "group flex min-h-12 items-center gap-2.5 rounded-xl px-3 py-2 transition-colors"
                  : "group flex items-center gap-1 rounded-lg transition-colors",
                active
                  ? "bg-[#0F4C81] text-white"
                  : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
              )}
            >
              <Link
                role="menuitem"
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex min-w-0 flex-1 items-center",
                  isCertificationItem ? "gap-2.5" : "gap-3 px-3 py-2.5",
                )}
              >
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-md",
                    isCertificationItem ? "size-8" : "size-9",
                    active ? "bg-white/15 text-orange-300" : "bg-[#0F4C81]/10 text-[#0F4C81]",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className={cn("flex-1 font-heading text-sm font-semibold", isCertificationItem && "leading-5")}>{item.title}</span>
              </Link>
              {hasChildren ? (
                <button
                  type="button"
                  aria-label={`Show ${item.title} submenu`}
                  aria-expanded={openSubmenu === item.href}
                  className={cn(
                    "grid shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCertificationItem ? "size-8" : "mr-1 size-9",
                  )}
                  onClick={() => setOpenSubmenu((current) => (current === item.href ? null : item.href))}
                >
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <ArrowRight
                  className={cn(
                    isCertificationItem ? "size-3.5 opacity-60 transition group-hover:translate-x-0.5" : "mr-3 size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100",
                    active && "opacity-80",
                  )}
                />
              )}
            </div>
            {hasChildren && openSubmenu === item.href && (
              <div
                className={cn(
                  "z-[60]",
                  item.title === "Global Certifications"
                    ? "fixed top-[calc(var(--header-height)+0.5rem)]"
                    : "absolute top-0 left-full",
                )}
                style={item.title === "Global Certifications" ? { left: certificationPanelLeft ?? 16 } : undefined}
                onMouseEnter={() => setOpenSubmenu(item.href)}
                onMouseLeave={() => {
                  setOpenSubmenu(null);
                  setCertificationPanelLeft(null);
                }}
              >
                {item.title === "Global Certifications" ? (
                  <CertificationMegaPanel courses={item.children ?? []} pathname={pathname} onNavigate={onNavigate} />
                ) : (
                  <MenuPanel
                    items={item.children ?? []}
                    title={item.title}
                    pathname={pathname}
                    onNavigate={onNavigate}
                    variant={variant}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function MenuPanel({
  items,
  title,
  pathname,
  onNavigate,
  variant,
}: {
  items: readonly MegaMenuItem[];
  title: string;
  pathname: string;
  onNavigate?: () => void;
  variant?: MenuItemsVariant;
}) {
  return (
    <div className="mega-menu max-h-[calc(100vh-6rem)] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-primary/15 bg-card p-3 shadow-[0_18px_50px_rgba(18,75,115,0.16)]">
      <p className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">{title}</p>
      <MenuItems items={items} pathname={pathname} onNavigate={onNavigate} variant={variant} />
    </div>
  );
}

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
        "mega-menu max-h-[calc(100vh-6rem)] min-w-[280px] overflow-visible rounded-2xl border border-primary/15 bg-card p-2 shadow-[0_18px_50px_rgba(18,75,115,0.16)]",
        className,
      )}
    >
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
        {content.eyebrow}
      </p>
      <MenuItems items={content.items} pathname={pathname} onNavigate={onNavigate} />
    </div>
  );
}
