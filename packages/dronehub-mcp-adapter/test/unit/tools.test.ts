import { describe, it, expect, vi } from "vitest";
import { createToolRegistry } from "../../src/registry.js";
import { RailsClient } from "../../src/client/rails_client.js";
import { createTenantContextFromToken } from "../../src/security/auth_context.js";
import { assertToolAllowed, SecurityPolicyViolationError } from "../../src/security/tool_policy.js";
import { normalizeError, RailsApiError } from "../../src/client/errors.js";

describe("DroneHub MCP Adapter V1 — Unit Tests", () => {
  const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJvcmdhbml6YXRpb25faWQiOiJvcmctYWJjIn0.fake_sig";
  const context = createTenantContextFromToken(fakeToken, "org-abc");

  describe("TenantContext and Security Policy", () => {
    it("derives TenantContext strictly from authenticated credentials", () => {
      expect(context.organizationId).toBe("org-abc");
      expect(context.userId).toBe("123");
      expect(context.token).toBe(fakeToken);
    });

    it("rejects missing or empty token with fail-closed error", () => {
      expect(() => createTenantContextFromToken("")).toThrow(
        "Missing authentication token: cannot establish TenantContext without valid credentials."
      );
    });

    it("permits R0 and R1 risk levels", () => {
      expect(() => assertToolAllowed("missions.search", "R0")).not.toThrow();
      expect(() => assertToolAllowed("matching.find_candidates", "R1")).not.toThrow();
    });

    it("blocks R3, R4, R5, R6, R7 risk levels with SecurityPolicyViolationError", () => {
      expect(() => assertToolAllowed("missions.create", "R3" as any)).toThrow(SecurityPolicyViolationError);
      expect(() => assertToolAllowed("quotes.accept", "R5" as any)).toThrow(SecurityPolicyViolationError);
    });
  });

  describe("Schema Validation and Strict Filter Rejection", () => {
    const mockClient = new RailsClient();
    const registry = createToolRegistry(mockClient);

    it("rejects unknown parameters in missions.search", () => {
      const tool = registry.get("missions.search")!;
      const invalid = tool.parameters.safeParse({
        status: "published",
        injected_sql_field: "DROP TABLE missions;",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects invalid UUID in missions.get", () => {
      const tool = registry.get("missions.get")!;
      const invalid = tool.parameters.safeParse({
        id: "not-a-uuid",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects negative or excessive limits in operators.search", () => {
      const tool = registry.get("operators.search")!;
      expect(tool.parameters.safeParse({ limit: -5 }).success).toBe(false);
      expect(tool.parameters.safeParse({ limit: 500 }).success).toBe(false);
      expect(tool.parameters.safeParse({ limit: 50 }).success).toBe(true);
    });

    it("rejects invalid date format in analytics.get_overview", () => {
      const tool = registry.get("analytics.get_overview")!;
      expect(tool.parameters.safeParse({ start_date: "01-12-2026" }).success).toBe(false);
      expect(tool.parameters.safeParse({ start_date: "2026-12-01" }).success).toBe(true);
    });
  });

  describe("Error Normalization", () => {
    it("normalizes RailsApiError 404 cleanly", () => {
      const err = new RailsApiError(404, "Mission not found", "NOT_FOUND", "req-123");
      const normalized = normalizeError(err);
      expect(normalized).toEqual({
        error: {
          code: "NOT_FOUND",
          message: "Mission not found",
          request_id: "req-123",
          details: undefined,
        },
      });
    });

    it("normalizes AbortError / Timeout", () => {
      const err = new Error("The operation was aborted due to timeout");
      err.name = "AbortError";
      const normalized = normalizeError(err, "req-time");
      expect(normalized.error.code).toBe("TIMEOUT");
    });
  });
});
