"use client";

import { useEffect, useState } from "react";
import { cmsService } from "@/services/api";

type Section = {
  _id?: string;
  key: string;
  page: string;
  title: string;
  content: Record<string, unknown>;
  status: string;
};

/** Custom CMS editor — no Strapi or hosted CMS required. */
export default function AdminCmsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<Section | null>(null);
  const [json, setJson] = useState("{}");
  const [message, setMessage] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("citis-token") || sessionStorage.getItem("citis-token") || ""
      : "";

  const load = async () => {
    try {
      const res = await cmsService.list();
      setSections((res.data as Section[]) || []);
    } catch {
      setSections([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!selected) return;
    try {
      const content = JSON.parse(json);
      await cmsService.save(
        selected.key,
        {
          page: selected.page,
          title: selected.title,
          content,
          status: selected.status,
        },
        token,
      );
      setMessage("Section saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    }
  };

  const createSection = async () => {
    const key = window.prompt("Section key (e.g. home.hero)");
    if (!key) return;
    const page = window.prompt("Page (home|about|products|footer|global)", "home") || "home";
    const title = window.prompt("Title", key) || key;
    try {
      await cmsService.save(
        key,
        {
          page,
          title,
          content: { headline: "", body: "" },
          status: "draft",
        },
        token,
      );
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Custom CMS</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Edit site sections</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Publish homepage, about, product, and footer content without changing source code.
          </p>
        </div>
        <button type="button" onClick={createSection} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          New section
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                setSelected(section);
                setJson(JSON.stringify(section.content || {}, null, 2));
                setMessage("");
              }}
              className={`w-full rounded-xl border px-4 py-3 text-left ${
                selected?.key === section.key ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="font-semibold">{section.title}</div>
              <div className="text-xs text-muted-foreground">
                {section.key} · {section.page} · {section.status}
              </div>
            </button>
          ))}
          {!sections.length ? (
            <p className="text-sm text-muted-foreground">No CMS sections yet. Create one to begin.</p>
          ) : null}
        </div>

        {selected ? (
          <div className="surface space-y-4 rounded-2xl p-5">
            <label className="block text-sm">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                value={selected.title}
                onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Status
              <select
                className="mt-1 w-full rounded-lg border border-border px-3 py-2"
                value={selected.status}
                onChange={(e) => setSelected({ ...selected, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block text-sm">
              Content JSON
              <textarea
                className="mt-1 min-h-64 w-full rounded-lg border border-border px-3 py-2 font-mono text-xs"
                value={json}
                onChange={(e) => setJson(e.target.value)}
              />
            </label>
            <button type="button" onClick={save} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Save section
            </button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        ) : (
          <div className="surface rounded-2xl p-8 text-sm text-muted-foreground">
            Select a section to edit its structured content.
          </div>
        )}
      </div>
    </div>
  );
}
