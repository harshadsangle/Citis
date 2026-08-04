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
    <section className="relative overflow-hidden border-b border-border bg-[#071221] py-16 text-white sm:py-20">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_85%_15%,rgba(255,122,0,0.28),transparent_28%),radial-gradient(circle_at_10%_80%,rgba(37,99,235,0.35),transparent_32%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="container-site relative">
        <Breadcrumb className="mb-7">
          <BreadcrumbList className="text-blue-100/80">
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="hover:text-white">Home</Link></BreadcrumbLink></BreadcrumbItem>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label}>
                <BreadcrumbSeparator className="text-blue-200/50" />
                {item.href ? <BreadcrumbLink asChild><Link href={item.href} className="hover:text-white">{item.label}</Link></BreadcrumbLink> : <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {eyebrow && <p className="mb-3 text-sm font-bold tracking-[0.2em] text-orange-300 uppercase">{eyebrow}</p>}
        <h1 className="max-w-4xl font-heading text-4xl leading-tight font-bold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100/90 sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
