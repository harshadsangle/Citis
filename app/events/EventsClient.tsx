"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { apiFetch } from "@/lib/api";

type EventItem = {
  _id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registeredCount: number;
  schedule?: Array<{ time: string; title: string; speaker?: string }>;
};

function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        ["Days", days],
        ["Hrs", hours],
        ["Min", mins],
        ["Sec", secs],
      ].map(([label, value]) => (
        <div key={String(label)} className="rounded-lg bg-muted px-2 py-2">
          <div className="font-heading text-lg font-semibold">{value}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function EventsClient() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch<{ data: EventItem[] }>("/events?limit=20&sort=startsAt", { revalidate: false })
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]));
  }, []);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      await apiFetch(`/events/${selected._id}/register`, {
        method: "POST",
        body: JSON.stringify(form),
        revalidate: false,
      });
      setMessage("Registration received. Check your inbox for confirmation details.");
      setForm({ name: "", email: "", phone: "", organization: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Learn with CITIS in workshops and conferences"
        description="Register for upcoming sessions. Capacity and waitlists are managed in MongoDB."
        breadcrumbs={[{ label: "Events" }]}
      />
      <section className="container-site grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] sm:py-20">
        <div className="space-y-5">
          {items.map((item, index) => (
            <AnimatedSection key={item._id} delay={index * 0.05}>
              <button
                type="button"
                onClick={() => {
                  setSelected(item);
                  setMessage("");
                }}
                className="surface w-full rounded-2xl p-6 text-left transition hover:border-primary/40"
              >
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">{item.type}</p>
                <h2 className="mt-2 font-heading text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {new Date(item.startsAt).toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {item.location}
                  </span>
                  <span>
                    {item.registeredCount}/{item.capacity} seats
                  </span>
                </div>
              </button>
            </AnimatedSection>
          ))}
          {!items.length ? (
            <p className="text-sm text-muted-foreground">No published events yet.</p>
          ) : null}
        </div>

        <div className="surface sticky top-24 h-fit rounded-2xl p-6">
          {selected ? (
            <>
              <h3 className="font-heading text-xl font-semibold">{selected.title}</h3>
              <div className="mt-4">
                <Countdown target={selected.startsAt} />
              </div>
              {selected.schedule?.length ? (
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Schedule</p>
                  {selected.schedule.map((slot) => (
                    <div key={`${slot.time}-${slot.title}`} className="rounded-lg bg-muted/70 px-3 py-2 text-sm">
                      <span className="font-semibold text-primary">{slot.time}</span> · {slot.title}
                      {slot.speaker ? ` — ${slot.speaker}` : ""}
                    </div>
                  ))}
                </div>
              ) : null}
              <form onSubmit={register} className="mt-6 space-y-3">
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white">
                  Register
                </button>
              </form>
              {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select an event to view the countdown, schedule, and registration form.</p>
          )}
        </div>
      </section>
    </>
  );
}
