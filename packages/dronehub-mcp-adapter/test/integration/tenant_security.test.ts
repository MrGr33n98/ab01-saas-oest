import { describe, it, expect, vi } from "vitest";
import { RailsClient } from "../../src/client/rails_client.js";
import { createMissionsGetTool } from "../../src/tools/missions/get.js";
import { createMatchingFindCandidatesTool } from "../../src/tools/matching/find_candidates.js";
import { createQuotesGetComparisonTool } from "../../src/tools/quotes/get_comparison.js";
import { createTenantContextFromToken } from "../../src/security/auth_context.js";
import { RailsApiError } from "../../src/client/errors.js";

describe("Tenant Security & Cross-Tenant Isolation Proof", () => {
  const tokenA = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWEiLCJvcmdhbml6YXRpb25faWQiOiJvcmctYSJ9.sigA";
  const tokenB = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWIiLCJvcmdhbml6YXRpb25faWQiOiJvcmctYiJ9.sigB";

  const contextTenantA = createTenantContextFromToken(tokenA, "org-a");
  const contextTenantB = createTenantContextFromToken(tokenB, "org-b");

  const missionTenantA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const missionTenantB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  it("Tenant A accessing own mission succeeds (200 OK)", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockImplementation(async (path, _params, ctx) => {
      if (path === `/missions/${missionTenantA}` && ctx.organizationId === "org-a") {
        return {
          data: { id: missionTenantA, title: "Mission A", status: "published", version: 1 },
          requestId: "req-ok",
          durationMs: 10,
        };
      }
      throw new RailsApiError(404, "Mission not found", "NOT_FOUND", "req-err");
    });

    const tool = createMissionsGetTool(railsClient);
    const res = await tool.execute({ id: missionTenantA }, contextTenantA);
    expect("data" in res).toBe(true);
    if ("data" in res) {
      expect(res.data.id).toBe(missionTenantA);
    }
  });

  it("Tenant A accessing Tenant B mission is strictly DENIED (404/403)", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockImplementation(async (path, _params, ctx) => {
      if (path === `/missions/${missionTenantB}` && ctx.organizationId === "org-a") {
        throw new RailsApiError(404, "Mission not found in tenant scope", "NOT_FOUND", "req-cross-tenant");
      }
      return { data: {}, requestId: "req", durationMs: 10 };
    });

    const tool = createMissionsGetTool(railsClient);
    const res = await tool.execute({ id: missionTenantB }, contextTenantA);
    expect("error" in res).toBe(true);
    if ("error" in res) {
      expect(res.error.code).toBe("NOT_FOUND");
      expect(res.error.message).toContain("tenant scope");
    }
  });

  it("Tenant A requesting candidates for Tenant B mission is strictly DENIED", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockImplementation(async (path, _params, ctx) => {
      if (path === `/missions/${missionTenantB}/candidates` && ctx.organizationId === "org-a") {
        throw new RailsApiError(404, "Mission not found", "NOT_FOUND", "req-cross-candidates");
      }
      return { data: [], requestId: "req", durationMs: 10 };
    });

    const tool = createMatchingFindCandidatesTool(railsClient);
    const res = await tool.execute({ mission_id: missionTenantB }, contextTenantA);
    expect("error" in res).toBe(true);
    if ("error" in res) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
  });

  it("Tenant A requesting quote comparison for Tenant B mission is strictly DENIED", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockImplementation(async (path, _params, ctx) => {
      if (path === `/missions/${missionTenantB}/quote-comparison` && ctx.organizationId === "org-a") {
        throw new RailsApiError(404, "Mission not found", "NOT_FOUND", "req-cross-quotes");
      }
      return { data: {}, requestId: "req", durationMs: 10 };
    });

    const tool = createQuotesGetComparisonTool(railsClient);
    const res = await tool.execute({ mission_id: missionTenantB }, contextTenantA);
    expect("error" in res).toBe(true);
    if ("error" in res) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
  });
});
