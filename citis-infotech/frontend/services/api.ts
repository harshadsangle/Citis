import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  AuthResponse,
  Career,
  Contact,
  Inquiry,
  PartnerApplication,
  User,
} from "@/types";

function toFormData(application: Record<string, string | Blob | undefined>) {
  const data = new FormData();
  Object.entries(application).forEach(([key, value]) => {
    if (value !== undefined && value !== "") data.append(key, value);
  });
  return data;
}

export const contactService = {
  submit: (payload: Contact) =>
    apiFetch<ApiResponse<Contact>>("/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
      revalidate: false,
    }),
  list: (token: string, params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    query.set("page", String(params?.page || 1));
    query.set("limit", String(params?.limit || 50));
    return apiFetch<ApiResponse<Contact[]> & { meta?: Record<string, unknown> }>(`/contacts?${query}`, {
      token,
      revalidate: false,
    });
  },
  updateStatus: (token: string, id: string, status: "new" | "read" | "replied") =>
    apiFetch<ApiResponse<Contact>>(`/contacts/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
      revalidate: false,
    }),
  remove: (token: string, id: string) =>
    apiFetch<ApiResponse<null>>(`/contacts/${id}`, {
      method: "DELETE",
      token,
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
  get: (slug: string) =>
    apiFetch<ApiResponse<Career>>(`/careers/slug/${slug}`, { tags: [`career-${slug}`] }),
  apply: (
    careerId: string,
    application: {
      name: string;
      email: string;
      phone?: string;
      resume: File;
      coverLetter?: string;
      skills?: string;
    },
  ) => {
    const data = new FormData();
    data.append("name", application.name);
    data.append("email", application.email);
    if (application.phone) data.append("phone", application.phone);
    if (application.coverLetter) data.append("coverLetter", application.coverLetter);
    if (application.skills) data.append("skills", application.skills);
    data.append("resume", application.resume);
    return apiFetch<ApiResponse<{ applicationId: string }>>(`/careers/${careerId}/apply`, {
      method: "POST",
      body: data,
      revalidate: false,
    });
  },
};

export const partnerService = {
  apply: (payload: PartnerApplication) =>
    apiFetch<ApiResponse<PartnerApplication>>("/inquiries", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        organization: payload.company,
        type: payload.partnershipType || "partnership",
        message: payload.message,
      }),
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
  logout: (token?: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", token, revalidate: false }),
  me: (token: string) =>
    apiFetch<ApiResponse<User>>("/auth/me", { token, revalidate: false }),
};

export const searchService = {
  search: (q: string, params?: { type?: string; sort?: string; limit?: number }) => {
    const query = new URLSearchParams({
      q,
      type: params?.type || "all",
      sort: params?.sort || "relevance",
      limit: String(params?.limit || 12),
    });
    return apiFetch<ApiResponse<{
      query: string;
      count: number;
      results: Array<{
        id: string;
        type: string;
        title: string;
        excerpt: string;
        href: string;
        highlightTitle: string;
        highlightExcerpt: string;
      }>;
    }>>(`/search?${query}`, { revalidate: false });
  },
  suggestions: (q: string) =>
    apiFetch<ApiResponse<{ suggestions: string[]; recent: string[]; popular: string[] }>>(
      `/search/suggestions?q=${encodeURIComponent(q)}`,
      { revalidate: false },
    ),
};

export const analyticsService = {
  track: (payload: {
    name: string;
    path?: string;
    resourceType?: string;
    resourceId?: string;
    meta?: Record<string, unknown>;
  }) =>
    apiFetch("/analytics/track", {
      method: "POST",
      body: JSON.stringify(payload),
      revalidate: false,
    }).catch(() => undefined),
  dashboard: (token: string) =>
    apiFetch<ApiResponse<Record<string, unknown>>>("/analytics/dashboard", {
      token,
      revalidate: false,
    }),
};

export const cmsService = {
  list: () => apiFetch<ApiResponse<unknown[]>>("/cms", { tags: ["cms"] }),
  get: (key: string) => apiFetch<ApiResponse<unknown>>(`/cms/${key}`, { tags: [`cms-${key}`] }),
  save: (key: string, body: unknown, token: string) =>
    apiFetch(`/cms/${key}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
      revalidate: false,
    }),
};
