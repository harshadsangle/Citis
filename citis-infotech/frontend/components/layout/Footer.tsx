import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { CitisLogo } from "@/components/layout/CitisLogo";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { FOOTER_LINKS, OFFICES, SITE_CONFIG, SOCIAL_LINKS, googleMapsUrl } from "@/lib/constants";

const socialIcons = [FaLinkedinIn, null, FaYoutube, null];

export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-[#0b1424] text-slate-300">
      <div className="container-site py-14 sm:py-18">
        <div className="grid gap-12 border-b border-slate-700/80 pb-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <CitisLogo className="text-[1.05rem] text-white" />
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">{SITE_CONFIG.description}</p>
            </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-white">Ideas worth building on</h2>
            <p className="mt-1.5 text-sm text-slate-400">Monthly technology insights, practical and concise.</p>
            <NewsletterForm variant="dark" className="mt-4" />
          </div>
        </div>
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-6">
            {OFFICES.map((office) => (
              <div key={office.name}>
                <h3 className="font-heading text-sm font-semibold text-white">{office.name}</h3>
                <p className="mt-2 flex max-w-xs gap-2 text-xs leading-6 text-slate-400">
                  <MapPin className="mt-1 size-3.5 shrink-0" />
                  <span>
                    {office.address}{" "}
                    <a
                      href={googleMapsUrl(office.address)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 underline-offset-2 hover:text-white hover:underline"
                    >
                      Google Maps
                    </a>
                  </span>
                </p>
              </div>
            ))}
            <div className="space-y-2 text-sm">
              <a href={SITE_CONFIG.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Phone className="size-4" />{SITE_CONFIG.phone} (WhatsApp)</a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="size-4" />{SITE_CONFIG.email}</a>
            </div>
          </div>
          {FOOTER_LINKS.map((column) => (
            <div key={column.title}>
              <h3 className="font-heading text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 border-t border-slate-700/80 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white">Sitemap</Link>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = socialIcons[index];
                return <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="grid size-8 place-items-center rounded-full border border-slate-700 text-[10px] font-bold text-slate-400 hover:border-slate-500 hover:text-white">{Icon ? <Icon className="size-3.5" /> : social.label.slice(0, 2)}</a>;
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
