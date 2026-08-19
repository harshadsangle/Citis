import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Verify Email",
  path: "/auth/verify-email",
  description: "Verify your CITIS InfoTech account email address.",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-var(--header-height))] items-center overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site">
        <Suspense
          fallback={
            <div className="surface mx-auto max-w-lg rounded-3xl p-7 text-sm text-muted-foreground sm:p-10">
              Loading verification…
            </div>
          }
        >
          <VerifyEmailClient />
        </Suspense>
      </div>
    </section>
  );
}
