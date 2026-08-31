import { apiFetch } from "@/lib/api";
import type {
  AdminCareer,
  AdminJobApplication,
  ApiResponse,
  AuthPrincipal,
  AuthResponse,
  Career,
  Contact,
  Inquiry,
  NewsletterSubscriber,
  PartnerApplication,
  PartnerInquiry,
} from "@/types";

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

export const newsletterService = {
  list: (token: string, params?: { search?: string; isActive?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.isActive) query.set("isActive", params.isActive);
    query.set("page", String(params?.page || 1));
    query.set("limit", String(params?.limit || 100));
    return apiFetch<ApiResponse<NewsletterSubscriber[]> & { meta?: Record<string, unknown> }>(
      `/newsletter?${query}`,
      { token, revalidate: false },
    );
  },
  setActive: (token: string, id: string, isActive: boolean) =>
    apiFetch<ApiResponse<NewsletterSubscriber>>(`/newsletter/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ isActive }),
      revalidate: false,
    }),
};

export const careerService = {
  list: (token?: string) =>
    apiFetch<ApiResponse<AdminCareer[] | Career[]>>("/careers", {
      token,
      tags: token ? undefined : ["careers"],
      revalidate: token ? false : undefined,
    }),
  get: (slug: string) =>
    apiFetch<ApiResponse<Career>>(`/careers/slug/${slug}`, { tags: [`career-${slug}`] }),
  apply: (
    careerSlug: string,
    application: {
      name: string;
      email: string;
      phone?: string;
      resume: File;
      coverLetter?: string;
      skills?: string;
      linkedIn?: string;
      portfolio?: string;
    },
  ) => {
    const data = new FormData();
    data.append("name", application.name);
    data.append("email", application.email);
    if (application.phone) data.append("phone", application.phone);
    if (application.coverLetter) data.append("coverLetter", application.coverLetter);
    if (application.skills) data.append("skills", application.skills);
    if (application.linkedIn) data.append("linkedIn", application.linkedIn);
    if (application.portfolio) data.append("portfolio", application.portfolio);
    data.append("resume", application.resume);
    return apiFetch<ApiResponse<AdminJobApplication>>(`/careers/slug/${careerSlug}/apply`, {
      method: "POST",
      body: data,
      revalidate: false,
    });
  },
  listApplications: (token: string, params?: { career?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.career) query.set("career", params.career);
    if (params?.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query}` : "";
    return apiFetch<ApiResponse<AdminJobApplication[]>>(`/careers/applications${suffix}`, {
      token,
      revalidate: false,
    });
  },
  updateApplication: (
    token: string,
    applicationId: string,
    payload: { status?: AdminJobApplication["status"]; adminNotes?: string },
  ) =>
    apiFetch<ApiResponse<AdminJobApplication>>(`/careers/applications/${applicationId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
      revalidate: false,
    }),
};

export const partnerService = {
  apply: (payload: PartnerApplication) =>
    apiFetch<ApiResponse<PartnerInquiry>>("/inquiries", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        organization: payload.company,
        website: payload.website,
        partnershipType: payload.partnershipType,
        message: payload.message,
      }),
      revalidate: false,
    }),
  list: (token: string, params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    query.set("page", String(params?.page || 1));
    query.set("limit", String(params?.limit || 100));
    return apiFetch<ApiResponse<PartnerInquiry[]> & { meta?: Record<string, unknown> }>(
      `/inquiries?${query}`,
      { token, revalidate: false },
    );
  },
  updateStatus: (token: string, id: string, status: "new" | "read" | "replied") =>
    apiFetch<ApiResponse<PartnerInquiry>>(`/inquiries/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
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
  me: (token?: string) =>
    apiFetch<ApiResponse<AuthPrincipal>>("/auth/me", { token, revalidate: false }),
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
