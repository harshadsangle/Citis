"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFloat } from "@/components/shared/WhatsAppFloat";

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname === "/login";

  if (isStandalone) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
