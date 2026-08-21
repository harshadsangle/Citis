import { Clock3 } from "lucide-react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

interface ContentComingSoonPageProps {
  title: string;
}

export function ContentComingSoonPage({ title }: ContentComingSoonPageProps) {
  return (
    <section className="border-b border-border bg-[#e8f4f8] py-20 sm:py-28">
      <div className="container-site">
        <AnimatedSection className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-[#b9d8e6] bg-white p-8 text-center shadow-[0_20px_55px_rgba(15,76,129,0.1)] sm:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#0f4c81]/10 text-[#0f4c81]">
              <Clock3 className="size-8" />
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-[#d19a14]">
              {title}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-[#123d5c] sm:text-4xl">
              Content Coming Soon
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-muted-foreground">
              We are preparing this page with more information about the people and advisors
              helping shape CITIS. Please check back soon.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}