import type { Metadata } from "next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = { title: "CITIS Teacher Portal" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body className={manrope.variable}>{children}</body></html>;
}