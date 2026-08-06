import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  eyebrow?: string;
  /** `about` uses a teal brand field instead of the default near-black hero. */
  tone?: "default" | "about";
}

export function PageHeader({ title, description, breadcrumbs = [], eyebrow, tone = "default" }: PageHeaderProps) {
  const isAbout = tone === "about";
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border py-16 text-white sm:py-20",
        isAbout ? "bg-[#0c4a6e]" : "bg-[#071221]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-50",
          isAbout
            ? "[background-image:radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(14,116,144,0.45),transparent_34%)]"
            : "[background-image:radial-gradient(circle_at_85%_15%,rgba(255,122,0,0.28),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.35),transparent_32%)]",
        )}
      />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="container-site relative">
        <Breadcrumb className="mb-7">
          <BreadcrumbList className={isAbout ? "text-sky-100/85" : "text-blue-100/80"}>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="hover:text-white">Home</Link></BreadcrumbLink></BreadcrumbItem>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label}>
                <BreadcrumbSeparator className={isAbout ? "text-sky-200/50" : "text-blue-200/50"} />
                {item.href ? <BreadcrumbLink asChild><Link href={item.href} className="hover:text-white">{item.label}</Link></BreadcrumbLink> : <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {eyebrow && (
          <p className={cn("mb-3 text-sm font-bold tracking-[0.2em] uppercase", isAbout ? "text-sky-200" : "text-orange-300")}>
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl font-heading text-4xl leading-tight font-bold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {description && (
          <p className={cn("mt-5 max-w-2xl text-base leading-8 sm:text-lg", isAbout ? "text-sky-100/90" : "text-blue-100/90")}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
