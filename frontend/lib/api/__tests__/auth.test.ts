import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveSession, loadSession, clearSession } from "../auth-store";
import { apiFetch } from "../client";

// Mock localStorage and window in Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

if (typeof (global as any).window === "undefined") {
  (global as any).window = {
    location: { href: "" },
    localStorage: localStorageMock,
  };
}

describe("Auth Store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves, loads and clears session", () => {
    expect(loadSession()).toBeNull();

    saveSession({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      orgId: "org-789",
      email: "test@dronehub.com.br",
    });

    const session = loadSession();
    expect(session).not.toBeNull();
    expect(session?.accessToken).toBe("access-123");
    expect(session?.refreshToken).toBe("refresh-456");
    expect(session?.orgId).toBe("org-789");
    expect(session?.email).toBe("test@dronehub.com.br");

    clearSession();
    expect(loadSession()).toBeNull();
  });
});

describe("API Client - Auth headers and Refresh Interceptor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("injects Authorization and X-Organization-Id headers from stored session", async () => {
    saveSession({
      accessToken: "token-abc",
      orgId: "org-xyz",
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { status: "ok" } }),
    });
    global.fetch = mockFetch;

    const res = await apiFetch<{ data: { status: string } }>("/health");
    expect(res.data.status).toBe("ok");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer token-abc");
    expect(headers["X-Organization-Id"]).toBe("org-xyz");
  });

  it("automatically refreshes token on 401 response and retries request", async () => {
    saveSession({
      accessToken: "expired-token",
      refreshToken: "valid-refresh-token",
      orgId: "org-123",
    });

    const mockFetch = vi.fn();

    // 1st call: expired token -> 401
    mockFetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: async () => ({ code: "TOKEN_EXPIRED" }),
    });

    // 2nd call: /auth/refresh -> 200 with new token
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({
        data: { tokens: { access_token: "new-fresh-token" } },
      }),
    });

    // 3rd call: retried original request -> 200
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ data: { success: true } }),
    });

    global.fetch = mockFetch;

    const res = await apiFetch<{ data: { success: boolean } }>("/protected-resource");
    expect(res.data.success).toBe(true);

    // Verify session has updated accessToken
    const updated = loadSession();
    expect(updated?.accessToken).toBe("new-fresh-token");
  });
});
