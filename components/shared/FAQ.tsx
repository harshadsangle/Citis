import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export function FAQ({ items, title = "Frequently asked questions", description, className }: { items: FAQItem[]; title?: string; description?: string; className?: string }) {
  return (
    <section className={cn("container-site py-16 sm:py-24", className)}>
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:gap-16">
        <SectionHeading eyebrow="FAQs" title={title} description={description ?? "Clear answers to common questions about working with CITIS InfoTech."} />
        <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5 sm:px-7">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
