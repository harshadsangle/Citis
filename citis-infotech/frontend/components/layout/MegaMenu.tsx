"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MEGA_MENUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type MegaMenuKey = keyof typeof MEGA_MENUS;

export function MegaMenu({ menu, className }: { menu: MegaMenuKey; className?: string }) {
  const content = MEGA_MENUS[menu];

  return (
    <div className={cn("w-[min(960px,calc(100vw-2rem))] rounded-xl border border-border bg-card p-3 text-card-foreground shadow-2xl", className)}>
      <div className="grid grid-cols-[0.72fr_1.8fr] gap-3">
        <Link
          href={content.featured.href}
          className="brand-gradient group flex min-h-72 flex-col justify-between overflow-hidden rounded-lg p-7 text-white"
        >
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-blue-100 uppercase">{content.eyebrow}</p>
            <h3 className="font-heading text-2xl leading-tight font-semibold">{content.title}</h3>
            <p className="mt-4 text-sm leading-6 text-blue-100">{content.featured.description}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            {content.featured.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <div className="grid grid-cols-2 gap-1 p-2">
          {content.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group flex gap-3 rounded-lg p-4 transition-colors hover:bg-muted">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:-translate-y-0.5">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-semibold transition-colors group-hover:text-primary">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
