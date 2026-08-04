import { SuccessStoriesClient } from "./SuccessStoriesClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Student Success Stories",
  path: "/success-stories",
  description: "Placement journeys, learner stories, and company outcomes from CITIS programmes.",
});

export default function SuccessStoriesPage() {
  return <SuccessStoriesClient />;
}
