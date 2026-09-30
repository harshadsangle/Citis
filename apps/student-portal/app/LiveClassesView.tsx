"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LiveClassProvider = "ZOOM" | "GOOGLE_MEET" | "MICROSOFT_TEAMS" | "WEBEX";
type LiveClassStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED" | "ARCHIVED";

type LiveClass = {
  id: string;
  course_id: string;
  course_title?: string;
  title: string;
  description?: string | null;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  provider: LiveClassProvider;
  meeting_url: string;
  recording_url?: string | null;
  status: LiveClassStatus;
};

const PROVIDER_LABEL: Record<string, string> = {
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  MICROSOFT_TEAMS: "Microsoft Teams",
  WEBEX: "Webex",
};

function providerLabel(value: string) {
  return PROVIDER_LABEL[value] || value;
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  const parsed = Number(hour);
  if (!Number.isFinite(parsed)) return value;
  const suffix = parsed >= 12 ? "PM" : "AM";
  const display = parsed % 12 === 0 ? 12 : parsed % 12;
  return `${display}:${minute} ${suffix}`;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/**
 * Read-only view of the live classes a learner can attend. The API already
 * narrows the list to the caller's active enrolments, so this only renders
 * what the server returned and never widens scope.
 */
export default function LiveClassesView() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/live-classes?scope=upcoming&page=1&pageSize=100", {
        credentials: "include",
        cache: "no-store",
      });
      const body = await response.json().catch(() => null) as { data?: LiveClass[]; message?: string; error?: { message?: string } } | null;
      if (!response.ok) {
        throw new Error(body?.error?.message || body?.message || "We couldn't load your live classes.");
      }
      setClasses(Array.isArray(body?.data) ? body.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "We couldn't load your live classes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = useMemo(() => classes.filter((item) => item.status === "SCHEDULED"), [classes]);
  const past = useMemo(() => classes.filter((item) => item.status !== "SCHEDULED"), [classes]);

  return (
    <section className="certificates-section live-classes-section" id="live-classes" aria-labelledby="live-classes-title">
      <div className="portal-section-heading">
        <div>
          <span className="portal-eyebrow">Live classes</span>
          <h2 id="live-classes-title">Upcoming live classes</h2>
        </div>
        <p className="section-heading-note">Sessions scheduled for the courses you are enrolled in.</p>
      </div>

      {error && <div className="assessment-empty-state"><strong>Live classes unavailable</strong><p>{error}</p></div>}
      {!error && loading && <div className="assessment-empty-state"><strong>Loading live classes…</strong><p>Checking the schedule for your courses.</p></div>}
      {!error && !loading && upcoming.length === 0 && (
        <div className="certificates-empty">
          <strong>No upcoming live classes</strong>
          <p>When your course team schedules a live session, it will appear here with the joining link.</p>
        </div>
      )}

      {!error && !loading && upcoming.length > 0 && (
        <div className="certificate-list">
          {upcoming.map((item) => (
            <article className="certificate-card" key={item.id}>
              <div className="certificate-card-mark" aria-hidden="true">◉</div>
              <div className="certificate-card-copy">
                <span className="certificate-kicker">{providerLabel(item.provider)} · {item.duration_minutes} min</span>
                <h3>{item.title}</h3>
                <p className="enrolled-course-date">
                  {formatDate(item.scheduled_date)} · {formatTime(item.start_time)}
                  {item.course_title ? ` · ${item.course_title}` : ""}
                </p>
                {item.description && <p className="assignment-context">{item.description}</p>}
              </div>
              <a className="certificate-download-button" href={item.meeting_url} target="_blank" rel="noreferrer">Join class</a>
            </article>
          ))}
        </div>
      )}

      {!error && !loading && past.length > 0 && (
        <>
          <div className="portal-section-heading">
            <div><h2>Earlier sessions</h2></div>
          </div>
          <div className="certificate-list">
            {past.map((item) => (
              <article className="certificate-card" key={item.id}>
                <div className="certificate-card-mark" aria-hidden="true">◉</div>
                <div className="certificate-card-copy">
                  <span className="certificate-kicker">{statusLabel(item.status)} · {providerLabel(item.provider)}</span>
                  <h3>{item.title}</h3>
                  <p className="enrolled-course-date">
                    {formatDate(item.scheduled_date)} · {formatTime(item.start_time)}
                    {item.course_title ? ` · ${item.course_title}` : ""}
                  </p>
                </div>
                {item.recording_url && <a className="certificate-download-button" href={item.recording_url} target="_blank" rel="noreferrer">Recording</a>}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
