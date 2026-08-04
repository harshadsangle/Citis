"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { apiFetch } from "@/lib/api";

type Story = {
  _id: string;
  title: string;
  studentName: string;
  program: string;
  company: string;
  role: string;
  story: string;
  imageUrl?: string;
  videoUrl?: string;
  placementYear?: number;
};

export function SuccessStoriesClient() {
  const [items, setItems] = useState<Story[]>([]);
  const [company, setCompany] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    apiFetch<{ data: Story[] }>("/success-stories?limit=50", { revalidate: false })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, []);

  const companies = useMemo(
    () => Array.from(new Set(items.map((item) => item.company))).sort(),
    [items],
  );

  const filtered = items.filter((item) => {
    const byCompany = company === "all" || item.company === company;
    const byQuery =
      !q ||
      [item.title, item.studentName, item.company, item.program, item.story]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());
    return byCompany && byQuery;
  });

  return (
    <>
      <PageHeader
        eyebrow="Success Stories"
        title="Learners who moved from campus to career"
        description="Filter by placement company, programme, or keyword. Media is served from local storage."
        breadcrumbs={[{ label: "Success Stories" }]}
      />
      <section className="container-site py-14 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <option value="all">All companies</option>
            {companies.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {filtered.map((item, index) => (
            <AnimatedSection key={item._id} delay={index * 0.05}>
              <article className="surface overflow-hidden rounded-2xl">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.studentName} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-end bg-[linear-gradient(135deg,#0F4C81,#2563EB)] p-6 text-white">
                    <div>
                      <p className="text-sm text-blue-100">{item.company}</p>
                      <h2 className="font-heading text-2xl font-semibold">{item.studentName}</h2>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                    {item.program}
                    {item.placementYear ? ` · ${item.placementYear}` : ""}
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.role} at {item.company}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.story}</p>
                  {item.videoUrl ? (
                    <video controls className="mt-5 w-full rounded-xl" src={item.videoUrl} />
                  ) : null}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
        {!filtered.length ? (
          <p className="mt-10 text-sm text-muted-foreground">No published success stories yet.</p>
        ) : null}
      </section>
    </>
  );
}
