export type LmsRole = "student" | "instructor" | "admin";

export type LmsUser = {
  name: string;
  email: string;
  role: LmsRole;
};

export const LMS_SESSION_KEY = "citis-lms-user";

export const LMS_ROLES: Array<{ value: LmsRole; label: string; description: string }> = [
  { value: "student", label: "Student", description: "Learn through courses, lessons, quizzes, and projects." },
  { value: "instructor", label: "Instructor", description: "Create learning experiences and support your learners." },
  { value: "admin", label: "Admin", description: "Manage programmes, users, and LMS operations." },
];

export function getRoleLabel(role: LmsRole) {
  return LMS_ROLES.find((item) => item.value === role)?.label ?? "Student";
}