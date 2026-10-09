import type { NextConfig } from "next";
import { resolveLmsApiOrigin } from "../shared/staging-api-config";

const apiBase = resolveLmsApiOrigin();

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