import type { Metadata } from "next";

export const metadata: Metadata = { title: "CITIS Student Portal" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}