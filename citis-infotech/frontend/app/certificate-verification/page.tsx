import { CertificateVerificationClient } from "./CertificateVerificationClient";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Verify a Certificate",
  path: "/certificate-verification",
  description: "Verify a CITIS InfoTech learning certificate using its certificate number or verification ID.",
});

export default function CertificateVerificationPage() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,#f7fbff_0%,#edf5ff_55%,#fff8e8_100%)] dark:bg-[linear-gradient(145deg,#071526_0%,#10233e_60%,#241b0d_100%)]" />
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">CITIS credentials</p>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">Verify a certificate</h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">Confirm the authenticity of a CITIS InfoTech learning certificate with the certificate number printed on the document.</p>
        </div>
        <CertificateVerificationClient />
      </div>
    </section>
  );
}