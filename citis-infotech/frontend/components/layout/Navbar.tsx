"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { CitisLogo } from "@/components/layout/CitisLogo";
import { MegaMenu, type MegaMenuKey } from "@/components/layout/MegaMenu";
import { HighContrastToggle } from "@/components/shared/HighContrastToggle";
import { MEGA_MENUS, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Brand() {
  return <CitisLogo className="text-[0.95rem] sm:text-[1.05rem]" />;
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
    <header className={cn(
      "sticky top-0 z-50 h-[var(--header-height)] border-b transition-all duration-300",
      scrolled
        ? "border-border/70 bg-background/85 shadow-[0_10px_40px_rgba(15,76,129,0.08)] backdrop-blur-2xl"
        : "border-transparent bg-background/70 backdrop-blur-xl",
    )}>
      <div className="container-site flex h-full items-center justify-between">
        <Brand />
        <nav className="hidden h-full items-center gap-0.5 lg:flex" aria-label="Primary navigation" onMouseLeave={() => setOpenMenu(null)}>
          {NAV_LINKS.map((item) => {
            const active = pathname.startsWith(item.href);
            const menu = "megaMenu" in item ? item.megaMenu : undefined;
            return (
              <div
                key={item.href}
                className="relative flex h-full items-center"
                onMouseEnter={() => setOpenMenu(menu ?? null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex h-10 items-center gap-1 rounded-full px-3.5 text-sm font-semibold transition-colors hover:bg-primary/5 hover:text-primary",
                    active && "bg-primary/10 text-primary",
                    openMenu === menu && menu && "bg-primary/10 text-primary",
                  )}
                >
                  {item.label}
                  {menu && (
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", openMenu === menu && "rotate-180")}
                    />
                  )}
                </Link>
                {menu && (
                  <AnimatePresence>
                    {openMenu === menu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 z-50 pt-2"
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
          <HighContrastToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button asChild className="hidden rounded-full xl:inline-flex" variant="accent">
            <Link href="/future-academy">CITIS Future Academy <ArrowRight /></Link>
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
                        {MEGA_MENUS[menu].items.map((child) => (
                          <Link key={child.href} href={child.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary">{child.title}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Button asChild variant="accent" className="mt-4 rounded-full"><Link href="/future-academy">CITIS Future Academy <ArrowRight /></Link></Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
