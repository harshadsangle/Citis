import { LegalContentPage } from "@/components/shared/LegalContentPage";
import { LEGAL_CONTENT } from "@/lib/legal-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Privacy Policy",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return <LegalContentPage content={LEGAL_CONTENT.privacy} />;
}