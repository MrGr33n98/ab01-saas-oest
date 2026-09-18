import { describe, it, expect, vi } from "vitest";
import { RailsClient } from "../../src/client/rails_client.js";
import { createMissionsSearchTool } from "../../src/tools/missions/search.js";
import { createMatchingFindCandidatesTool } from "../../src/tools/matching/find_candidates.js";
import { createTenantContextFromToken } from "../../src/security/auth_context.js";

describe("DroneHub MCP Adapter V1 — Contract Tests", () => {
  const fakeToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJvcmdhbml6YXRpb25faWQiOiJvcmctYWJjIn0.fake_sig";
  const context = createTenantContextFromToken(fakeToken, "org-abc");

  it("normalizes canonical Rails missions list envelope", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockResolvedValueOnce({
      data: [
        {
          id: "33333333-3333-3333-3333-333333333333",
          title: "Mapeamento Topográfico",
          status: "published",
          mission_type: "mapping",
          area_hectares: 120.5,
          version: 1,
        },
      ],
      requestId: "req-contract-1",
      durationMs: 42,
    });

    const tool = createMissionsSearchTool(railsClient);
    const result = await tool.execute({ limit: 10 }, context);

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("33333333-3333-3333-3333-333333333333");
      expect(result.data[0].area_hectares).toBe(120.5);
      expect(result.meta?.request_id).toBe("req-contract-1");
    }
  });

  it("normalizes canonical Rails matching candidates envelope without fabricated score", async () => {
    const railsClient = new RailsClient();
    vi.spyOn(railsClient, "get").mockResolvedValueOnce({
      data: [
        {
          operator_id: "op-1",
          organization_id: "org-op-1",
          slug: "aero-geo",
          headline: "Especialista em Topografia",
          score: null,
          band: "eligible",
          reasons: [{ key: "eligible", label: "Cobertura + verificado + aceitando jobs" }],
          algorithm_version: "v1",
        },
      ],
      requestId: "req-match-1",
      durationMs: 35,
    });

    const tool = createMatchingFindCandidatesTool(railsClient);
    const result = await tool.execute({ mission_id: "33333333-3333-3333-3333-333333333333" }, context);

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].score).toBeNull();
      expect(result.data[0].band).toBe("eligible");
      expect(result.data[0].algorithm_version).toBe("v1");
    }
  });
});
