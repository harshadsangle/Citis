"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, Search, X } from "lucide-react";
import { searchService } from "@/services/api";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  href: string;
  highlightTitle: string;
  highlightExcerpt: string;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "products", label: "Products" },
  { id: "blogs", label: "Blogs" },
  { id: "careers", label: "Careers" },
  { id: "case-studies", label: "Case Studies" },
  { id: "university", label: "University" },
  { id: "school", label: "School" },
] as const;

const HISTORY_KEY = "citis_search_history";

function loadHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const next = [query, ...loadHistory().filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 8);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Hit[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      try {
        const response = await searchService.suggestions(query);
        setSuggestions(response.data.suggestions);
        if (!query) setHistory(response.data.recent?.length ? response.data.recent : loadHistory());
      } catch {
        /* offline / API down — keep local history */
      }
    }, 180);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchService.search(query.trim(), { type, limit: 10 });
        setResults(response.data.results);
        setActive(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(handle);
  }, [query, type, open]);

  const options = useMemo(() => {
    if (query.trim().length < 2) {
      return [
        ...history.map((item) => ({ id: `h-${item}`, title: item, href: `/search?q=${encodeURIComponent(item)}`, kind: "history" as const })),
        ...suggestions.map((item) => ({ id: `s-${item}`, title: item, href: `/search?q=${encodeURIComponent(item)}`, kind: "suggestion" as const })),
      ];
    }
    return results.map((item) => ({ ...item, kind: "result" as const }));
  }, [history, suggestions, results, query]);

  const go = useCallback(
    (href: string, label?: string) => {
      if (label) {
        saveHistory(label);
        setHistory(loadHistory());
      }
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = options[active];
      if (selected && "href" in selected) {
        go(selected.href, "title" in selected ? selected.title : query);
      } else if (query.trim()) {
        go(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`, query.trim());
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 10);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        aria-label="Open global search"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Global search"
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="size-5 text-primary" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search products, blogs, careers, case studies…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  role="combobox"
                  aria-expanded
                />
                <button type="button" className="rounded-md p-1.5 hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close search">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setType(filter.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      type === filter.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div id={listId} role="listbox" className="max-h-[22rem] overflow-y-auto p-2">
                {loading ? <p className="px-3 py-6 text-sm text-muted-foreground">Searching…</p> : null}
                {!loading && options.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-muted-foreground">
                    {query.trim().length < 2 ? "Type at least 2 characters, or pick a recent search." : "No matches found."}
                  </p>
                ) : null}
                {!loading &&
                  options.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active === index}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                        active === index ? "bg-primary/10" : "hover:bg-muted/70",
                      )}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item.href, item.title)}
                    >
                      {"kind" in item && item.kind === "history" ? (
                        <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
                      ) : (
                        <ArrowUpRight className="mt-0.5 size-4 text-primary" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span
                          className="block text-sm font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: "highlightTitle" in item ? item.highlightTitle : item.title,
                          }}
                        />
                        {"highlightExcerpt" in item || "excerpt" in item ? (
                          <span
                            className="mt-1 block line-clamp-2 text-xs text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html: "highlightExcerpt" in item ? item.highlightExcerpt : "",
                            }}
                          />
                        ) : null}
                        {"type" in item ? (
                          <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {item.type}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                <span>↑↓ navigate · Enter open · Esc close</span>
                <Link href={`/search?q=${encodeURIComponent(query || "")}&type=${type}`} className="font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
                  View all results
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
