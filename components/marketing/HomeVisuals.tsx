"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Cpu,
  Globe2,
  GraduationCap,
  Layers,
  Lightbulb,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WHY_ICONS = [
  Network,
  Rocket,
  Target,
  Briefcase,
  Layers,
  Globe2,
  GraduationCap,
  Cpu,
  Building2,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Lightbulb,
  Users,
] as const;

export function WhyChooseIcon({ index, className }: { index: number; className?: string }) {
  const Icon = WHY_ICONS[index % WHY_ICONS.length];
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

/** Soft floating orbs + grid for section atmosphere */
export function AmbientBackdrop({ tone = "light" }: { tone?: "light" | "dark" | "accent" }) {
  const tones = {
    light: "from-[#e8f1fa] via-[#f8fafc] to-[#fff7ed] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
    dark: "from-[#0b1c33] via-[#0F4C81] to-[#163a5f]",
    accent: "from-[#0F4C81] via-[#1a3d66] to-[#0f172a]",
  } as const;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br", tones[tone])} />
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,76,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,76,129,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-20" />
      <motion.div
        className="absolute -top-24 -right-16 size-[28rem] rounded-full bg-[#2563eb]/20 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-28 -left-20 size-[24rem] rounded-full bg-[#FF7A00]/15 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, 14, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function FloatingBadge({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "absolute z-10 rounded-2xl border border-white/25 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl backdrop-blur dark:bg-slate-900/85 dark:text-slate-100",
        className,
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Abstract education network graphic for sections without photos */
export function EducationNetworkArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 420" className={cn("h-auto w-full", className)} aria-hidden>
      <defs>
        <linearGradient id="eduGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F4C81" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
        <radialGradient id="eduOrb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="420" rx="32" fill="url(#eduGlow)" opacity="0.12" />
      <circle cx="520" cy="80" r="90" fill="url(#eduOrb)" />
      <g stroke="#0F4C81" strokeWidth="1.5" opacity="0.35">
        <path d="M120 210C180 120 280 110 340 170C400 230 480 240 540 180" fill="none" />
        <path d="M90 280C170 250 230 300 300 270C370 240 430 300 560 250" fill="none" />
        <path d="M140 120C220 160 260 80 340 110C420 140 470 90 560 130" fill="none" />
      </g>
      {[
        [120, 210],
        [220, 150],
        [340, 170],
        [420, 230],
        [540, 180],
        [180, 280],
        [300, 270],
        [460, 290],
      ].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={i % 2 ? 10 : 14} fill="#0F4C81" opacity="0.85" />
          <circle cx={x} cy={y} r={i % 2 ? 4 : 5} fill="#FF7A00" />
        </g>
      ))}
      <rect x="70" y="300" width="160" height="72" rx="16" fill="#0F4C81" opacity="0.9" />
      <rect x="250" y="310" width="140" height="62" rx="14" fill="#2563eb" opacity="0.85" />
      <rect x="410" y="295" width="150" height="77" rx="16" fill="#163a5f" opacity="0.9" />
      <circle cx="150" cy="336" r="18" fill="#FF7A00" />
      <circle cx="320" cy="341" r="16" fill="#93c5fd" />
      <circle cx="485" cy="333" r="18" fill="#FF7A00" opacity="0.9" />
    </svg>
  );
}
