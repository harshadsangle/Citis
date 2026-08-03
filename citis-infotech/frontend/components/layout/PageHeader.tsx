import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  eyebrow?: string;
}

export function PageHeader({ title, description, breadcrumbs = [], eyebrow }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-slate-100/70 py-16 dark:bg-slate-900 sm:py-20">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_80%_20%,rgba(37,99,235,.15),transparent_35%)]" />
      <div className="container-site relative">
        <Breadcrumb className="mb-7">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label}>
                <BreadcrumbSeparator />
                {item.href ? <BreadcrumbLink asChild><Link href={item.href}>{item.label}</Link></BreadcrumbLink> : <BreadcrumbPage>{item.label}</BreadcrumbPage>}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {eyebrow && <p className="mb-3 text-sm font-bold tracking-[0.18em] text-secondary uppercase">{eyebrow}</p>}
        <h1 className="max-w-4xl font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
