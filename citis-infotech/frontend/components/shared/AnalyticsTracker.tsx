"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsService } from "@/services/api";

/** First-party page-view tracker when an API backend is explicitly configured. */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // This branch is frontend-only. Keep analytics available for deployments
    // that opt into an API, without making the public site call localhost.
    if (!pathname || pathname.startsWith("/admin") || !process.env.NEXT_PUBLIC_API_URL?.trim()) return;
    void analyticsService.track({ name: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
