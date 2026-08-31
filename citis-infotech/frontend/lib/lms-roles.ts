export type LmsPortal = "admin" | "instructor" | "learner";

export type LmsPrincipal = {
  roles?: Array<{ code: string; name?: string }>;
};

export const LMS_PORTALS: Record<LmsPortal, {
  label: string;
  eyebrow: string;
  description: string;
  roleCodes: readonly string[];
}> = {
  admin: {
    label: "Administrator portal",
    eyebrow: "Manage institutions and learning",
    description: "For platform and institution teams managing programmes, courses, people, assessments, and reporting.",
    roleCodes: [
      "CITIS_SUPER_ADMIN",
      "CITIS_PLATFORM_SUPPORT",
      "INSTITUTION_ADMINISTRATOR",
      "PRINCIPAL_DIRECTOR",
      "ACADEMIC_ADMINISTRATOR",
    ],
  },
  instructor: {
    label: "Instructor portal",
    eyebrow: "Teach, review, and grade",
    description: "For instructors delivering assigned courses, reviewing learner work, and grading assessments.",
    roleCodes: ["TEACHER"],
  },
  learner: {
    label: "Learner portal",
    eyebrow: "Learn and track progress",
    description: "For learners opening enrolled courses, completing assignments and assessments, and viewing progress.",
    roleCodes: ["STUDENT"],
  },
};

export function normalizeLmsPortal(value?: string | null): LmsPortal | null {
  if (value === "institution") return "admin";
  return value === "admin" || value === "instructor" || value === "learner" ? value : null;
}

export function canAccessLmsPortal(principal: LmsPrincipal, portal: LmsPortal): boolean {
  const codes = new Set((principal.roles ?? []).map((role) => role.code));
  return LMS_PORTALS[portal].roleCodes.some((code) => codes.has(code));
}

export function firstAvailableLmsPortal(principal: LmsPrincipal): LmsPortal | null {
  return (["admin", "instructor", "learner"] as const).find((portal) => canAccessLmsPortal(principal, portal)) ?? null;
}