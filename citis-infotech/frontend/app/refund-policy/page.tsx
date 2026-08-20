import { LegalContentPage } from "@/components/shared/LegalContentPage";
import { LEGAL_CONTENT } from "@/lib/legal-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Refund Policy",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return <LegalContentPage content={LEGAL_CONTENT.refund} />;
}