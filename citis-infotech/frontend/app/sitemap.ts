import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { BLOG_POSTS, CASE_STUDIES, JOBS } from "@/lib/site-content";

const routes = [
  "", "/about", "/engagements", "/engagements/university", "/engagements/school",
  "/engagements/vocational", "/engagements/centre-of-excellence", "/engagements/placements",
  "/products", "/products/ai-future-academy", "/products/appwizz-academy", "/products/moxiemind",
  "/partner", "/highlights", "/highlights/blogs", "/highlights/case-studies",
  "/careers", "/future-academy", "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...routes.map((route) => ({
      url: `${SITE_CONFIG.url}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.7,
    })),
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_CONFIG.url}/highlights/blogs/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.65,
    })),
    ...CASE_STUDIES.map((study) => ({
      url: `${SITE_CONFIG.url}/highlights/case-studies/${study.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.65,
    })),
    ...JOBS.map((job) => ({
      url: `${SITE_CONFIG.url}/careers/${job.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
