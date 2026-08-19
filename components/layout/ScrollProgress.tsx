"use client";

import { motion } from "framer-motion";
import { useScrollProgress } from "@/hooks/useScrollAnimation";

export function ScrollProgress() {
  const scaleX = useScrollProgress();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 right-0 left-0 z-[100] h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
