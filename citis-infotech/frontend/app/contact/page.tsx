import { Mail, MapPin, Phone } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ContactForm } from "@/components/shared/ContactForm";
import { FAQ } from "@/components/shared/FAQ";
import { OfficeMap } from "@/components/shared/GoogleMap";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardContent } from "@/components/ui/card";
import { OFFICES, SOCIAL_LINKS } from "@/lib/constants";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({ title: "Contact", path: "/contact", description: "Contact CITIS InfoTech to discuss university, school, vocational, academy, industry, or learning technology collaboration." });

const socialIcons = { LinkedIn: FaLinkedinIn, YouTube: FaYoutube, Instagram: FaInstagram, X: FaXTwitter };

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact CITIS InfoTech" title="Let’s make learning move forward" description="Tell us about your institution, learners, priority, or partnership idea. Our education team will respond with a useful next step." breadcrumbs={[{ label: "Contact" }]} />
      <section className="container-site py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:gap-16">
          <div>
            <AnimatedSection><SectionHeading eyebrow="Contact Us" title="Corporate and Bengaluru offices" description="Write to us: info@citisinfotech.in · Helpline: +91 7204992221" /></AnimatedSection>
            <div className="mt-8 space-y-4">
              {OFFICES.map((office, index) => <AnimatedSection key={office.name} delay={index * 0.06}><Card><CardContent className="p-6"><h3 className="font-heading text-xl font-semibold">{office.name}</h3><div className="mt-4 space-y-3 text-sm text-muted-foreground"><p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" />{office.address}</p><a href={`tel:${office.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-primary"><Phone className="size-4 text-primary" />{office.phone}</a><a href={`mailto:${office.email}`} className="flex items-center gap-3 hover:text-primary"><Mail className="size-4 text-primary" />{office.email}</a></div></CardContent></Card></AnimatedSection>)}
            </div>
            <AnimatedSection className="mt-8"><p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Follow CITIS InfoTech</p><div className="mt-3 flex gap-2">{SOCIAL_LINKS.map((social) => { const Icon = socialIcons[social.label]; return <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="grid size-11 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"><Icon className="size-5" /></a>; })}</div></AnimatedSection>
          </div>
          <AnimatedSection delay={0.1}><div className="mb-7"><SectionHeading eyebrow="Send an inquiry" title="What would you like to achieve?" description="Share enough context for us to connect you with the right academic, programme, product, or partnership specialist." /></div><ContactForm /></AnimatedSection>
        </div>
      </section>
      <section className="border-y border-border bg-slate-100/70 py-16 dark:bg-slate-900/60 sm:py-24"><div className="container-site"><AnimatedSection><SectionHeading eyebrow="Find us" title="CITIS InfoTech, Bengaluru" /></AnimatedSection><AnimatedSection className="mt-8"><OfficeMap addressLabel="CITIS InfoTech, Bengaluru" className="min-h-96" /></AnimatedSection></div></section>
      <FAQ title="Before you get in touch" items={[
        { question: "What information is helpful in an initial inquiry?", answer: "Share your institution or organisation, intended learners, priority outcome, approximate scale, current stage, and any important timeline. It is fine if the solution is not yet defined." },
        { question: "How quickly will CITIS respond?", answer: "We aim to respond within one business day. Complex partnership inquiries may take up to two business days to route to the right specialist." },
        { question: "Do you work outside Bengaluru?", answer: "Yes. CITIS supports partners across India and internationally through blended delivery, regional collaboration, and planned on-site work." },
        { question: "Can individual learners contact the academy team?", answer: "Yes. Select Future Academy or the relevant programme in your message and tell us your current experience and learning goal." },
      ]} />
    </>
  );
}
