import type { NextConfig } from "next";

const apiBase = process.env.LMS_API_ORIGIN || "http://127.0.0.1:4000/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/api/v1", destination: apiBase },
      { source: "/api/v1/:path*", destination: `${apiBase}/:path*` },
    ];
  },
};

export default nextConfig;