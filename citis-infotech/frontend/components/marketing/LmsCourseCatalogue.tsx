"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  type LmsCourse,
  type LmsCourseCategory,
  type LmsCourseProvider,
} from "@/lib/lms-catalog";

const PROVIDER_LOGOS: Record<LmsCourseProvider, { src: string; alt: string; sizes: string }> = {
  adobe: { src: "/images/adobe.png", alt: "Adobe logo", sizes: "120px" },
  comptia: { src: "/images/comptia-authorized-partner.jpg", alt: "CompTIA logo", sizes: "56px" },
  autodesk: { src: "/images/autodesk-logo.svg", alt: "Autodesk logo", sizes: "112px" },
  cisco: { src: "/images/cisco-logo.svg", alt: "Cisco logo", sizes: "112px" },
  ic3: { src: "/images/ic3-logo.png", alt: "IC3 Digital Literacy logo", sizes: "112px" },
  intuit: { src: "/images/intuit-logo.png", alt: "Intuit logo", sizes: "112px" },
  its: { src: "/images/citis-logo.svg", alt: "IT Specialist certification pathway", sizes: "112px" },
  microsoft: { src: "/images/microsoft.png", alt: "Microsoft logo", sizes: "112px" },
  meta: { src: "/images/meta-logo.png", alt: "Meta logo", sizes: "112px" },
  pmi: { src: "/images/citis-logo.svg", alt: "PMI certification pathway", sizes: "112px" },
  unity: { src: "/images/unity.png", alt: "Unity logo", sizes: "112px" },
};

const ACCENTS = [
  { tint: "bg-[#e8f3f4]", line: "bg-[#5ca6b1]", text: "text-[#176276]" },
  { tint: "bg-[#edf0fa]", line: "bg-[#6474b9]", text: "text-[#40518d]" },
  { tint: "bg-[#fff0e8]", line: "bg-[#ef7d3c]", text: "text-[#b35925]" },
  { tint: "bg-[#eaf4ee]", line: "bg-[#278a76]", text: "text-[#1e6d60]" },
];

function ProviderLogo({ provider }: { provider: LmsCourseProvider }) {
  const logo = PROVIDER_LOGOS[provider];

  return (
    <span className="grid size-14 shrink-0 place-items-center rounded-[1.15rem] bg-white px-2 shadow-[0_8px_20px_rgb(18_75_115/0.08)] ring-1 ring-primary/10 sm:size-[4.5rem]">
      <Image
        src={logo.src}
        alt={logo.alt}
        width={128}
        height={64}
        sizes={logo.sizes}
        className="max-h-12 max-w-full w-auto object-contain"
      />
    </span>
  );
}

function searchableCourseText(course: LmsCourse) {
  return [
    course.title,
    course.description,
    course.audience,
    ...course.details.flatMap((detail) => [detail.label, detail.value]),
    ...course.objectiveAreas.flatMap((area) => [area.title, area.description]),
  ]
    .join(" ")
    .toLowerCase();
}

function CourseCard({ course, providerQuery }: { course: LmsCourse; providerQuery: string }) {
  return (
    <details className="lms-course-card group/course overflow-hidden rounded-[1.35rem] border border-primary/10 bg-white shadow-[0_6px_20px_rgb(18_75_115/0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_42px_rgb(18_75_115/0.12)] dark:bg-slate-950/45">
      <summary className="lms-course-summary flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition-colors hover:bg-primary/[0.025] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/[0.07] text-primary transition-colors group-hover/course:bg-primary group-hover/course:text-primary-foreground">
          <BookOpen className="size-[1.05rem]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-accent" />
              Certification course
            </span>
          </span>
          <span className="block font-heading text-[1rem] font-semibold leading-6 text-foreground sm:text-[1.05rem]">{course.title}</span>
        </span>
        <ChevronDown className="lms-course-chevron size-5 shrink-0 text-primary/70 transition-transform duration-300 group-open/course:rotate-180" />
      </summary>

      <article className="border-t border-primary/10 bg-[linear-gradient(145deg,rgba(247,251,255,.78),rgba(255,255,255,.98))] p-5 sm:p-7 dark:bg-slate-900/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3 py-1.5 text-[10px] font-bold tracking-[0.11em] text-primary uppercase">
                <FileText className="size-3.5" />
                Official exam objectives
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-[10px] font-bold tracking-[0.11em] text-[#a85423] uppercase">
                <Sparkles className="size-3.5" />
                Career-ready pathway
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{course.description}</p>
          </div>
          <Link
            href={`/lms/login?portal=learner${providerQuery}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[0_10px_20px_rgb(18_75_115/0.16)] transition hover:-translate-y-0.5 hover:bg-[#0d3b5c] hover:shadow-[0_14px_24px_rgb(18_75_115/0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Continue to learner portal
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-3 border-y border-primary/10 py-5 sm:grid-cols-3">
          {course.details.map((detail, index) => {
            const Icon = index === 0 ? FileText : index === 1 ? Layers3 : Award;
            return (
              <div key={detail.label} className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2.5 dark:bg-slate-950/25">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{detail.label}</span>
                  <span className="mt-0.5 block truncate text-sm font-bold text-foreground">{detail.value}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:gap-10">
          <div>
            <p className="text-[10px] font-bold tracking-[0.17em] text-primary uppercase">Target candidate</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{course.audience}</p>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              Access is provided through your institution or programme team.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.17em] text-primary uppercase">What the objectives cover</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {course.objectiveAreas.map((area) => (
                <div key={area.number} className="lms-objective flex gap-3 rounded-xl border border-primary/10 bg-background/75 p-3.5">
                  <span className="font-heading text-xs font-bold tracking-[0.08em] text-primary">{area.number}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-5 text-foreground">{area.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{area.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </details>
  );
}

function CategoryPanel({ category, index, providerQuery }: { category: LmsCourseCategory; index: number; providerQuery: string }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <details className="lms-category group/category overflow-hidden rounded-[1.65rem] border border-primary/10 bg-card shadow-[0_14px_34px_rgb(18_75_115/0.065)] transition duration-300 hover:border-primary/20 hover:shadow-[0_20px_44px_rgb(18_75_115/0.1)]">
      <summary className="lms-category-summary flex cursor-pointer list-none items-center gap-4 px-5 py-5 transition-colors hover:bg-primary/[0.02] sm:gap-6 sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
        <span className={`relative grid size-14 shrink-0 place-items-center rounded-[1.2rem] ${accent.tint} sm:size-[4.5rem]`}>
          <span className={`absolute inset-x-3 bottom-0 h-1 rounded-full ${accent.line}`} aria-hidden="true" />
          <ProviderLogo provider={category.id as LmsCourseProvider} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold tracking-[0.16em] ${accent.text} uppercase`}>{category.eyebrow}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.06] px-2 py-1 text-[10px] font-bold tracking-[0.07em] text-muted-foreground uppercase">
              <span>{category.courses.length}</span>
              <span>{category.courses.length === 1 ? "course" : "courses"}</span>
            </span>
          </span>
          <span className="block font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">{category.name}</span>
          <span className="mt-2 hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">{category.description}</span>
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/10 bg-white/70 text-primary transition-colors group-hover/category:bg-primary group-hover/category:text-primary-foreground dark:bg-slate-950/30">
          <ChevronDown className="lms-category-chevron size-5 transition-transform duration-300" />
        </span>
      </summary>

      <div className="border-t border-primary/10 bg-[linear-gradient(145deg,rgba(247,251,255,.78),rgba(255,255,255,.96))] p-4 sm:p-7 dark:bg-slate-900/25">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">Explore the pathway</p>
          <span className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex">
            <Layers3 className="size-3.5 text-primary" />
            {category.courses.length} learning {category.courses.length === 1 ? "option" : "options"}
          </span>
        </div>
        <div className="grid gap-3">
          {category.courses.map((course) => (
            <CourseCard key={course.id} course={course} providerQuery={providerQuery} />
          ))}
        </div>
      </div>
    </details>
  );
}

export function LmsCourseCatalogue({
  categories,
  provider,
  providerQuery = "",
}: {
  categories: LmsCourseCategory[];
  provider?: LmsCourseProvider;
  providerQuery?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scopedCategories = selectedProvider === "all"
      ? categories
      : categories.filter((category) => category.id === selectedProvider);

    if (!normalizedQuery) return scopedCategories;

    return scopedCategories
      .map((category) => ({
        ...category,
        courses: category.courses.filter((course) => searchableCourseText(course).includes(normalizedQuery)),
      }))
      .filter((category) => category.courses.length > 0);
  }, [categories, query, selectedProvider]);

  const courseCount = filteredCategories.reduce((total, category) => total + category.courses.length, 0);
  const hasFilters = query.trim().length > 0 || selectedProvider !== "all";
  const heading = provider
    ? `Explore ${categories[0]?.name ?? "global"} certification courses.`
    : "Choose a pathway that moves you forward.";

  function clearFilters() {
    setQuery("");
    setSelectedProvider("all");
  }

  return (
    <section id="global-certifications" className="relative isolate overflow-hidden border-t border-border/70 bg-background py-20 sm:py-28 dark:bg-slate-950/20">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden="true">
        <div className="absolute top-0 left-[-10%] size-[30rem] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[8%] size-[24rem] rounded-full bg-accent/10 blur-3xl" />
      </div>
      <div className="container-site">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="section-eyebrow"><span className="h-px w-8 bg-accent" />Global certifications</p>
            <h2 className="mt-4 max-w-2xl font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{heading}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Browse objective-led certification courses curated for practical skills, confident progression, and the next stage of your career.
            </p>
          </div>
          <div className="flex items-center gap-3 lg:pb-1">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_22px_rgb(18_75_115/0.16)]">
              <Award className="size-5" />
            </span>
            <span>
              <span className="block text-2xl font-bold tracking-tight text-foreground">{courseCount}</span>
              <span className="block text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">courses available</span>
            </span>
          </div>
        </div>

        <div className="lms-catalogue-toolbar mt-10 rounded-[1.45rem] border border-primary/10 bg-white/75 p-3 shadow-[0_14px_36px_rgb(18_75_115/0.08)] backdrop-blur sm:p-4 dark:bg-slate-950/40">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search certification courses</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-primary/60" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, tools, skills, or objectives"
                className="h-12 w-full rounded-xl border border-primary/10 bg-background/80 pr-10 pl-11 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground/75 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 dark:focus:bg-slate-950"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear course search"
                  className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  <X className="size-4" />
                </button>
              )}
            </label>
            <label className="relative lg:w-64">
              <span className="sr-only">Filter by provider</span>
              <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-primary/70" />
              <select
                value={selectedProvider}
                onChange={(event) => setSelectedProvider(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-primary/10 bg-background/80 pr-10 pl-11 text-sm font-bold text-foreground outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 dark:focus:bg-slate-950"
              >
                <option value="all">All providers</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-primary transition hover:bg-primary/10"
              >
                <X className="size-4" />
                Clear
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-primary"><Check className="size-3.5" />Official objectives</span>
            <span className="hidden size-1 rounded-full bg-border sm:block" />
            <span>{hasFilters ? `${courseCount} matching ${courseCount === 1 ? "course" : "courses"}` : "Explore by provider or search the full catalogue"}</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <CategoryPanel key={category.id} category={category} index={index} providerQuery={providerQuery} />
            ))
          ) : (
            <div className="surface rounded-[1.65rem] px-6 py-14 text-center sm:px-10">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Search className="size-5" /></span>
              <h3 className="mt-5 font-heading text-2xl font-bold text-foreground">No courses found</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Try a broader search or clear the filters to browse every certification pathway.</p>
              <button type="button" onClick={clearFilters} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#0d3b5c]">
                View all courses
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}