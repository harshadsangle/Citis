import { LegalContentPage } from "@/components/shared/LegalContentPage";
import { LEGAL_CONTENT } from "@/lib/legal-content";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Terms of Use",
  path: "/terms",
});

export default function TermsOfUsePage() {
  return <LegalContentPage content={LEGAL_CONTENT.terms} />;
}