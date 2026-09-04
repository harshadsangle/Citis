"use client";

import { useEffect } from "react";

const CLIENT_CACHE_VERSION = "citis-infotech-v3";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    const prepareServiceWorker = async () => {
      const migrationKey = "citis-service-worker-version";
      if (window.localStorage.getItem(migrationKey) !== CLIENT_CACHE_VERSION) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration) => new URL(registration.scope).origin === window.location.origin)
            .map((registration) => registration.unregister()),
        );
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name.startsWith("citis-infotech-"))
            .map((name) => caches.delete(name)),
        );
        window.localStorage.setItem(migrationKey, CLIENT_CACHE_VERSION);
      }

      if (!cancelled && process.env.NODE_ENV === "production") {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
    };

    prepareServiceWorker().catch((error) => {
      console.error("Service worker preparation failed:", error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
