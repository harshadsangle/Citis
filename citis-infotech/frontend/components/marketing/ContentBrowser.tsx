"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CASE_STUDIES, BLOG_POSTS } from "@/lib/site-content";

export function ContentBrowser({ kind }: { kind: "blogs" | "case-studies" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const isBlogs = kind === "blogs";
  const data = isBlogs
    ? BLOG_POSTS.map((post) => ({ ...post, category: post.category, meta: `${post.readTime} · ${post.author}` }))
    : CASE_STUDIES.map((study) => ({ ...study, category: study.sector, date: "", meta: study.client }));
  const categories = ["All", ...Array.from(new Set(data.map((item) => item.category)))];
  const pageSize = 6;
  const filtered = useMemo(() => data.filter((item) => {
    const haystack = `${item.title} ${item.excerpt} ${item.category}`.toLowerCase();
    return (category === "All" || item.category === category) && haystack.includes(query.toLowerCase());
  }), [category, data, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const updateCategory = (value: string) => { setCategory(value); setPage(1); };

  return (
    <section className="container-site py-16 sm:py-24">
      <div className="surface rounded-2xl p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-xl">
            <span className="sr-only">Search {isBlogs ? "articles" : "case studies"}</span>
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-12 pl-11" placeholder={isBlogs ? "Search articles, topics, or authors…" : "Search outcomes, sectors, or services…"} />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            {categories.map((item) => <Button key={item} type="button" size="sm" variant={category === item ? "default" : "outline"} onClick={() => updateCategory(item)}>{item}</Button>)}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <Card key={item.slug} className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="brand-gradient relative h-40 overflow-hidden p-6 text-white">
              <div className="absolute -top-12 -right-12 size-40 rounded-full border border-white/15" />
              {isBlogs ? <BookOpen className="size-8 text-orange-300" /> : <span className="text-xs font-bold tracking-[0.16em] text-orange-300 uppercase">Impact story</span>}
              <p className="absolute right-6 bottom-5 left-6 text-xs font-semibold text-blue-100">{item.category}</p>
            </div>
            <CardHeader className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{item.category}</Badge>
                {item.date && <span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" />{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
              <CardTitle className="mt-3 text-balance">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3">{item.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-muted-foreground">{item.meta}</p>
              <Link href={`/highlights/${kind}/${item.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Read {isBlogs ? "article" : "case study"}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {!visible.length && <div className="mt-12 rounded-xl border border-dashed border-border py-16 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 font-heading font-semibold">No matching content</p><Button className="mt-4" variant="outline" onClick={() => { setQuery(""); updateCategory("All"); }}>Clear filters</Button></div>}
      {pages > 1 && <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">{Array.from({ length: pages }, (_, index) => <Button key={index} size="icon" variant={page === index + 1 ? "default" : "outline"} onClick={() => setPage(index + 1)} aria-label={`Page ${index + 1}`}>{index + 1}</Button>)}</nav>}
    </section>
  );
}
