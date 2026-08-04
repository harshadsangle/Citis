"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

export function HomeHero({
  title,
  support,
}: {
  title: string;
  support: string;
}) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 500], [0, 120]);
  const imageScale = useTransform(scrollY, [0, 500], [1.08, 1.18]);
  const contentOpacity = useTransform(scrollY, [0, 280], [1, 0.35]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#071221]">
      <motion.div style={mounted ? { y: imageY, scale: imageScale } : undefined} className="absolute inset-0">
        <Image
          src="/images/hero-campus.jpg"
          alt="CITIS InfoTech learning environments"
          fill
          priority
          className="object-cover object-[center_35%]"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,12,24,0.92)_0%,rgba(15,76,129,0.55)_42%,rgba(4,12,24,0.35)_72%,rgba(255,122,0,0.18)_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,122,0,0.25),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(37,99,235,0.35),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.55%22/></svg>')]" />

      <motion.div
        style={mounted ? { opacity: contentOpacity } : undefined}
        className="container-site relative flex min-h-[100svh] flex-col justify-end pb-24 pt-28 lg:justify-center lg:pb-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-white"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mb-6 inline-flex items-center gap-3 font-heading text-sm font-semibold tracking-[0.32em] text-orange-300 uppercase"
          >
            <span className="h-px w-10 bg-orange-300/80" />
            {SITE_CONFIG.name}
          </motion.p>
          <h1 className="font-heading text-5xl leading-[0.98] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            {title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">
              {title.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-blue-50/90 sm:text-xl">{support}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              variant="accent"
              size="lg"
              className="h-13 rounded-full px-8 text-base shadow-[0_12px_40px_rgba(255,122,0,0.35)]"
            >
              <Link href="/future-academy">
                CITIS Future Academy
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 rounded-full border-white/30 bg-white/5 px-8 text-base text-white backdrop-blur hover:bg-white/15 hover:text-white"
            >
              <Link href="/engagements">Explore Engagements</Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  );
}

export function PillarMarquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#0a1628] py-4 text-white">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-4">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10 font-heading text-sm font-semibold tracking-[0.18em] uppercase">
            <span className="text-orange-300">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
