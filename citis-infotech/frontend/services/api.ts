import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  AuthResponse,
  Career,
  Contact,
  Inquiry,
  JobApplication,
  PartnerApplication,
  User,
} from "@/types";

function toFormData(application: JobApplication) {
  const data = new FormData();
  Object.entries(application).forEach(([key, value]) => {
    if (value !== undefined && value !== "") data.append(key, value);
  });
  return data;
}

export const contactService = {
  submit: (payload: Contact) =>
    apiFetch<ApiResponse<Contact>>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
      revalidate: false,
    }),
  submitInquiry: (payload: Inquiry) =>
    apiFetch<ApiResponse<Inquiry>>("/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
      revalidate: false,
    }),
  subscribe: (email: string) =>
    apiFetch<ApiResponse<{ email: string }>>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
      revalidate: false,
    }),
};

export const careerService = {
  list: () => apiFetch<ApiResponse<Career[]>>("/careers", { tags: ["careers"] }),
  get: (slug: string) => apiFetch<ApiResponse<Career>>(`/careers/${slug}`, { tags: [`career-${slug}`] }),
  apply: (application: JobApplication) =>
    apiFetch<ApiResponse<{ applicationId: string }>>("/careers/apply", {
      method: "POST",
      body: toFormData(application),
      revalidate: false,
    }),
};

export const partnerService = {
  apply: (payload: PartnerApplication) =>
    apiFetch<ApiResponse<PartnerApplication>>("/partners/apply", {
      method: "POST",
      body: JSON.stringify(payload),
      revalidate: false,
    }),
};

export const authService = {
  login: (email: string, password: string) =>
    apiFetch<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      revalidate: false,
    }),
  logout: (token: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", token, revalidate: false }),
  me: (token: string) =>
    apiFetch<ApiResponse<User>>("/auth/me", { token, revalidate: false }),
};
