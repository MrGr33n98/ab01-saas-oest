import { TenantContext } from "../types.js";

export function createTenantContextFromToken(token: string, organizationId?: string, correlationId?: string): TenantContext {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Missing authentication token: cannot establish TenantContext without valid credentials.");
  }

  let extractedUserId: string | undefined;
  let extractedOrgId: string | undefined = organizationId;

  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payloadBase64 = parts.length === 3 ? parts[1] : parts[0];
      const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf8");
      const payload = JSON.parse(payloadJson);
      if (payload.sub) {
        extractedUserId = String(payload.sub);
      }
      if (payload.organization_id && !extractedOrgId) {
        extractedOrgId = String(payload.organization_id);
      }
    }
  } catch {
    // If decoding fails, rely on Rails authentication layer to validate and reject
  }

  return {
    token: token.trim(),
    organizationId: extractedOrgId,
    userId: extractedUserId,
    correlationId: correlationId || crypto.randomUUID(),
  };
}
