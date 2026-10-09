"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./StudentLoginActivityCalendar.module.css";

type StudentLoginActivity = {
  month: string;
  timeZone: string;
  timeZoneSource: "campus" | "platform-default";
  today: string;
  student: {
    firstName: string;
    lastName: string;
    studentType: "COLLEGE_STUDENT" | "DIRECT_STUDENT";
  };
  days: Array<{
    date: string;
    sessions: string[];
  }>;
  summary: {
    daysLoggedIn: number;
    totalSuccessfulSessions: number;
    lastLoginAt: string | null;
  };
};

type StudentLoginActivityCalendarProps = {
  apiBase: string;
  studentId?: string;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthFromDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const next = new Date(year, monthNumber - 1 + offset, 1);
  return monthFromDate(next);
}

function monthDate(month: string): Date {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1);
}

function formatCalendarDate(date: string, locale = "en"): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatTimestamp(timestamp: string | null, timeZone: string): string {
  if (!timestamp) return "No successful sign-in recorded";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

function formatTime(timestamp: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
}

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(monthDate(month));
}

function responseErrorMessage(body: unknown): string {
  if (body && typeof body === "object") {
    const record = body as { message?: unknown; error?: { message?: unknown } };
    if (typeof record.error?.message === "string") return record.error.message;
    if (typeof record.message === "string") return record.message;
  }
  return "Please try again. If the problem continues, contact your portal administrator.";
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
      <path d="m3.2 8.2 3.1 3.1 6.5-6.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading sign-in history">
      <div className={styles.skeletonTop}>
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.short}`} />
      </div>
      <div className={styles.skeletonSummary} />
      <div className={styles.skeletonGrid} aria-hidden="true">
        {Array.from({ length: 35 }, (_, index) => <span className={styles.skeletonCell} key={index} />)}
      </div>
    </div>
  );
}

export default function StudentLoginActivityCalendar({
  apiBase,
  studentId,
}: StudentLoginActivityCalendarProps) {
  const [activity, setActivity] = useState<StudentLoginActivity | null>(null);
  const [requestedMonth, setRequestedMonth] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const endpoint = useMemo(() => {
    const base = apiBase.replace(/\/+$/, "");
    return studentId === undefined
      ? `${base}/users/me/login-activity`
      : `${base}/users/${encodeURIComponent(studentId)}/login-activity`;
  }, [apiBase, studentId]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadActivity() {
      setLoading(true);
      setError("");
      const url = requestedMonth
        ? `${endpoint}?month=${encodeURIComponent(requestedMonth)}`
        : endpoint;
      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(responseErrorMessage(body));
        }
        const payload = body && typeof body === "object" && "data" in body
          ? (body as { data?: unknown }).data
          : body;
        if (!payload || typeof payload !== "object" || !("month" in payload)) {
          throw new Error("The sign-in history response was incomplete. Please try again.");
        }
        if (active) {
          setActivity(payload as StudentLoginActivity);
          setSelectedDate(null);
        }
      } catch (loadError) {
        if (active && !(loadError instanceof DOMException && loadError.name === "AbortError")) {
          setError(loadError instanceof Error
            ? loadError.message
            : "We couldn’t load this student’s sign-in history.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadActivity();
    return () => {
      active = false;
      controller.abort();
    };
  }, [endpoint, requestedMonth, retryCount]);

  const daysByDate = useMemo(
    () => new Map((activity?.days ?? []).map((day) => [day.date, day.sessions])),
    [activity],
  );
  const visibleMonth = activity?.month ?? requestedMonth;
  const visibleDate = selectedDate && selectedDate.startsWith(`${visibleMonth}-`)
    ? selectedDate
    : activity?.today.startsWith(`${visibleMonth}-`) ? activity.today : null;
  const selectedSessions = visibleDate ? daysByDate.get(visibleDate) ?? [] : [];
  const studentName = activity
    ? `${activity.student.firstName} ${activity.student.lastName}`.trim()
    : "";

  const calendarDates = useMemo(() => {
    if (!visibleMonth) return { leading: 0, days: [] as string[] };
    const first = monthDate(visibleMonth);
    const [year, monthNumber] = visibleMonth.split("-").map(Number);
    const totalDays = new Date(year, monthNumber, 0).getDate();
    return {
      leading: first.getDay(),
      days: Array.from({ length: totalDays }, (_, index) =>
        `${visibleMonth}-${String(index + 1).padStart(2, "0")}`),
    };
  }, [visibleMonth]);

  function changeMonth(offset: number) {
    if (!visibleMonth || loading) return;
    setSelectedDate(null);
    setRequestedMonth(shiftMonth(visibleMonth, offset));
  }

  function retry() {
    setRetryCount((count) => count + 1);
  }

  return (
    <section className={styles.calendar} aria-labelledby="login-activity-title">
      <div className={styles.panel}>
        {activity && (
          <>
            <header className={styles.heading}>
              <div className={styles.headingCopy}>
                <p className={styles.eyebrow}>Account security</p>
                <h2 className={styles.title} id="login-activity-title">Successful sign-ins</h2>
                {studentName && (
                  <div className={styles.studentLine}>
                    <span>{studentName}</span>
                    <span className={styles.studentType}>
                      {activity.student.studentType === "COLLEGE_STUDENT" ? "College student" : "Direct student"}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.zone}>
                <strong>Times shown in</strong>
                {activity.timeZoneSource === "platform-default"
                  ? `Platform default · ${activity.timeZone}`
                  : `Campus time zone · ${activity.timeZone}`}
              </div>
            </header>

            {!error && (
              <div className={styles.summary} aria-label={`Summary for ${monthLabel(activity.month)}`}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Days with sign-ins</span>
                  <strong className={styles.summaryValue}>{activity.summary.daysLoggedIn}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Successful sessions</span>
                  <strong className={styles.summaryValue}>{activity.summary.totalSuccessfulSessions}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Latest sign-in</span>
                  <strong className={`${styles.summaryValue} ${styles.compact}`}>
                    {formatTimestamp(activity.summary.lastLoginAt, activity.timeZone)}
                  </strong>
                </div>
              </div>
            )}

            {error ? (
              <div className={styles.errorState} role="alert">
                <strong>Sign-in history is temporarily unavailable</strong>
                <p>{error}</p>
                <button className={styles.retryButton} type="button" onClick={retry}>
                  Retry
                </button>
              </div>
            ) : loading ? (
              <LoadingSkeleton />
            ) : (
              <div className={styles.calendarLayout}>
                <div className={styles.calendarColumn}>
                  <div className={styles.monthBar}>
                    <h3 className={styles.monthTitle}>{monthLabel(activity.month)}</h3>
                    <div className={styles.monthControls} aria-label="Change month">
                      <button
                        className={styles.monthButton}
                        type="button"
                        onClick={() => changeMonth(-1)}
                        disabled={loading}
                        aria-label="Previous month"
                      >
                        <span className={`${styles.arrow} ${styles.arrowPrevious}`} aria-hidden="true" />
                      </button>
                      <button
                        className={styles.monthButton}
                        type="button"
                        onClick={() => changeMonth(1)}
                        disabled={loading}
                        aria-label="Next month"
                      >
                        <span className={`${styles.arrow} ${styles.arrowNext}`} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className={styles.weekdays} aria-hidden="true">
                    {weekdays.map((weekday) => (
                      <span className={styles.weekday} key={weekday}>{weekday}</span>
                    ))}
                  </div>
                  <div
                    className={styles.dateGrid}
                    role="group"
                    aria-label={`${monthLabel(activity.month)} calendar`}
                  >
                    {Array.from({ length: calendarDates.leading }, (_, index) => (
                      <span className={styles.dayCell} aria-hidden="true" key={`blank-${index}`} />
                    ))}
                    {calendarDates.days.map((date) => {
                      const sessions = daysByDate.get(date) ?? [];
                      const hasSessions = sessions.length > 0;
                      const isToday = date === activity.today;
                      const isSelected = date === visibleDate;
                      const labels = [
                        formatCalendarDate(date),
                        `${sessions.length} successful ${sessions.length === 1 ? "sign-in" : "sign-ins"}`,
                        isToday ? "today" : "",
                      ].filter(Boolean).join(", ");
                      return (
                        <span className={styles.dayCell} key={date}>
                          <button
                            className={[
                              styles.dayButton,
                              hasSessions ? styles.hasSessions : "",
                              isToday ? styles.today : "",
                              isSelected ? styles.selected : "",
                            ].filter(Boolean).join(" ")}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            aria-label={labels}
                            aria-pressed={isSelected}
                            aria-current={isToday ? "date" : undefined}
                          >
                            <span className={styles.dayNumber}>{Number(date.slice(-2))}</span>
                            {hasSessions && <span className={styles.dayCheck}><CheckMark /></span>}
                            {isToday && <span className={styles.todayLabel}>Today</span>}
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  <div className={styles.calendarFooter}>
                    <span className={styles.legendItem}>
                      <span className={styles.legendCheck}><CheckMark /></span>
                      Successful sign-in
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendToday} />
                      Today
                    </span>
                    <span className={styles.neutralNote}>
                      Unmarked dates do not indicate an attendance status.
                    </span>
                  </div>
                </div>

                <aside
                  className={styles.dayPanel}
                  aria-label="Selected date sign-in details"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {visibleDate ? (
                    <>
                      <p className={styles.dayPanelEyebrow}>Selected date</p>
                      <h3 className={styles.dayPanelTitle}>{formatCalendarDate(visibleDate)}</h3>
                      <div className={styles.dayCount}>
                        <strong>{selectedSessions.length}</strong>
                        <span>{selectedSessions.length === 1 ? "successful sign-in" : "successful sign-ins"}</span>
                      </div>
                      {selectedSessions.length > 0 ? (
                        <>
                          <p className={styles.timesHeading}>Login times</p>
                          <ol className={styles.timeList}>
                            {selectedSessions.map((session, index) => (
                              <li className={styles.timeItem} key={`${session}-${index}`}>
                                <span className={styles.timeMark} aria-hidden="true" />
                                <span>{formatTime(session, activity.timeZone)}</span>
                              </li>
                            ))}
                          </ol>
                        </>
                      ) : (
                        <p className={styles.noTimes}>
                          No successful sign-ins are recorded for this date. This is login history only, not an attendance status.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className={styles.dayPanelEyebrow}>Daily details</p>
                      <h3 className={styles.dayPanelTitle}>Choose a date</h3>
                      <p className={styles.noTimes}>Select any date to review its successful sign-in count and login times.</p>
                    </>
                  )}

                  {activity.summary.totalSuccessfulSessions === 0 && (
                    <div className={styles.emptyMonth} role="status">
                      <span className={styles.emptyMark} aria-hidden="true">i</span>
                      <span>No successful sign-ins recorded for {monthLabel(activity.month)}.</span>
                    </div>
                  )}
                </aside>
              </div>
            )}
          </>
        )}
        {!activity && loading && <LoadingSkeleton />}
        {!activity && error && (
          <div className={styles.errorState} role="alert">
            <strong>Sign-in history is temporarily unavailable</strong>
            <p>{error}</p>
            <button className={styles.retryButton} type="button" onClick={retry}>Retry</button>
          </div>
        )}
      </div>
      <span className={styles.busyLabel} role="status" aria-live="polite">
        {loading && activity ? `Loading ${monthLabel(requestedMonth ?? activity.month)} sign-in history` : ""}
      </span>
    </section>
  );
}
