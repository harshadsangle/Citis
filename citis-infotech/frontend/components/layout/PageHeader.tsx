import Link from "next/link";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  eyebrow?: string;
  backgroundImage?: string;
  /** Page-specific hero fields. `about` = teal, `blogs` = light editorial field. */
  tone?: "default" | "about" | "blogs";
}

const tones = {
  default: {
    bg: "bg-[#254b67]",
    text: "text-white",
    glow: "[background-image:radial-gradient(circle_at_85%_15%,rgba(249,232,162,0.28),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(120,164,203,0.40),transparent_32%)]",
    grid: "opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]",
    crumb: "text-blue-100/80",
    sep: "text-blue-200/50",
    crumbHover: "hover:text-white",
    page: "text-white",
    eyebrow: "text-[#f9e8a2]",
    description: "text-blue-100/90",
  },
  about: {
    bg: "bg-[#3b6d8c]",
    text: "text-white",
    glow: "[background-image:radial-gradient(circle_at_85%_15%,rgba(180,225,235,0.34),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(120,164,203,0.46),transparent_34%)]",
    grid: "opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]",
    crumb: "text-sky-100/85",
    sep: "text-sky-200/50",
    crumbHover: "hover:text-white",
    page: "text-white",
    eyebrow: "text-[#f9e8a2]",
    description: "text-sky-100/90",
  },
  blogs: {
    bg: "bg-[#eef3f8]",
    text: "text-slate-900",
    glow: "[background-image:radial-gradient(circle_at_88%_12%,rgba(14,116,144,0.12),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.10),transparent_36%)]",
    grid: "opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:42px_42px]",
    crumb: "text-slate-500",
    sep: "text-slate-400",
    crumbHover: "hover:text-slate-900",
    page: "text-slate-900",
    eyebrow: "text-teal-700",
    description: "text-slate-600",
  },
} as const;

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  eyebrow,
  backgroundImage,
  tone = "default",
}: PageHeaderProps) {
  const t = tones[tone];
  return (
    <section className={cn("relative overflow-hidden border-b border-border py-16 sm:py-20", t.bg, t.text)}>
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-[center_55%]"
        />
      )}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1]",
          backgroundImage
            ? tone === "blogs"
              ? "bg-gradient-to-r from-[#eef3f8]/95 via-[#eef3f8]/78 to-[#eef3f8]/38"
              : "bg-gradient-to-r from-[#1e3d54]/92 via-[#4c7898]/78 to-[#1e3d54]/36"
            : cn("opacity-70", t.glow),
        )}
      />
      <div className={cn("pointer-events-none absolute inset-0 z-[2]", t.grid)} />
      <div className="container-site relative z-10">
        <Breadcrumb className="mb-7">
          <BreadcrumbList className={t.crumb}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className={t.crumbHover}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label}>
                <BreadcrumbSeparator className={t.sep} />
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className={t.crumbHover}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className={t.page}>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {eyebrow && (
          <p className={cn("mb-3 text-sm font-bold tracking-[0.2em] uppercase", t.eyebrow)}>
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl font-heading text-3xl leading-tight font-bold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl">{title}</h1>
        {description && (
          <p className={cn("mt-4 max-w-2xl text-sm leading-7 sm:text-base", t.description)}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
