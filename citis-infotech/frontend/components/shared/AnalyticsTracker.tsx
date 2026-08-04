"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsService } from "@/services/api";

/** First-party page-view tracker (MongoDB via Express). */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    void analyticsService.track({ name: "page_view", path: pathname });
  }, [pathname]);

  return null;
}
