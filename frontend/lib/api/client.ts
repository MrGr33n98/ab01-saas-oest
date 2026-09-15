import { loadSession, saveSession, clearSession } from "./auth-store";
import { mockApiFetch } from "../mock/mock-fetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const IS_MOCK_ENABLED = process.env.NEXT_PUBLIC_MOCK_API === "true";

export type ApiError = {
  status: number;
  code?: string;
  title?: string;
  detail?: string;
  request_id?: string;
};

type FetchOpts = RequestInit & {
  orgId?: string;
  token?: string;
  idempotencyKey?: string;
  skipAuth?: boolean;
  /** internal: set to true to avoid infinite refresh loop */
  _retried?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = loadSession();
  if (!session?.refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      if (!res.ok) {
        clearSession();
        if (typeof window !== "undefined") window.location.href = "/sign-in";
        return null;
      }
      const data = await res.json();
      const newToken = data?.data?.tokens?.access_token ?? data?.access_token;
      if (newToken) {
        saveSession({ ...session, accessToken: newToken });
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOpts = {}): Promise<T> {
  if (IS_MOCK_ENABLED) {
    return mockApiFetch<T>(path, options);
  }

  const session = typeof window !== "undefined" ? loadSession() : null;
  const { orgId, token, idempotencyKey, skipAuth, _retried, headers, ...rest } = options;

  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Request-Id": crypto.randomUUID(),
    ...(headers as Record<string, string>),
  };

  const access = token ?? session?.accessToken;
  const organizationId = orgId ?? session?.orgId;
  if (!skipAuth && access) h.Authorization = `Bearer ${access}`;
  if (!skipAuth && organizationId) h["X-Organization-Id"] = organizationId;
  if (idempotencyKey) h["Idempotency-Key"] = idempotencyKey;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...rest, headers: h });
    const body = await res.json().catch(() => ({}));

    // Token expired → attempt refresh once
    if (res.status === 401 && !skipAuth && !_retried) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiFetch<T>(path, { ...options, token: newToken, _retried: true });
      }
      if (typeof window !== "undefined") {
        clearSession();
        window.location.href = "/sign-in";
      }
    }

    if (!res.ok) {
      throw {
        status: res.status,
        code: body.code,
        title: body.title,
        detail: body.detail || body.title,
        request_id: body.request_id,
      } as ApiError;
    }
    return body as T;
  } catch (err) {
    // If backend connection fails (ECONNREFUSED) in local dev, fallback seamlessly to Mock Mode
    if (typeof window !== "undefined" && (err as Error)?.name === "TypeError") {
      console.warn(`[DroneHub API] Backend offline em ${API_URL}${path} — Usando Mock Data local.`);
      return mockApiFetch<T>(path, options);
    }
    throw err;
  }
}

export function getApiBase() {
  return API_URL;
}
