import Link from "next/link";
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/marketing/InteractiveForms";
import { LMS_PORTALS, normalizeLmsPortal } from "@/lib/lms-roles";
import { generatePageMetadata } from "@/lib/seo";
import { normalizeLmsCourseProvider } from "@/lib/lms-catalog";

export const metadata = generatePageMetadata({ title: "Sign In", path: "/auth/login", description: "Sign in to your CITIS InfoTech learning account.", noIndex: true });

type LoginPageProps = {
  searchParams?: Promise<{ portal?: string; provider?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const portal = normalizeLmsPortal(params?.portal) ?? "learner";
  const provider = normalizeLmsCourseProvider(params?.provider);
  const portalOption = LMS_PORTALS[portal];
  return (
    <section className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site grid items-stretch gap-8 lg:grid-cols-2">
        <div className="brand-gradient hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-3xl p-10 text-white shadow-2xl lg:flex">
          <div className="flex items-center gap-3"><GraduationCap className="size-8 text-orange-300" /><span className="font-heading text-xl font-semibold">CITIS InfoTech</span></div>
          <div><p className="text-xs font-bold tracking-[0.2em] text-orange-300 uppercase">{portalOption.label}</p><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold">{portalOption.eyebrow}.</h1><p className="mt-5 leading-7 text-blue-100">{portalOption.description}</p></div>
          <p className="flex items-center gap-2 text-sm text-blue-100"><ShieldCheck className="size-4 text-orange-300" />Secure access for learners, educators, and partners</p>
        </div>
        <div className="surface flex items-center rounded-3xl p-6 sm:p-10"><div className="mx-auto w-full max-w-md"><Link href={provider ? `/lms?provider=${provider}` : "/lms"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Choose another portal</Link><p className="mt-9 text-xs font-bold tracking-[0.14em] text-primary uppercase">{portalOption.label}</p><h1 className="mt-3 font-heading text-3xl font-semibold">Welcome back</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Use the account assigned to your {portal} role.</p><div className="mt-8"><LoginForm portal={portal} provider={provider} /></div><p className="mt-7 text-center text-sm text-muted-foreground">Need access? <Link href="/contact" className="font-semibold text-primary hover:underline">Contact your programme team</Link></p></div></div>
      </div>
    </section>
  );
}
