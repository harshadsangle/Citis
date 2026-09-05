import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { ForgotPasswordForm } from "@/components/marketing/InteractiveForms";
import { LMS_PORTALS, normalizeLmsPortal } from "@/lib/lms-roles";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Forgot Password", path: "/auth/forgot-password", description: "Request a secure password reset for your CITIS InfoTech learning account.", noIndex: true });

type ForgotPasswordPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const portal = normalizeLmsPortal(params?.portal) ?? "learner";
  const portalOption = LMS_PORTALS[portal];

  return (
    <section className="relative isolate flex min-h-[calc(100vh-var(--header-height))] items-center overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site"><div className="surface mx-auto max-w-lg rounded-3xl p-7 sm:p-10"><span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><KeyRound className="size-6" /></span><p className="mt-6 text-xs font-bold tracking-[0.14em] text-primary uppercase">{portalOption.label}</p><h1 className="mt-3 font-heading text-3xl font-semibold">Reset your password</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Enter the email associated with your {portal} account. If it matches an active account, we will provide a time-limited reset link.</p><div className="mt-8"><ForgotPasswordForm /></div><Link href={`/auth/login?portal=${portal}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Return to {portalOption.label.toLowerCase()} sign in</Link></div></div>
    </section>
  );
}
