"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileImage, Grid3X3, List, MoreHorizontal, Search, Upload, X } from "lucide-react";
import { mediaItems } from "@/components/admin/mock-data";
import { Button } from "@/components/ui/button";

type MediaItem = (typeof mediaItems)[number];

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>(mediaItems);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const additions: MediaItem[] = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
      size: file.size > 1_000_000 ? `${(file.size / 1_000_000).toFixed(1)} MB` : `${Math.ceil(file.size / 1_000)} KB`,
      color: "from-blue-600 to-indigo-400",
    }));
    setItems((current) => [...additions, ...current]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-heading text-2xl font-semibold tracking-tight">Media Library</h1><p className="mt-1 text-sm text-muted-foreground">Upload and organize images and documents used across the site.</p></div>
        <Button size="sm" onClick={() => inputRef.current?.click()}><Upload /> Upload files</Button>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)} />

      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-6 grid min-h-44 place-items-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-[#0F4C81] bg-blue-50 dark:bg-blue-500/10" : "border-border bg-card hover:border-primary/50"}`}
      >
        <div>
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-blue-300"><Upload className="size-5" /></span>
          <p className="text-sm font-semibold">Drop files here, or <button className="text-[#0F4C81] hover:underline dark:text-blue-300" onClick={() => inputRef.current?.click()}>browse</button></p>
          <p className="mt-1 text-xs text-muted-foreground">SVG, PNG, JPG, GIF or PDF · Max 10 MB</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media…" className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm outline-none focus:border-primary" /></div>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">{filtered.length} files · 8.2 MB</span>
        <Button variant="outline" size="icon" className="size-9"><Grid3X3 /></Button>
        <Button variant="ghost" size="icon" className="size-9"><List /></Button>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className={`relative grid aspect-[16/10] place-items-center bg-gradient-to-br ${item.color}`}>
                <FileImage className="size-10 text-white/85" />
                <button onClick={() => setItems((current) => current.filter((media) => media.id !== item.id))} aria-label={`Remove ${item.name}`} className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg bg-slate-950/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"><X className="size-4" /></button>
              </div>
              <div className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{item.type} · {item.size}</p></div>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label={`Actions for ${item.name}`}><MoreHorizontal className="size-4" /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-card text-center"><div><FileImage className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="text-sm font-semibold">No files found</p><p className="mt-1 text-xs text-muted-foreground">Try another search or upload a new file.</p></div></div>
      )}
    </div>
  );
}
