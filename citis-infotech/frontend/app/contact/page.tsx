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
            <div className="mt-8 space-y-4">
              {OFFICES.map((office, index) => (
                <AnimatedSection key={office.name} delay={index * 0.06}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-heading text-xl font-semibold">{office.name}</h3>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <p className="flex items-start gap-3">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                          {office.address}
                        </p>
                        <a
                          href={SITE_CONFIG.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 hover:text-primary"
                        >
                          <Phone className="size-4 text-primary" />
                          {office.phone} (WhatsApp)
                        </a>
                        <a href={`mailto:${office.email}`} className="flex items-center gap-3 hover:text-primary">
                          <Mail className="size-4 text-primary" />
                          {office.email}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>
                Write to us:{" "}
                <a className="font-medium text-primary" href={`mailto:${SITE_CONFIG.email}`}>
                  {SITE_CONFIG.email}
                </a>
              </p>
              <p>
                Helpline:{" "}
                <a
                  className="font-medium text-primary"
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {SITE_CONFIG.phone} (WhatsApp)
                </a>
              </p>
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
