"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { apiFetch } from "@/lib/api";

type Member = {
  _id: string;
  name: string;
  title: string;
  type: string;
  bio: string;
  photoUrl?: string;
  expertise: string[];
  experienceYears: number;
  skills: string[];
};

export function FacultyClient() {
  const [items, setItems] = useState<Member[]>([]);
  const [type, setType] = useState("all");

  useEffect(() => {
    apiFetch<{ data: Member[] }>("/faculty?limit=50", { revalidate: false })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, []);

  const filtered = items.filter((item) => type === "all" || item.type === type);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Faculty and industry experts behind the programmes"
        description="Profiles managed in the CITIS admin CMS and stored in MongoDB."
        breadcrumbs={[{ label: "Faculty" }]}
      />
      <section className="container-site py-14 sm:py-20">
        <div className="flex gap-2">
          {[
            ["all", "All"],
            ["faculty", "Faculty"],
            ["industry-expert", "Industry experts"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                type === value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member, index) => (
            <AnimatedSection key={member._id} delay={index * 0.05}>
              <article className="surface h-full rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  {member.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-full bg-primary/10 font-heading text-lg font-bold text-primary">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{member.name}</h2>
                    <p className="text-sm text-muted-foreground">{member.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{member.bio}</p>
                <p className="mt-4 text-xs font-semibold text-primary">
                  {member.experienceYears}+ years experience
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...(member.expertise || []), ...(member.skills || [])].slice(0, 6).map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
        {!filtered.length ? (
          <p className="mt-10 text-sm text-muted-foreground">No published profiles yet.</p>
        ) : null}
      </section>
    </>
  );
}
