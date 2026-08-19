"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <AnimatePresence>
      {!online && (
        <motion.div initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }} role="status" className="fixed inset-x-0 top-0 z-[110] flex h-9 items-center justify-center gap-2 bg-slate-900 px-4 text-center text-xs font-medium text-white">
          <WifiOff className="size-3.5 text-orange-400" />You’re offline. Some content may be unavailable.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
