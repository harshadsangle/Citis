"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { apiFetch } from "@/lib/api";

type Resource = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  downloads: number;
};

export function ResourcesClient() {
  const [items, setItems] = useState<Resource[]>([]);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    apiFetch<{ data: Resource[] }>("/resources?limit=50", { revalidate: false })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = category === "all" || item.category === category;
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.description.toLowerCase().includes(q.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [items, category, q],
  );

  const download = async (id: string) => {
    try {
      const res = await apiFetch<{ data: { url: string } }>(`/resources/${id}/download`, {
        method: "POST",
        revalidate: false,
      });
      window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Resource Center"
        title="Guides, brochures, and research you can download"
        description="All files are hosted on the CITIS server — no third-party storage required."
        breadcrumbs={[{ label: "Resources" }]}
      />
      <section className="container-site py-14 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter resources"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <option value="all">All categories</option>
            <option value="brochure">Brochures</option>
            <option value="company-profile">Company profile</option>
            <option value="whitepaper">Whitepapers</option>
            <option value="pdf">PDF</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filtered.map((item, index) => (
            <AnimatedSection key={item._id} delay={index * 0.04}>
              <article className="surface h-full rounded-2xl p-6">
                <FileText className="size-8 text-primary" />
                <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {item.category}
                </p>
                <h2 className="mt-2 font-heading text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{item.downloads} downloads</span>
                  <button
                    type="button"
                    onClick={() => download(item._id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                  >
                    Download <Download className="size-4" />
                  </button>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
        {!filtered.length ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No published resources yet. Admins can upload files from the admin media panel.
          </p>
        ) : null}
        <p className="mt-10 text-sm">
          Looking for a programme overview?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Contact our team
          </Link>
          .
        </p>
      </section>
    </>
  );
}
