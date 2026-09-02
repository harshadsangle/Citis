"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { CitisLogo } from "@/components/layout/CitisLogo";
import { MegaMenu, type MegaMenuKey } from "@/components/layout/MegaMenu";
import { MEGA_MENUS, NAV_LINKS, type MegaMenuItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

const headerSocialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/citisinfotech", icon: FaFacebookF },
  { label: "Instagram", href: "https://www.instagram.com/citisinfotech", icon: FaInstagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/citis-infotech", icon: FaLinkedinIn },
] as const;

function Brand() {
  return <CitisLogo className="text-[0.95rem] sm:text-[1.05rem]" />;
}

function HeaderSocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label="CITIS InfoTech social media">
      {headerSocialLinks.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`CITIS InfoTech on ${label}`}
          className="grid size-8 place-items-center rounded-full border border-primary/15 text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

function MobileMenuItems({
  items,
  pathname,
  level = 0,
}: {
  items: readonly MegaMenuItem[];
  pathname: string;
  level?: number;
}) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className={cn(level > 0 ? "ml-3 grid border-l border-border pl-2" : "ml-2 grid border-l border-border pl-2")}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const active = pathname === item.href || (hasChildren && pathname.startsWith(`${item.href}/`));
        if (!hasChildren) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-primary",
                active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              {item.title}
            </Link>
          );
        }

        const submenuId = `mobile-menu-${item.href.replace(/[^a-z0-9]+/gi, "-")}`;
        return (
          <div key={item.href}>
            <button
              type="button"
              aria-expanded={openItem === item.href}
              aria-controls={submenuId}
              onClick={() => setOpenItem((current) => (current === item.href ? null : item.href))}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted hover:text-primary",
                active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              {item.title}
              <ChevronDown className={cn("size-4 transition-transform", openItem === item.href && "rotate-180")} />
            </button>
            {openItem === item.href && (
              <div id={submenuId}>
                <MobileMenuItems items={item.children ?? []} pathname={pathname} level={level + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<MegaMenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={cn(
      "sticky top-0 z-50 h-[var(--header-height)] border-b transition-all duration-300",
      scrolled
        ? "border-primary/10 bg-background/90 shadow-[0_10px_40px_rgba(18,75,115,0.1)] backdrop-blur-2xl"
        : "border-transparent bg-background/75 backdrop-blur-xl",
    )}>
      <div className="container-site flex h-full items-center justify-between">
        <Brand />
        <nav className="hidden h-full items-center gap-0.5 lg:flex" aria-label="Primary navigation" onMouseLeave={() => setOpenMenu(null)}>
          {NAV_LINKS.map((item) => {
            const menu = "megaMenu" in item ? item.megaMenu : undefined;
            const active = menu
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const linkClass = cn(
              "relative flex h-10 items-center gap-1 rounded-xl px-3.5 text-sm font-semibold transition-colors hover:bg-primary/5 hover:text-primary",
              active && "bg-primary/10 text-primary",
              openMenu === menu && menu && "bg-primary/10 text-primary",
            );
            return (
              <div
                key={item.href}
                className="relative flex h-full items-center"
                onMouseEnter={() => setOpenMenu(menu ?? null)}
              >
                {menu ? (
                  <button
                    type="button"
                    className={linkClass}
                    aria-expanded={openMenu === menu}
                    aria-haspopup="menu"
                    onClick={() => setOpenMenu((current) => (current === menu ? null : menu))}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", openMenu === menu && "rotate-180")}
                    />
                  </button>
                ) : (
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                )}
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
                        <MegaMenu menu={menu} onNavigate={() => setOpenMenu(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <HeaderSocialLinks className="hidden sm:flex lg:hidden" />
          <HeaderSocialLinks className="hidden lg:flex" />
          <Button asChild className="hidden rounded-xl xl:inline-flex" variant="accent">
              <Link href="/lms">Skills Excellence Centre <ArrowRight /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute inset-x-0 top-full max-h-[calc(100vh-var(--header-height))] overflow-y-auto border-b border-primary/10 bg-background/95 shadow-xl backdrop-blur-xl lg:hidden">
            <nav className="container-site flex flex-col gap-1 py-5" aria-label="Mobile navigation">
              {NAV_LINKS.map((item) => {
                const menu = "megaMenu" in item ? item.megaMenu : undefined;
                const sectionActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <div key={item.href}>
                    {menu ? (
                      <>
                        <p className={cn("px-3 py-2 font-heading text-base font-medium text-muted-foreground", sectionActive && "text-primary")}>
                          {item.label}
                        </p>
                        <MobileMenuItems items={MEGA_MENUS[menu].items} pathname={pathname} />
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-3 font-heading text-base font-medium hover:bg-muted",
                          sectionActive && "bg-primary/10 text-primary",
                        )}
                      >
                        {item.label}
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
              <HeaderSocialLinks className="mt-3 justify-center border-t border-border pt-4" />
                <Button asChild variant="accent" className="mt-4 rounded-xl"><Link href="/lms">Skills Excellence Centre <ArrowRight /></Link></Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
