import { ResourcesClient } from "./ResourcesClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Resource Center",
  path: "/resources",
  description: "Download CITIS brochures, company profiles, whitepapers, and programme PDFs.",
});

export default function ResourcesPage() {
  return <ResourcesClient />;
}
