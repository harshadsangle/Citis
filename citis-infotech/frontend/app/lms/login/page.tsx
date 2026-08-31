import { generatePageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata = generatePageMetadata({
  title: "Learning Portal Sign In",
  path: "/lms/login",
  description: "Sign in to the CITIS Skills Excellence Centre learning portal.",
  noIndex: true,
});

type LmsLoginPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function LmsLoginPage({ searchParams }: LmsLoginPageProps) {
  const params = await searchParams;
  const portal = params?.portal === "institution" ? "institution" : "learner";
  redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/lms?portal=${portal}`)}`);
}