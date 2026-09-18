import { describe, it, expect, vi } from "vitest";
import { RailsClient } from "../src/client/rails_client.js";
import { createMissionsGetTool } from "../src/tools/missions/get.js";
import { createMatchingFindCandidatesTool } from "../src/tools/matching/find_candidates.js";
import { createMatchingExplainCandidateTool } from "../src/tools/matching/explain_candidate.js";
import { createQuotesGetComparisonTool } from "../src/tools/quotes/get_comparison.js";
import { createTenantContextFromToken } from "../src/security/auth_context.js";

describe("Golden MCP Scenario: 'Encontre operadores elegíveis para esta missão'", () => {
  const missionId = "11111111-1111-1111-1111-111111111111";
  const operatorId = "22222222-2222-2222-2222-222222222222";
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEiLCJvcmdhbml6YXRpb25faWQiOiJvcmctMSJ9.signature";
  const context = createTenantContextFromToken(token, "org-1");

  it("executes the full read/analyze workflow without direct SQL or fabricated data", async () => {
    const railsClient = new RailsClient();

    // Step 1: missions.get
    vi.spyOn(railsClient, "get")
      .mockResolvedValueOnce({
        data: {
          id: missionId,
          title: "Inspeção de Parque Solar",
          status: "published",
          mission_type: "solar_inspection",
          area_hectares: 75.0,
          version: 1,
        },
        requestId: "req-1",
        durationMs: 20,
      })
      // Step 2: matching.find_candidates
      .mockResolvedValueOnce({
        data: [
          {
            operator_id: operatorId,
            organization_id: "org-op-2",
            slug: "solardrone-pro",
            headline: "Inspeções Termográficas Especializadas",
            score: null, // No fake score
            band: "eligible",
            reasons: [{ key: "eligible", label: "Cobertura + verificado + aceitando jobs" }],
            algorithm_version: "v1",
          },
        ],
        requestId: "req-2",
        durationMs: 30,
      })
      // Step 3: matching.explain_candidate (fetches candidates internally)
      .mockResolvedValueOnce({
        data: [
          {
            operator_id: operatorId,
            organization_id: "org-op-2",
            slug: "solardrone-pro",
            headline: "Inspeções Termográficas Especializadas",
            score: null,
            band: "eligible",
            reasons: [{ key: "eligible", label: "Cobertura + verificado + aceitando jobs" }],
            algorithm_version: "v1",
          },
        ],
        requestId: "req-3",
        durationMs: 25,
      })
      // Step 4: quotes.get_comparison
      .mockResolvedValueOnce({
        data: {
          mission_id: missionId,
          quotes: [],
          quotes_count: 0,
          min_price: null,
          max_price: null,
        },
        requestId: "req-4",
        durationMs: 15,
      });

    // 1. Get Mission
    const getMissionTool = createMissionsGetTool(railsClient);
    const missionRes = await getMissionTool.execute({ id: missionId }, context);
    expect("data" in missionRes).toBe(true);
    if ("data" in missionRes) {
      expect(missionRes.data.id).toBe(missionId);
      expect(missionRes.data.status).toBe("published");
    }

    // 2. Find Candidates via Rails Matching Service
    const findCandidatesTool = createMatchingFindCandidatesTool(railsClient);
    const candidatesRes = await findCandidatesTool.execute({ mission_id: missionId }, context);
    expect("data" in candidatesRes).toBe(true);
    if ("data" in candidatesRes) {
      expect(candidatesRes.data).toHaveLength(1);
      expect(candidatesRes.data[0].operator_id).toBe(operatorId);
      expect(candidatesRes.data[0].score).toBeNull();
    }

    // 3. Explain Candidate
    const explainTool = createMatchingExplainCandidateTool(railsClient);
    const explainRes = await explainTool.execute({ mission_id: missionId, operator_id: operatorId }, context);
    expect("data" in explainRes).toBe(true);
    if ("data" in explainRes) {
      expect(explainRes.data.eligible).toBe(true);
      expect(explainRes.data.evidence.verified).toBe(true);
      expect(explainRes.data.unknown).toContain("real_time_availability");
    }

    // 4. Check Quotes Comparison
    const quotesTool = createQuotesGetComparisonTool(railsClient);
    const quotesRes = await quotesTool.execute({ mission_id: missionId }, context);
    expect("data" in quotesRes).toBe(true);
    if ("data" in quotesRes) {
      expect(quotesRes.data.quotes_count).toBe(0);
    }
  });
});
