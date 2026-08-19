import { FacultyClient } from "./FacultyClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Faculty & Industry Experts",
  path: "/faculty",
  description: "Meet CITIS faculty mentors and industry experts guiding learner outcomes.",
});

export default function FacultyPage() {
  return <FacultyClient />;
}
