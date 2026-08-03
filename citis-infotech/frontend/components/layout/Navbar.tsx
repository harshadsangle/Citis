"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MegaMenu, type MegaMenuKey } from "@/components/layout/MegaMenu";
import { MEGA_MENUS, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="CITIS InfoTech home">
      <span className="brand-gradient grid size-10 place-items-center rounded-lg font-heading text-lg font-bold text-white shadow-sm">C</span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        CITIS <span className="text-primary">InfoTech</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState<MegaMenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={cn("sticky top-0 z-50 h-[var(--header-height)] border-b transition-all duration-300", scrolled ? "border-border bg-background/92 shadow-sm backdrop-blur-xl" : "border-transparent bg-background/80 backdrop-blur-lg")}>
      <div className="container-site flex h-full items-center justify-between">
        <Brand />
        <nav className="hidden h-full items-center gap-0.5 lg:flex" aria-label="Primary navigation" onMouseLeave={() => setOpenMenu(null)}>
          {NAV_LINKS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const menu = "megaMenu" in item ? item.megaMenu : undefined;
            return (
              <div key={item.href} className="flex h-full items-center" onMouseEnter={() => setOpenMenu(menu ?? null)}>
                <Link href={item.href} className={cn("relative flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted hover:text-primary", active && "text-primary")}>
                  {item.label}
                  {menu && <ChevronDown className={cn("size-3.5 transition-transform", openMenu === menu && "rotate-180")} />}
                  {active && <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-accent" />}
                </Link>
                {menu && (
                  <AnimatePresence>
                    {openMenu === menu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-[calc(100%-0.35rem)] left-1/2 -translate-x-1/2 pt-3"
                      >
                        <MegaMenu menu={menu} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button asChild className="hidden xl:inline-flex">
            <Link href="/contact">Start a conversation <ArrowRight /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute inset-x-0 top-full max-h-[calc(100vh-var(--header-height))] overflow-y-auto border-b border-border bg-background shadow-xl lg:hidden">
            <nav className="container-site flex flex-col gap-1 py-5" aria-label="Mobile navigation">
              {NAV_LINKS.map((item) => {
                const menu = "megaMenu" in item ? item.megaMenu : undefined;
                return (
                  <div key={item.href}>
                    <Link href={item.href} className={cn("flex items-center justify-between rounded-lg px-3 py-3 font-heading text-base font-medium hover:bg-muted", pathname.startsWith(item.href) && "bg-primary/10 text-primary")}>
                      {item.label}<ArrowRight className="size-4" />
                    </Link>
                    {menu && (
                      <div className="ml-4 grid border-l border-border pl-3">
                        {MEGA_MENUS[menu].items.slice(0, 4).map((child) => (
                          <Link key={child.href} href={child.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary">{child.title}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Button asChild variant="accent" className="mt-4"><Link href="/contact">Start a conversation <ArrowRight /></Link></Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
