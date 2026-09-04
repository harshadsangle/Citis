const CACHE_NAME = "citis-infotech-v3";
const OFFLINE_URL = "/offline";
const FORM_QUEUE = "citis-offline-forms";
const PRECACHE = ["/", "/offline", "/manifest.json", "/icons/icon-192.svg", "/icons/icon-512.svg", "/search"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function flushOfflineForms() {
  const cache = await caches.open(FORM_QUEUE);
  const requests = await cache.keys();
  await Promise.all(
    requests.map(async (request) => {
      try {
        const stored = await cache.match(request);
        if (!stored) return;
        const payload = await stored.json();
        const response = await fetch(payload.url, {
          method: payload.method || "POST",
          headers: payload.headers || { "Content-Type": "application/json" },
          body: payload.body,
          credentials: "include",
        });
        if (response.ok) await cache.delete(request);
      } catch {
        /* keep queued for next sync */
      }
    }),
  );
}

self.addEventListener("sync", (event) => {
  if (event.tag === "citis-form-sync") {
    event.waitUntil(flushOfflineForms());
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Queue failed public form posts for background sync (native browser API only)
  if (
    request.method === "POST" &&
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/") &&
    (url.pathname.includes("/contacts") ||
      url.pathname.includes("/inquiries") ||
      url.pathname.includes("/newsletter"))
  ) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const body = await request.clone().text();
        const cache = await caches.open(FORM_QUEUE);
        const key = new Request(`${url.pathname}?queued=${Date.now()}`, { method: "GET" });
        await cache.put(
          key,
          new Response(
            JSON.stringify({
              url: url.href,
              method: "POST",
              headers: { "Content-Type": request.headers.get("Content-Type") || "application/json" },
              body,
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
        );
        if (self.registration && "sync" in self.registration) {
          try {
            await self.registration.sync.register("citis-form-sync");
          } catch {
            /* sync unsupported */
          }
        }
        return new Response(JSON.stringify({ success: true, message: "Saved offline; will sync later" }), {
          status: 202,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    return;
  }

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (["script", "style", "font"].includes(request.destination)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && ["style", "script", "font", "image"].includes(request.destination)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "FLUSH_FORMS") flushOfflineForms();
});
