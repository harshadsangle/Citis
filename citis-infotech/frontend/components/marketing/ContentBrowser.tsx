"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_STUDIES, BLOG_POSTS } from "@/lib/site-content";

const BLOG_IMAGE_BY_CATEGORY: Record<string, string> = {
  "App Development": "/images/blogs/app-development.jpg",
  "Cloud Computing": "/images/blogs/cloud-computing.jpg",
  "Education Technology": "/images/blogs/education-technology.jpg",
  eLearning: "/images/blogs/elearning.jpg",
  Careers: "/images/case-studies/career-readiness-placement-cell.jpg",
  "Artificial Intelligence": "/images/case-studies/ai-readiness-university.jpg",
  "School Education": "/images/case-studies/district-stem-transformation.jpg",
  "Higher Education": "/images/case-studies/ai-readiness-university.jpg",
  "NEP 2020": "/images/blogs/education-policy.jpg",
  "Workforce Development": "/images/blogs/cloud-computing.jpg",
  "Faculty Enablement": "/images/blogs/education-policy.jpg",
  Employability: "/images/case-studies/career-readiness-placement-cell.jpg",
};

const BLOG_FALLBACK_IMAGE = "/images/blogs/elearning.jpg";

export function ContentBrowser({ kind }: { kind: "blogs" | "case-studies" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const isBlogs = kind === "blogs";
  const data = isBlogs
    ? BLOG_POSTS.map((post) => ({
        ...post,
        category: post.category,
        meta: `${post.readTime} · ${post.author}`,
        image: BLOG_IMAGE_BY_CATEGORY[post.category] ?? BLOG_FALLBACK_IMAGE,
      }))
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
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
             {categories.map((item) => <Button key={item} type="button" size="sm" variant={category === item ? "default" : "outline"} className={category === item ? undefined : "text-slate-700 dark:text-foreground"} onClick={() => updateCategory(item)}>{item}</Button>)}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <Card key={item.slug} className="group flex h-full flex-col overflow-hidden text-slate-900 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:text-card-foreground">
            {isBlogs ? (
              <div className="relative h-40 overflow-hidden bg-primary">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071827]/90 via-[#0f4c81]/30 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                  <BookOpen className="size-8 text-orange-300" />
                  <p className="text-xs font-semibold text-blue-100">{item.category}</p>
                </div>
              </div>
            ) : (
              <div className="relative h-40 overflow-hidden bg-primary">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071827]/90 via-[#0f4c81]/30 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                  <span className="text-xs font-bold tracking-[0.16em] text-orange-300 uppercase">Impact story</span>
                  <p className="text-xs font-semibold text-blue-100">{item.category}</p>
                </div>
              </div>
            )}
            <CardHeader className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="outline">{item.category}</Badge>
                 {item.date && <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-muted-foreground"><CalendarDays className="size-3" />{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
              <CardTitle className="mt-3 text-balance text-slate-900 dark:text-card-foreground">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3 text-slate-600 dark:text-muted-foreground">{item.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-slate-600 dark:text-muted-foreground">{item.meta}</p>
              <Link href={`/highlights/${kind}/${item.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary">Read {isBlogs ? "article" : "case study"}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {!visible.length && <div className="mt-12 rounded-xl border border-dashed border-border py-16 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 font-heading font-semibold">No matching content</p><Button className="mt-4" variant="outline" onClick={() => { setQuery(""); updateCategory("All"); }}>Clear filters</Button></div>}
      {pages > 1 && <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">{Array.from({ length: pages }, (_, index) => <Button key={index} size="icon" variant={page === index + 1 ? "default" : "outline"} onClick={() => setPage(index + 1)} aria-label={`Page ${index + 1}`}>{index + 1}</Button>)}</nav>}
    </section>
  );
}
