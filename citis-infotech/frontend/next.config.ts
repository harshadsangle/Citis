import type { NextConfig } from "next";
import { resolve } from "node:path";

const apiHost = process.env.NEXT_PUBLIC_API_HOST ?? "localhost";
const strapiHost = process.env.NEXT_PUBLIC_STRAPI_HOST ?? "localhost";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "http", hostname: apiHost, port: "5000", pathname: "/uploads/**" },
      { protocol: "http", hostname: strapiHost, port: "1337", pathname: "/uploads/**" },
      { protocol: "https", hostname: apiHost, pathname: "/uploads/**" },
      { protocol: "https", hostname: strapiHost, pathname: "/uploads/**" },
    ],
  },
  turbopack: {
    root: resolve(__dirname),
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:5000 http://localhost:1337 https:; font-src 'self' data:; connect-src 'self' http://localhost:5000 http://localhost:1337 https:; frame-src 'self' https://www.openstreetmap.org https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
      },
    ];

    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
