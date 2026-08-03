"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUpVariants } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  delay?: number;
  amount?: number;
}

export function AnimatedSection({ children, className, delay = 0, amount = 0.18, ...props }: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        ...fadeUpVariants,
        visible: {
          ...fadeUpVariants.visible,
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
