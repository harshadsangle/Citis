"use client";

import { useEffect, useRef } from "react";
import {
  useAnimation,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

export function useScrollAnimation(options?: { once?: boolean; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.amount ?? 0.2,
  });

  useEffect(() => {
    if (inView) controls.start("visible");
    else if (!(options?.once ?? true)) controls.start("hidden");
  }, [controls, inView, options?.once]);

  return { ref, controls, inView, variants: fadeUpVariants };
}

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, { stiffness: 150, damping: 30, restDelta: 0.001 });
}

export function useParallax(distance = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return { ref, y };
}

export function useScrollDirection() {
  const { scrollY } = useScroll();
  const previous = useRef(0);
  const direction = useRef<"up" | "down">("up");

  useMotionValueEvent(scrollY, "change", (latest) => {
    direction.current = latest > previous.current ? "down" : "up";
    previous.current = latest;
  });

  return direction;
}
