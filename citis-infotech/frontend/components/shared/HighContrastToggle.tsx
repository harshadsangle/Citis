"use client";

import { useEffect, useState } from "react";
import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";

/** WCAG-friendly high-contrast mode using a document class (no external a11y SaaS). */
export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("citis_high_contrast") === "1";
    setEnabled(stored);
    document.documentElement.classList.toggle("high-contrast", stored);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.classList.toggle("high-contrast", next);
    window.localStorage.setItem("citis_high_contrast", next ? "1" : "0");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-pressed={enabled}
      aria-label={enabled ? "Disable high contrast" : "Enable high contrast"}
      onClick={toggle}
    >
      <Contrast />
    </Button>
  );
}
