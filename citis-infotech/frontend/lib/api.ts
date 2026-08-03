const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337/api";

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

async function request<T>(baseUrl: string, path: string, options: FetchOptions = {}) {
  const { revalidate, tags, token, headers, ...init } = options;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export function apiFetch<T>(path: string, options?: FetchOptions) {
  return request<T>(API_URL, path, options);
}

export function strapiFetch<T>(path: string, options?: FetchOptions) {
  return request<T>(STRAPI_URL, path, {
    token: process.env.STRAPI_API_TOKEN,
    ...options,
  });
}

export { API_URL, STRAPI_URL };
