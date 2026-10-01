"use client";

import { useRouter } from "next/navigation";

/**
 * Returns to the actual previous entry in browser history rather than a
 * hardcoded route. A direct link with empty history is a no-op, so the user
 * is never bounced somewhere they did not come from.
 */
export function LmsBackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={`learning-back-button ${className}`.trim()}>
      &larr; Back
    </button>
  );
}
