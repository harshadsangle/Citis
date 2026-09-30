"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Returns to the actual previous entry in browser history. Deliberately uses
 * router.back() rather than a hardcoded LMS route so the user lands where they
 * came from, and so a direct link (empty history) stays put instead of
 * redirecting somewhere unexpected.
 */
export function LmsBackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-primary ${className}`.trim()}
    >
      <ArrowLeft className="size-4" />
      Back
    </button>
  );
}
