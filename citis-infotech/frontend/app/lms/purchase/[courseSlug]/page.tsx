import { notFound } from "next/navigation";
import { redirectToLmsPortal } from "@/lib/lms-portal";
import { LMS_COURSE_CATEGORIES, normalizeLmsCourseProvider } from "@/lib/lms-catalog";

type CoursePurchaseRedirectProps = {
  params: Promise<{ courseSlug: string }>;
  searchParams?: Promise<{ provider?: string | string[] }>;
};

export default async function CoursePurchaseRedirectPage({ params, searchParams }: CoursePurchaseRedirectProps) {
  const [{ courseSlug }, query] = await Promise.all([params, searchParams]);
  const course = LMS_COURSE_CATEGORIES
    .flatMap((category) => category.courses)
    .find((candidate) => candidate.id === courseSlug);
  if (!course) notFound();

  const providerValue = Array.isArray(query?.provider) ? query.provider[0] : query?.provider;
  const provider = normalizeLmsCourseProvider(providerValue);
  const purchaseQuery = new URLSearchParams({
    courseSlug: course.id,
    courseTitle: course.title,
  });
  await redirectToLmsPortal("learner", provider, `/purchase?${purchaseQuery.toString()}`);
}