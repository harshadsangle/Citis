import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { AnalyticsTracker } from "@/components/shared/AnalyticsTracker";
import { SITE_CONFIG } from "@/lib/constants";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Technology-Enabled Education Solutions`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  generator: "Next.js",
  category: "education",
  keywords: [
    "EdTech",
    "university solutions",
    "school STEM",
    "vocational education",
    "AI Future Academy",
    "industry academia collaboration",
    "CITIS InfoTech",
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.legalName,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | Technology-Enabled Education Solutions`,
    description: SITE_CONFIG.description,
    images: [{ url: "/icons/icon-512.svg", width: 512, height: 512, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} | Technology-Enabled Education Solutions`,
    description: SITE_CONFIG.description,
    images: ["/icons/icon-512.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = organizationJsonLd();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <ScrollProgress />
            <OfflineBanner />
            <AnalyticsTracker />
            <ConditionalShell>{children}</ConditionalShell>
            <ServiceWorkerRegister />
          </QueryProvider>
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
