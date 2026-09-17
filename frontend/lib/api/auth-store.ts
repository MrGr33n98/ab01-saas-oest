/** MVP client session (localStorage). Replace with secure cookie session post-MVP. */

const KEY = "dronehub.mvp.session";

export type MvpSession = {
  accessToken: string;
  refreshToken?: string;
  orgId: string;
  email?: string;
  /** Product workspace asserted by the API, never inferred only from UI choice. */
  tenantType?: "operator" | "enterprise";
};

export function loadSession(): MvpSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MvpSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: MvpSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
