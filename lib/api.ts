/**
 * Explicit API base URL. Set NEXT_PUBLIC_API_URL in your environment to connect
 * a backend. When unset, all apiFetch calls fail with a clear configuration error
 * so the admin UI surfaces the problem rather than silently hitting localhost.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = RequestInit & {
  revalidate?: number | false;
  tags?: string[];
  token?: string;
};

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function sessionId() {
  if (typeof window === "undefined") return "";
  const key = "citis_session_id";
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

async function request<T>(baseUrl: string, path: string, options: FetchOptions = {}) {
  const { revalidate, tags, token, headers, ...init } = options;
  const method = (init.method || "GET").toUpperCase();
  const csrf = typeof document !== "undefined" ? readCookie("citis_csrf") : "";

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-Session-Id": sessionId(),
      ...(csrf && !["GET", "HEAD"].includes(method) ? { "X-CSRF-Token": csrf } : {}),
      ...headers,
    },
    next:
      revalidate === false
        ? undefined
        : { revalidate: revalidate ?? 300, tags },
    cache: revalidate === false ? "no-store" : init.cache,
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }
    throw new ApiError(
      (details as { message?: string })?.message ?? `Request failed with status ${response.status}`,
      response.status,
      details,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** Returns true when NEXT_PUBLIC_API_URL is explicitly set. */
export function isApiConfigured(): boolean {
  return Boolean(API_URL);
}

export function apiFetch<T>(path: string, options?: FetchOptions) {
  if (!API_URL) {
    return Promise.reject(
      new ApiError(
        "Backend not configured — set NEXT_PUBLIC_API_URL to connect a live API.",
        0,
      ),
    );
  }
  return request<T>(API_URL, path, options);
}

/** @deprecated Strapi removed from required stack — use Express APIs. */
export function strapiFetch<T>(path: string, options?: FetchOptions) {
  return request<T>(API_URL, path, options);
}

export { API_URL };
