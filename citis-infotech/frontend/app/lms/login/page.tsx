import Link from "next/link";
import { ArrowLeft, GraduationCap, ShieldCheck } from "lucide-react";
import { LmsLoginForm } from "@/components/lms/LmsLoginForm";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "LMS Sign In", path: "/lms/login", description: "Sign in to the CITIS learning management system.", noIndex: true });

export default function LmsLoginPage() {
  return (
    <section className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)]" />
      <div className="container-site grid items-stretch gap-8 lg:grid-cols-2">
        <div className="brand-gradient hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-3xl p-10 text-white shadow-2xl lg:flex">
          <div className="flex items-center gap-3"><GraduationCap className="size-8 text-orange-300" /><span className="font-heading text-xl font-semibold">CITIS LMS</span></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Learning portal</p><h1 className="mt-5 font-heading text-4xl leading-tight font-semibold">Turn every learning milestone into momentum.</h1><p className="mt-5 leading-7 text-blue-100">Access your courses, projects, progress, and credentials in one focused space.</p></div>
          <p className="flex items-center gap-2 text-sm text-blue-100"><ShieldCheck className="size-4 text-orange-300" />Learning experiences designed for the future</p>
        </div>
        <div className="surface flex items-center rounded-3xl p-6 sm:p-10"><div className="mx-auto w-full max-w-md"><Link href="/lms" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Back to LMS</Link><h1 className="mt-9 font-heading text-3xl font-semibold">Welcome to your learning space</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to continue your CITIS learning journey.</p><div className="mt-8"><LmsLoginForm /></div><p className="mt-7 text-center text-sm text-muted-foreground">New to the LMS? <Link href="/lms/register" className="font-semibold text-primary hover:underline">Create an account</Link></p></div></div>
      </div>
    </section>
  );
}