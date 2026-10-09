import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { isLmsAdministrator, isPlatformUser } from "../../common/access-scope";
import type { AuthenticatedUser } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";

const PLATFORM_DEFAULT_TIME_ZONE = "Asia/Kolkata";

type StudentProfileRow = {
  user_id: string;
  tenant_id: string;
  student_type: "COLLEGE_STUDENT" | "DIRECT_STUDENT";
  institution_id: string | null;
  first_name: string;
  last_name: string;
  campus_time_zone: string | null;
};

type LoginSessionRow = { created_at: Date | string };

function roleCodes(user: AuthenticatedUser) {
  return new Set(user.roles.map((role) => role.code));
}

export function dateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

function validateMonth(month: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match || Number(match[1]) < 1900) {
    throw new BadRequestException("Month must be a valid YYYY-MM value from 1900 onward.");
  }
  return { year: Number(match[1]), monthNumber: Number(match[2]) };
}

function toIsoTimestamp(value: Date | string | null | undefined) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

@Injectable()
export class StudentLoginActivityService {
  constructor(private readonly db: DatabaseService) {}

  async getActivity(actor: AuthenticatedUser, studentUserId: string, requestedMonth?: string) {
    if (requestedMonth !== undefined) validateMonth(requestedMonth);

    const profileResult = await this.db.query<StudentProfileRow>(
      `SELECT sp.user_id, sp.tenant_id, sp.student_type, sp.institution_id,
              u.first_name, u.last_name,
              (
                SELECT CASE WHEN count(DISTINCT c.timezone) = 1 THEN min(c.timezone) ELSE NULL END
                FROM campuses c
                WHERE c.tenant_id = sp.tenant_id
                  AND c.institution_id = sp.institution_id
                  AND c.status = 'ACTIVE'
              ) AS campus_time_zone
       FROM lms_student_profiles sp
       JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
       WHERE sp.user_id = $1
         AND ($2::uuid IS NULL OR sp.tenant_id = $2)
       LIMIT 1`,
      [studentUserId, isPlatformUser(actor) ? null : actor.tenantId],
    );
    const profile = profileResult.rows[0];
    if (!profile) throw new NotFoundException("The requested resource was not found.");

    await this.assertCanReadStudent(actor, profile);

    const candidateTimeZone = profile.campus_time_zone;
    const timeZone = candidateTimeZone && isValidTimeZone(candidateTimeZone)
      ? candidateTimeZone
      : PLATFORM_DEFAULT_TIME_ZONE;
    const timeZoneSource = timeZone === PLATFORM_DEFAULT_TIME_ZONE && candidateTimeZone !== timeZone
      ? "platform-default"
      : "campus";
    const today = dateKeyInTimeZone(new Date(), timeZone);
    const month = requestedMonth ?? today.slice(0, 7);
    const { year, monthNumber } = validateMonth(month);

    const [sessionsResult, latestResult] = await Promise.all([
      this.db.query<LoginSessionRow>(
        `SELECT created_at
         FROM auth_sessions
         WHERE user_id = $1
           AND created_at >= (make_date($2::integer, $3::integer, 1)::timestamp AT TIME ZONE $4)
           AND created_at < ((make_date($2::integer, $3::integer, 1) + interval '1 month') AT TIME ZONE $4)
         ORDER BY created_at ASC`,
        [profile.user_id, year, monthNumber, timeZone],
      ),
      this.db.query<LoginSessionRow>(
        `SELECT created_at
         FROM auth_sessions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [profile.user_id],
      ),
    ]);

    const sessionsByDate = new Map<string, string[]>();
    for (const row of sessionsResult.rows) {
      const loginAt = toIsoTimestamp(row.created_at);
      if (!loginAt) continue;
      const date = dateKeyInTimeZone(new Date(loginAt), timeZone);
      const sessions = sessionsByDate.get(date) ?? [];
      sessions.push(loginAt);
      sessionsByDate.set(date, sessions);
    }

    const days = [...sessionsByDate.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, sessions]) => ({ date, sessions }));
    const latestLoginAt = toIsoTimestamp(latestResult.rows[0]?.created_at);

    return {
      month,
      timeZone,
      timeZoneSource,
      today,
      student: {
        firstName: profile.first_name,
        lastName: profile.last_name,
        studentType: profile.student_type,
      },
      days,
      summary: {
        daysLoggedIn: days.length,
        totalSuccessfulSessions: days.reduce((total, day) => total + day.sessions.length, 0),
        lastLoginAt: latestLoginAt,
      },
    };
  }

  private async assertCanReadStudent(actor: AuthenticatedUser, profile: StudentProfileRow) {
    const codes = roleCodes(actor);
    if (actor.id === profile.user_id && codes.has("STUDENT")) return;
    if (isPlatformUser(actor)) return;

    if (
      isLmsAdministrator(actor)
      && profile.institution_id
      && actor.scopes.some((scope) => scope.institutionId === profile.institution_id && scope.campusId === null)
    ) {
      return;
    }

    if (codes.has("INSTRUCTOR") || codes.has("TEACHER")) {
      const assignment = await this.db.query<{ allowed: boolean }>(
        `SELECT (
           EXISTS (
             SELECT 1
             FROM lms_instructor_colleges ic
             WHERE $2::uuid IS NOT NULL
               AND ic.tenant_id = $1
               AND ic.institution_id = $2
               AND ic.instructor_id = $3
               AND ic.status = 'ACTIVE'
           )
           OR EXISTS (
             SELECT 1
             FROM lms_instructor_assignments ia
             JOIN lms_enrollments e
               ON e.tenant_id = ia.tenant_id
              AND e.institution_id = ia.institution_id
              AND e.course_id = ia.course_id
             WHERE ia.tenant_id = $1
               AND ia.instructor_id = $3
               AND ia.status = 'ACTIVE'
               AND e.learner_id = $4
               AND e.status = 'ACTIVE'
           )
         ) AS allowed`,
        [profile.tenant_id, profile.institution_id, actor.id, profile.user_id],
      );
      if (assignment.rows[0]?.allowed) return;
    }

    // Student profiles do not store a campus ID. A campus-only administrator
    // cannot be safely matched to a learner's campus, so access is denied.
    throw new NotFoundException("The requested resource was not found.");
  }
}
