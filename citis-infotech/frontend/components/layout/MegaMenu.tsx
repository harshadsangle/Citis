"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { MEGA_MENUS, type MegaMenuItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MegaMenuKey = keyof typeof MEGA_MENUS;

function CertificationMegaPanel({
  categories,
  pathname,
  onNavigate,
}: {
  categories: readonly MegaMenuItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const firstCategoryWithCourses = categories.find((category) => category.children?.length) ?? categories[0];
  const [activeCategoryHref, setActiveCategoryHref] = useState(firstCategoryWithCourses?.href ?? "");
  const activeCategory = categories.find((category) => category.href === activeCategoryHref) ?? firstCategoryWithCourses;
  const courses = Array.from(
    new Map(
      categories
        .flatMap((category) => category.children ?? [])
        .map((course) => [course.href, course] as const),
    ).values(),
  );

  if (!activeCategory) return null;

  return (
    <div className="grid max-h-[calc(100vh-6rem)] w-[min(700px,calc(100vw-2rem))] grid-cols-[minmax(205px,0.8fr)_minmax(0,1.5fr)] overflow-hidden rounded-xl border border-[#0F4C81]/15 bg-white shadow-[0_18px_50px_rgba(15,76,129,0.16)]">
      <div className="max-h-[calc(100vh-6rem)] overflow-y-auto border-r border-[#0F4C81]/12 bg-[#f7fbfc] p-3">
        <p className="px-3 pt-2 pb-3 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">
          Certification Categories
        </p>
        <ul className="flex flex-col gap-1" role="menu">
          {categories.map((category) => {
            const categoryActive = pathname === category.href || pathname.startsWith(`${category.href}/`);
            const selected = activeCategoryHref === category.href;
            return (
              <li key={category.href} role="none">
                <Link
                  role="menuitem"
                  href={category.href}
                  onMouseEnter={() => setActiveCategoryHref(category.href)}
                  onFocus={() => setActiveCategoryHref(category.href)}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-lg px-3 py-3 font-heading text-sm font-semibold leading-5 transition-colors",
                    selected
                      ? "bg-[#0F4C81] text-white shadow-sm"
                      : categoryActive
                        ? "bg-[#0F4C81]/10 text-[#0F4C81]"
                        : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
                  )}
                >
                  {category.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="max-h-[calc(100vh-6rem)] min-w-0 overflow-y-auto p-4 sm:p-5">
        <div className="border-b border-[#0F4C81]/12 pb-4">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">Courses</p>
          <h3 className="mt-2 font-heading text-lg font-semibold text-[#123d5c]">{activeCategory.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{activeCategory.description}</p>
        </div>
        {courses.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1.5" role="menu">
            {courses.map((course) => {
              const CourseIcon = course.icon;
              const courseActive = pathname === course.href;
              return (
                <li key={course.href} role="none">
                  <Link
                    role="menuitem"
                    href={course.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors",
                      courseActive
                        ? "bg-[#0F4C81] text-white"
                        : "text-[#0b1524] hover:bg-[#0F4C81]/08 hover:text-[#0F4C81]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md",
                        courseActive ? "bg-white/15 text-orange-300" : "bg-[#0F4C81]/10 text-[#0F4C81]",
                      )}
                    >
                      <CourseIcon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-sm font-semibold">{course.title}</span>
                      <span className={cn("mt-1 block text-xs leading-5", courseActive ? "text-white/75" : "text-muted-foreground")}>
                        {course.description}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 ml-auto size-3.5 shrink-0 opacity-60 transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-[#9fc6d6] bg-[#f7fbfc] p-5">
            <p className="font-heading text-sm font-semibold text-[#123d5c]">Courses are being prepared</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              New learning pathways for this certification category will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItems({
  items,
  pathname,
  onNavigate,
}: {
  items: readonly MegaMenuItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const active = pathname === item.href || (hasChildren && pathname.startsWith(`${item.href}/`));
        return (
          <li
            key={item.href}
            role="none"
            className="relative"
            onMouseEnter={() => hasChildren && setOpenSubmenu(item.href)}
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
                  aria-expanded={openSubmenu === item.href}
                  className="mr-1 grid size-9 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setOpenSubmenu((current) => (current === item.href ? null : item.href))}
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
            {hasChildren && openSubmenu === item.href && (
              <div className="absolute top-0 left-full z-[60]">
                {item.title === "Global Certifications" ? (
                  <CertificationMegaPanel categories={item.children ?? []} pathname={pathname} onNavigate={onNavigate} />
                ) : (
                  <MenuPanel items={item.children ?? []} title={item.title} pathname={pathname} onNavigate={onNavigate} />
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
}: {
  items: readonly MegaMenuItem[];
  title: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="max-h-[calc(100vh-6rem)] w-[min(380px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[#0F4C81]/15 bg-white p-3 shadow-[0_18px_50px_rgba(15,76,129,0.16)]">
      <p className="px-3 pt-2 pb-2 text-[11px] font-bold tracking-[0.18em] text-[#FF7A00] uppercase">{title}</p>
      <MenuItems items={items} pathname={pathname} onNavigate={onNavigate} />
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
        "max-h-[calc(100vh-6rem)] min-w-[280px] overflow-y-auto rounded-xl border border-[#0F4C81]/15 bg-white p-2 shadow-[0_18px_50px_rgba(15,76,129,0.16)]",
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
