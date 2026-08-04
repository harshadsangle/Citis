import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ContactForm } from "@/components/shared/ContactForm";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { OFFICES, SITE_CONFIG } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Contact Us",
  path: "/contact",
  description: "Contact CITIS InfoTech — Corporate Office Pune, Bengaluru Office.",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Contact Us"
        description={`Write to us: ${SITE_CONFIG.email} · Helpline: ${SITE_CONFIG.phone}`}
        breadcrumbs={[{ label: "Contact Us" }]}
      />
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <div>
            <AnimatedSection>
              <SectionHeading title="Contact Us" />
            </AnimatedSection>
            <AnimatedSection className="mt-8" delay={0.06}>
              <Card>
                <CardContent className="space-y-6 p-6 sm:p-7">
                  {OFFICES.map((office) => (
                    <div key={office.name}>
                      <h3 className="font-heading text-xl font-semibold">{office.name}</h3>
                      <p className="mt-3 flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                        <MapPin className="mt-1 size-4 shrink-0 text-primary" />
                        {office.address}
                      </p>
                    </div>
                  ))}
                  <div className="space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
                    <a
                      href={SITE_CONFIG.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <Phone className="size-4 text-primary" />
                      Helpline: {SITE_CONFIG.phone} (WhatsApp)
                    </a>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-3 hover:text-primary">
                      <Mail className="size-4 text-primary" />
                      Write to us: {SITE_CONFIG.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
          <AnimatedSection delay={0.1}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
