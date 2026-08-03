import Link from "next/link";
import { BookOpen, Home, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "You Are Offline", path: "/offline", description: "CITIS InfoTech offline page.", noIndex: true });

export default function OfflinePage() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-var(--header-height))] items-center overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fafc,#eaf4ff_65%,#fff7ed)] dark:bg-[linear-gradient(135deg,#0f172a,#10233e_65%,#26170c)]" />
      <div className="container-site">
        <div className="surface mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><WifiOff className="size-8" /></span>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-accent uppercase">CITIS InfoTech PWA</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-balance">Your learning journey can pause—not disappear.</h1>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">This page is not available without a connection yet. Previously cached resources may still work. Reconnect and try again.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg"><a href=""><RefreshCw />Try again</a></Button>
            <Button asChild variant="outline" size="lg"><Link href="/"><Home />Go home</Link></Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 border-t border-border pt-7 text-sm text-muted-foreground"><BookOpen className="size-4 text-primary" />Cached learning content remains available from your browser history.</div>
        </div>
      </div>
    </section>
  );
}
