export type LmsDbRole = "student" | "instructor" | "admin";
export type LmsCourseStatus = "draft" | "published";
export type LmsEnrollmentStatus = "active" | "completed" | "withdrawn";

export type LmsDbUser = {
  id: number;
  name: string;
  email: string;
  role: LmsDbRole;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LmsDbCourse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructorId: number | null;
  status: LmsCourseStatus;
  outcomes: string[];
  modules: unknown[];
  createdAt: Date;
  updatedAt: Date;
};

export type LmsDbEnrollment = {
  id: number;
  userId: number;
  courseId: number;
  status: LmsEnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
};

export type LmsDbProgress = {
  id: number;
  enrollmentId: number;
  completedLessonIds: string[];
  percent: number;
  lastLessonId: string | null;
  updatedAt: Date;
};

export type LmsDbQuiz = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  questions: unknown[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LmsDbAssignment = {
  id: number;
  courseId: number;
  title: string;
  instructions: string;
  dueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LmsDbCertificate = {
  id: number;
  userId: number;
  courseId: number;
  enrollmentId: number;
  certificateNumber: string;
  issuedAt: Date;
  verificationUrl: string | null;
  metadata: Record<string, unknown>;
};