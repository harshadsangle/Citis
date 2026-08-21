import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

interface MetadataInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
}

export function generatePageMetadata({
  title,
  description = SITE_CONFIG.description,
  path = "",
  image = "/images/premium-indian-hero-campus.jpg",
  type = "website",
  noIndex = false,
  keywords,
}: MetadataInput = {}): Metadata {
  const resolvedTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title: resolvedTitle,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      title: resolvedTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: "en_IN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.url,
    logo: absoluteUrl("/icons/icon-512.svg"),
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    sameAs: [
      "https://www.linkedin.com/company/citis-infotech",
      "https://x.com/citisinfotech",
      "https://www.youtube.com/@citisinfotech",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Outer Ring Road, Bellandur",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560103",
      addressCountry: "IN",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
