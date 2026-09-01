import { generatePageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import { normalizeLmsPortal } from "@/lib/lms-roles";
import { normalizeLmsCourseProvider } from "@/lib/lms-catalog";

export const metadata = generatePageMetadata({
  title: "Learning Portal Sign In",
  path: "/lms/login",
  description: "Sign in to the CITIS Skills Excellence Centre learning portal.",
  noIndex: true,
});

type LmsLoginPageProps = {
  searchParams?: Promise<{ portal?: string; provider?: string }>;
};

export default async function LmsLoginPage({ searchParams }: LmsLoginPageProps) {
  const params = await searchParams;
  const portal = normalizeLmsPortal(params?.portal);
  if (!portal) redirect("/lms");
  const provider = normalizeLmsCourseProvider(params?.provider);
  redirect(`/auth/login?portal=${portal}${provider ? `&provider=${provider}` : ""}`);
}