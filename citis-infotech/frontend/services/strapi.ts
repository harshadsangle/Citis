import { strapiFetch } from "@/lib/api";
import type {
  Blog,
  CaseStudy,
  Client,
  Product,
  StrapiImage,
  StrapiResponse,
  Testimonial,
} from "@/types";

type QueryValue = string | number | boolean | undefined;

function queryString(values: Record<string, QueryValue>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return params.toString();
}

export function getStrapiMedia(media?: StrapiImage | null) {
  if (!media?.url) return "";
  if (media.url.startsWith("http")) return media.url;
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337/api").replace(/\/api\/?$/, "");
  return `${base}${media.url}`;
}

export const blogService = {
  getAll: ({ page = 1, pageSize = 9, category }: { page?: number; pageSize?: number; category?: string } = {}) =>
    strapiFetch<StrapiResponse<Blog[]>>(
      `/blogs?${queryString({
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "filters[category][slug][$eq]": category,
        sort: "publishedAt:desc",
        populate: "*",
      })}`,
      { tags: ["blogs"] },
    ),
  getBySlug: (slug: string) =>
    strapiFetch<StrapiResponse<Blog[]>>(
      `/blogs?${queryString({ "filters[slug][$eq]": slug, populate: "*" })}`,
      { tags: ["blogs", `blog-${slug}`] },
    ).then((response) => response.data[0] ?? null),
};

export const productService = {
  getAll: () =>
    strapiFetch<StrapiResponse<Product[]>>("/products?populate=*&sort=title:asc", {
      tags: ["products"],
    }),
  getBySlug: (slug: string) =>
    strapiFetch<StrapiResponse<Product[]>>(
      `/products?${queryString({ "filters[slug][$eq]": slug, "populate[features]": "*", "populate[heroImage]": "*" })}`,
      { tags: ["products", `product-${slug}`] },
    ).then((response) => response.data[0] ?? null),
};

export const caseStudyService = {
  getAll: () =>
    strapiFetch<StrapiResponse<CaseStudy[]>>("/case-studies?populate=*&sort=publishedAt:desc", {
      tags: ["case-studies"],
    }),
  getBySlug: (slug: string) =>
    strapiFetch<StrapiResponse<CaseStudy[]>>(
      `/case-studies?${queryString({ "filters[slug][$eq]": slug, populate: "*" })}`,
      { tags: ["case-studies", `case-study-${slug}`] },
    ).then((response) => response.data[0] ?? null),
};

export const getTestimonials = () =>
  strapiFetch<StrapiResponse<Testimonial[]>>("/testimonials?populate=*&sort=createdAt:desc", {
    tags: ["testimonials"],
    revalidate: 900,
  });

export const getClients = () =>
  strapiFetch<StrapiResponse<Client[]>>("/clients?populate=logo&sort=name:asc", {
    tags: ["clients"],
    revalidate: 900,
  });
