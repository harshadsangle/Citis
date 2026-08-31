import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "CITIS Institution Portal", description: "CITIS institution administration foundation portal." };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}