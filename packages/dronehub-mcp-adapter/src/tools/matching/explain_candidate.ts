import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError, RailsApiError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";
import { CandidateResult } from "./find_candidates.js";
import { MissionWorkspace } from "../missions/get.js";

const inputSchema = z
  .object({
    mission_id: z.string().uuid("mission_id must be a valid UUID").describe("Mission UUID"),
    operator_id: z.string().uuid("operator_id must be a valid UUID").describe("Operator UUID"),
  })
  .strict();

export interface CandidateExplanation {
  operator_id: string;
  mission_id: string;
  eligible: boolean;
  band: string;
  evidence: {
    verified: boolean;
    accepting_jobs: boolean;
    coverage_match: boolean;
    reasons: Array<{ key: string; label: string }>;
  };
  unknown: string[];
  algorithm_version: string;
}

export function createMatchingExplainCandidateTool(railsClient: RailsClient): McpTool<typeof inputSchema, CandidateExplanation> {
  const toolName = "matching.explain_candidate";
  const riskLevel = "R1";

  return {
    name: toolName,
    description: "Transforms canonical matching candidate evidence into an explainable audit structure without recalculating scores.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<CandidateExplanation> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        // Fetch candidate set from canonical Rails endpoint
        const { data: candidates, requestId, durationMs } = await railsClient.get<CandidateResult[]>(
          `/missions/${encodeURIComponent(input.mission_id)}/candidates`,
          {},
          context
        );

        const candidate = candidates.find((c) => c.operator_id === input.operator_id);

        if (!candidate) {
          throw new RailsApiError(
            404,
            `Operator '${input.operator_id}' is not in the candidate set for mission '${input.mission_id}' or is not eligible.`,
            "CANDIDATE_NOT_FOUND",
            requestId
          );
        }

        const explanation: CandidateExplanation = {
          operator_id: candidate.operator_id,
          mission_id: input.mission_id,
          eligible: candidate.band === "eligible",
          band: candidate.band,
          evidence: {
            verified: true, // Candidate filter requires verified
            accepting_jobs: true, // Candidate filter requires accepting_jobs
            coverage_match: true, // Candidate filter requires PostGIS coverage match
            reasons: candidate.reasons || [],
          },
          unknown: ["real_time_availability", "instant_battery_charge_level"],
          algorithm_version: candidate.algorithm_version || "v1",
        };

        logToolExecution({
          tool: toolName,
          risk_level: riskLevel,
          organization_id: context.organizationId,
          user_id: context.userId,
          request_id: requestId,
          correlation_id: context.correlationId,
          duration_ms: durationMs,
          status: "success",
        });

        return {
          data: explanation,
          meta: {
            request_id: requestId,
            duration_ms: durationMs,
          },
        };
      } catch (err) {
        const durationMs = Math.round(performance.now() - start);
        const normalized = normalizeError(err);
        logToolExecution({
          tool: toolName,
          risk_level: riskLevel,
          organization_id: context.organizationId,
          user_id: context.userId,
          duration_ms: durationMs,
          status: "error",
          error_code: normalized.error.code,
        });
        return normalized;
      }
    },
  };
}
