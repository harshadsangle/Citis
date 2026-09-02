import Link from "next/link";
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/marketing/InteractiveForms";
import { generatePageMetadata } from "@/lib/seo";
import { LMS_PORTALS, normalizeLmsPortal } from "@/lib/lms-roles";

export const metadata = generatePageMetadata({
  title: "Create New Account",
  path: "/auth/register",
  description: "Create a role-based CITIS InfoTech learning account.",
  noIndex: true,
});

type RegisterPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const portal = normalizeLmsPortal(params?.portal) ?? "learner";
  const portalOption = LMS_PORTALS[portal];
  return (
    <section className="auth-shell relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-10 sm:py-16">
      <div className="container-site grid items-stretch gap-8 lg:grid-cols-2">
        <div className="auth-brand-panel hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-[1.75rem] p-10 text-white shadow-2xl lg:flex">
          <div className="flex items-center gap-3"><GraduationCap className="size-8 text-orange-300" /><span className="font-heading text-xl font-semibold">CITIS InfoTech</span></div>
          <div><p className="text-xs font-bold tracking-[0.2em] text-orange-300 uppercase">{portalOption.label}</p><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold">Start your CITIS journey.</h1><p className="mt-5 leading-7 text-blue-100">{portalOption.description}</p></div>
          <p className="flex items-center gap-2 text-sm text-blue-100"><ShieldCheck className="size-4 text-orange-300" />Secure access for learners, educators, and partners</p>
        </div>
        <div className="auth-panel surface flex items-center rounded-[1.75rem] p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <Link href={`/auth/login?portal=${portal}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Back to sign in</Link>
            <p className="mt-9 text-xs font-bold tracking-[0.14em] text-primary uppercase">{portalOption.label}</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">Create new account</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Create an account for the {portal} portal. Email verification keeps your account secure.</p>
            <div className="mt-8"><RegisterForm portal={portal} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}