import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date, locale = "en-IN") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.citisinfotech.com";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
