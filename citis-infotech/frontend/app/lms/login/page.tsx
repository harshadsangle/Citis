import Link from "next/link";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Learning Portal Sign In",
  path: "/lms/login",
  description: "Sign in to the CITIS Skills Excellence Centre learning portal.",
  noIndex: true,
});

export default function LmsLoginPage() {
  return (
    <main className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site">
        <div className="surface mx-auto max-w-xl rounded-3xl p-7 shadow-sm sm:p-10">
          <Link href="/lms" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to learning portal
          </Link>
          <div className="mt-10 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-primary uppercase">CITIS identity</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold">Continue to your portal</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use your CITIS account to enter the role-aware learning platform. Your institution determines the portal and permissions you can access.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8 w-full rounded-full">
            <Link href="/auth/login?callbackUrl=%2Flms">Sign in with CITIS <ArrowRight /></Link>
          </Button>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p>Sessions are managed by the CITIS identity foundation. Need access? Contact your programme team.</p>
          </div>
        </div>
      </div>
    </main>
  );
}