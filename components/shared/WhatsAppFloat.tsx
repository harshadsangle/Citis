"use client";

import { FaWhatsapp } from "react-icons/fa6";
import { SITE_CONFIG } from "@/lib/constants";

const DEFAULT_MESSAGE =
  "Hello CITIS InfoTech, I would like to know more about your education programs.";

export function WhatsAppFloat() {
  const href = `${SITE_CONFIG.whatsappUrl}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat on WhatsApp at ${SITE_CONFIG.phone}`}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(37,211,102,0.45)] transition hover:-translate-y-0.5 hover:bg-[#1ebe57] sm:right-6 sm:bottom-6"
    >
      <FaWhatsapp className="size-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
