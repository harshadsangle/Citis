export function getStrapiMedia(media?: { url?: string; alternativeText?: string | null } | string | null) {
  if (!media) return "";
  if (typeof media === "string") {
    if (media.startsWith("http") || media.startsWith("/")) return media;
    return media;
  }
  if (!media.url) return "";
  if (media.url.startsWith("http") || media.url.startsWith("/")) return media.url;
  const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");
  return `${api}${media.url}`;
}

/** Legacy Strapi helpers retained as no-ops / Express-backed stubs. */
export const blogService = {
  getAll: async () => ({ data: [] }),
  getBySlug: async () => ({ data: null }),
};

export const productService = {
  getAll: async () => ({ data: [] }),
};

export const caseStudyService = {
  getAll: async () => ({ data: [] }),
};

export const testimonialService = {
  getAll: async () => ({ data: [] }),
};

export const clientService = {
  getAll: async () => ({ data: [] }),
};
