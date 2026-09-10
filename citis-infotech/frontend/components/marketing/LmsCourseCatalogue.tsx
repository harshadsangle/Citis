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
  Clock3,
  FileText,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { LmsCourse, LmsCourseCategory, LmsCourseProvider } from "@/lib/lms-catalog";

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
  { tint: "#e5f2f2", line: "#5ca6b1", text: "#176276" },
  { tint: "#edeefa", line: "#6474b9", text: "#40518d" },
  { tint: "#fff0e7", line: "#ef7d3c", text: "#b35925" },
  { tint: "#e8f4ed", line: "#278a76", text: "#1e6d60" },
];

function ProviderLogo({ provider }: { provider: LmsCourseProvider }) {
  const logo = PROVIDER_LOGOS[provider];
  return (
    <span className="lms-provider-logo">
      <Image src={logo.src} alt={logo.alt} width={128} height={64} sizes={logo.sizes} className="max-h-11 max-w-full w-auto object-contain" />
    </span>
  );
}

function searchableCourseText(course: LmsCourse) {
  return [course.title, course.description, course.audience, ...course.details.flatMap((detail) => [detail.label, detail.value]), ...course.objectiveAreas.flatMap((area) => [area.title, area.description])].join(" ").toLowerCase();
}

function DetailIcon({ label }: { label: string }) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("objective") || normalizedLabel.includes("lesson")) return <Layers3 className="size-3.5" />;
  if (normalizedLabel.includes("exam") || normalizedLabel.includes("experience") || normalizedLabel.includes("hour")) return <Clock3 className="size-3.5" />;
  if (normalizedLabel.includes("source") || normalizedLabel.includes("pdf")) return <FileText className="size-3.5" />;
  return <Award className="size-3.5" />;
}

function CourseCard({
  course,
  providerQuery,
  index,
  category,
}: {
  course: LmsCourse;
  providerQuery: string;
  index: number;
  category: LmsCourseCategory;
}) {
  return (
    <details className="lms-discovery-card" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <summary className="lms-discovery-card-summary">
        <span className="lms-card-art"><span className="lms-card-index">{String(index + 1).padStart(2, "0")}</span><BookOpen className="size-4" /></span>
        <span className="lms-card-summary-copy">
          <span className="lms-card-label"><span />{category.eyebrow}<i />{category.name}</span>
          <span className="lms-card-title">{course.title}</span>
          <span className="lms-card-meta">
            {course.details.slice(0, 3).map((detail) => (
              <span key={detail.label}><DetailIcon label={detail.label} /><small>{detail.label}</small><strong>{detail.value}</strong></span>
            ))}
          </span>
        </span>
        <span className="lms-card-action"><span>View details</span><span className="lms-card-open"><ArrowRight className="size-4" /></span></span>
      </summary>
      <div className="lms-discovery-card-detail">
        <div className="lms-detail-intro"><div><span className="lms-detail-pill"><FileText className="size-3.5" />Official exam objectives</span><span className="lms-detail-pill lms-detail-pill-orange"><Sparkles className="size-3.5" />Career-ready pathway</span></div><p>{course.description}</p></div>
        <div className="lms-detail-facts">{course.details.map((detail, detailIndex) => <div key={detail.label}><span>{detailIndex === 0 ? <Clock3 className="size-4" /> : detailIndex === 1 ? <Layers3 className="size-4" /> : <Award className="size-4" />}</span><small>{detail.label}</small><strong>{detail.value}</strong></div>)}</div>
        <div className="lms-detail-columns"><div><span className="lms-detail-heading">Target candidate</span><p>{course.audience}</p><span className="lms-detail-check"><Check className="size-3.5" />Access through your institution or programme team.</span></div><div><span className="lms-detail-heading">Objective areas</span><div className="lms-objective-grid">{course.objectiveAreas.map((area) => <div key={area.number} className="lms-objective"><strong>{area.number}</strong><span><b>{area.title}</b><small>{area.description}</small></span></div>)}</div></div></div>
        <Link href={`/lms/login?portal=learner${providerQuery}`} className="lms-detail-cta">Continue to learner portal <ArrowRight className="size-4" /></Link>
      </div>
    </details>
  );
}

function CategoryPanel({ category, index, providerQuery }: { category: LmsCourseCategory; index: number; providerQuery: string }) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <section className="lms-provider-section" style={{ "--provider-tint": accent.tint, "--provider-line": accent.line, "--provider-text": accent.text } as React.CSSProperties}>
      <div className="lms-provider-heading">
        <div className="lms-provider-heading-main"><span className="lms-provider-mark"><ProviderLogo provider={category.id as LmsCourseProvider} /></span><div><span className="lms-provider-eyebrow">{category.eyebrow}</span><h3>{category.name}</h3><p>{category.description}</p></div></div>
        <div className="lms-provider-count"><strong>{category.courses.length}</strong><span>{category.courses.length === 1 ? "course" : "courses"}</span></div>
      </div>
      <div className="lms-course-grid">{category.courses.map((course, courseIndex) => <CourseCard key={course.id} course={course} category={category} providerQuery={providerQuery} index={courseIndex} />)}</div>
    </section>
  );
}

export function LmsCourseCatalogue({ categories, provider, providerQuery = "" }: { categories: LmsCourseCategory[]; provider?: LmsCourseProvider; providerQuery?: string }) {
  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [sortOrder, setSortOrder] = useState<"provider" | "courses" | "title">("provider");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const scopedCategories = selectedProvider === "all" ? categories : categories.filter((category) => category.id === selectedProvider);
    const searched = normalizedQuery ? scopedCategories.map((category) => ({ ...category, courses: category.courses.filter((course) => searchableCourseText(course).includes(normalizedQuery)) })).filter((category) => category.courses.length > 0) : scopedCategories;
    return [...searched].sort((a, b) => {
      if (sortOrder === "courses") return b.courses.length - a.courses.length;
      if (sortOrder === "title") return a.name.localeCompare(b.name);
      return categories.indexOf(a) - categories.indexOf(b);
    });
  }, [categories, query, selectedProvider, sortOrder]);

  const courseCount = filteredCategories.reduce((total, category) => total + category.courses.length, 0);
  const hasFilters = query.trim().length > 0 || selectedProvider !== "all";
  const heading = provider ? `Explore ${categories[0]?.name ?? "global"} certification courses.` : "Find the path that fits your next move.";

  function clearFilters() {
    setQuery("");
    setSelectedProvider("all");
  }

  return (
    <section id="global-certifications" className="lms-catalogue">
      <div className="container-site">
        <div className="lms-catalogue-heading">
          <div><p className="lms-kicker"><span className="lms-kicker-line" />Learning catalogue</p><h2>{heading}</h2><p>Browse recognised certification pathways and objective-led courses designed for practical progress.</p></div>
          <div className="lms-catalogue-total"><strong>{courseCount}</strong><span>courses<br />available</span></div>
        </div>
        <div className="lms-catalogue-toolbar">
          <label className="lms-search-field"><span className="sr-only">Search certification courses</span><Search className="size-[1.1rem]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search skills, tools, or certification names" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear course search"><X className="size-4" /></button>}</label>
          <label className="lms-select-field"><SlidersHorizontal className="size-4" /><span className="sr-only">Filter by provider</span><select value={selectedProvider} onChange={(event) => setSelectedProvider(event.target.value)}><option value="all">All providers</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ChevronDown className="size-4" /></label>
          <label className="lms-select-field lms-sort-field"><span className="lms-sort-label">Sort</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}><option value="provider">Recommended</option><option value="courses">Most courses</option><option value="title">A–Z</option></select><ChevronDown className="size-4" /></label>
          {hasFilters && <button type="button" onClick={clearFilters} className="lms-clear-filter"><X className="size-4" />Clear</button>}
        </div>
        <div className="lms-catalogue-status"><span><Check className="size-3.5" />Official objectives</span><span className="lms-status-divider" />{hasFilters ? `${courseCount} matching ${courseCount === 1 ? "course" : "courses"}` : "Explore by provider, interest, or career direction"}</div>
        <div className="lms-provider-list">
          {filteredCategories.length > 0 ? filteredCategories.map((category, index) => <CategoryPanel key={category.id} category={category} index={index} providerQuery={providerQuery} />) : <div className="lms-empty-state"><span><Search className="size-5" /></span><h3>No courses found</h3><p>Try a broader search or clear the filters to browse every certification pathway.</p><button type="button" onClick={clearFilters}>View all courses <ArrowRight className="size-4" /></button></div>}
        </div>
      </div>
    </section>
  );
}