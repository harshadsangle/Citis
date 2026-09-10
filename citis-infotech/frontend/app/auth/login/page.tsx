import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { CitisLogo } from "@/components/layout/CitisLogo";
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
    <section className="auth-shell relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-8 sm:py-12 lg:py-16">
      <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
      <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      <div className="container-site relative z-10 flex justify-center">
        <div className="auth-panel auth-card surface w-full max-w-[31rem] rounded-[2rem] p-6 sm:p-10">
          <div className="auth-card-header">
            <CitisLogo href={null} className="text-[0.86rem] sm:text-[0.96rem]" />
            <span className="auth-role-chip"><Check className="size-3.5" />Secure workspace access</span>
          </div>
          <Link href={provider ? `/lms?provider=${provider}` : "/lms"} className="auth-back-link mt-8 inline-flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="size-4" />Choose another portal
          </Link>
          <div className="mt-8">
            <p className="auth-kicker">{portalOption.label}</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-[2.65rem]">Welcome back</h1>
            <p className="auth-intro mt-3">Sign in to continue to your {portalOption.label.toLowerCase()} workspace.</p>
          </div>
          <div className="auth-portal-note mt-6">
            <span className="auth-portal-icon"><ShieldCheck className="size-4" /></span>
            <span><strong>{portalOption.eyebrow}</strong><small>{portalOption.description}</small></span>
          </div>
          <div className="mt-7"><LoginForm portal={portal} provider={provider} /></div>
          <p className="auth-support-copy mt-7 text-center text-sm">Need access? <Link href="/contact" className="font-semibold">Contact your programme team</Link></p>
        </div>
      </div>
    </section>
  );
}
