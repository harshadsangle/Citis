"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { searchService } from "@/services/api";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
  highlightTitle: string;
  highlightExcerpt: string;
};

const FILTERS = [
  "all",
  "products",
  "blogs",
  "careers",
  "case-studies",
  "resources",
  "events",
  "success-stories",
  "faculty",
  "university",
  "school",
] as const;

function SearchResults() {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const initialType = (params.get("type") as (typeof FILTERS)[number]) || "all";
  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState<(typeof FILTERS)[number]>(
    FILTERS.includes(initialType) ? initialType : "all",
  );
  const [sort, setSort] = useState("relevance");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Hit[]>([]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await searchService.search(q.trim(), { type, sort, limit: 24 });
        if (!cancelled) setResults(response.data.results);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, type, sort]);

  const grouped = useMemo(() => {
    return results.reduce<Record<string, Hit[]>>((acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [results]);

  return (
    <section className="container-site py-12 sm:py-16">
      <form
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setQ(String(data.get("q") || ""));
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search the CITIS knowledge base"
            className="w-full rounded-xl border border-border bg-background py-3 pr-3 pl-10 text-sm outline-none focus:border-primary"
            aria-label="Search query"
          />
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-3 text-sm"
          aria-label="Sort results"
        >
          <option value="relevance">Relevance</option>
          <option value="title">Title A–Z</option>
          <option value="newest">Newest</option>
        </select>
        <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setType(filter)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold capitalize",
              type === filter ? "bg-primary text-white" : "bg-muted text-muted-foreground",
            )}
          >
            {filter.replace("-", " ")}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {loading ? "Searching…" : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-8 space-y-10">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <h2 className="font-heading text-lg font-semibold capitalize">{group.replace("-", " ")}</h2>
            <div className="mt-4 grid gap-4">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className="font-heading text-base font-semibold group-hover:text-primary"
                        dangerouslySetInnerHTML={{ __html: item.highlightTitle }}
                      />
                      <p
                        className="mt-2 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item.highlightExcerpt }}
                      />
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Find programmes, insights, and opportunities"
        description="Instant search across products, blogs, careers, case studies, university and school solutions."
        breadcrumbs={[{ label: "Search" }]}
      />
      <Suspense fallback={<div className="container-site py-16 text-sm text-muted-foreground">Loading search…</div>}>
        <SearchResults />
      </Suspense>
    </>
  );
}
