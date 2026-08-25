export type LmsCertificate = {
  courseSlug: string;
  courseName: string;
  studentName: string;
  completionDate: string;
  status: "Completed";
};

export const LMS_CERTIFICATES_KEY = "citis-lms-certificates";

export function readCertificates() {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(LMS_CERTIFICATES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored as LmsCertificate[] : [];
  } catch {
    return [];
  }
}

export function saveCertificates(certificates: LmsCertificate[]) {
  window.localStorage.setItem(LMS_CERTIFICATES_KEY, JSON.stringify(certificates));
}