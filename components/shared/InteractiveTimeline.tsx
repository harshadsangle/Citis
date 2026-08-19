"use client";

import { motion } from "framer-motion";

export type TimelineItem = {
  year: string;
  title: string;
  description: string;
};

/** Framer Motion timeline used for company / student / learning / placement journeys. */
export function InteractiveTimeline({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: TimelineItem[];
}) {
  return (
    <section className="container-site py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Timeline</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
      </div>
      <ol className="relative mt-12 space-y-8 border-l border-primary/30 pl-8">
        {items.map((item, index) => (
          <motion.li
            key={`${item.year}-${item.title}`}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="relative"
          >
            <span className="absolute top-1.5 -left-[2.45rem] size-3.5 rounded-full border-2 border-white bg-accent shadow" />
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">{item.year}</p>
            <h3 className="mt-1 font-heading text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{item.description}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
