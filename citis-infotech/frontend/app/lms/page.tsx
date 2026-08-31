import { generatePageMetadata } from "@/lib/seo";
import { redirectToLmsPortal, type LmsPortal } from "@/lib/lms-portal";

export const metadata = generatePageMetadata({
  title: "Learning Portal",
  path: "/lms",
  description: "Access the CITIS Skills Excellence Centre learning portal for learners, educators, and institution teams.",
  noIndex: true,
});

type LmsEntryPageProps = {
  searchParams?: Promise<{ portal?: string }>;
};

export default async function LmsEntryPage({ searchParams }: LmsEntryPageProps) {
  const params = await searchParams;
  const portal: LmsPortal = params?.portal === "institution" ? "institution" : "learner";
  await redirectToLmsPortal(portal);
}