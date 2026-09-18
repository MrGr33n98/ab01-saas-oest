import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";

const inputSchema = z
  .object({
    mission_id: z.string().uuid("mission_id must be a valid UUID").describe("Mission UUID"),
  })
  .strict();

export interface CandidateResult {
  operator_id: string;
  organization_id: string;
  slug: string;
  headline?: string | null;
  score?: number | null;
  band: string;
  reasons: Array<{
    key: string;
    label: string;
  }>;
  algorithm_version: string;
}

export function createMatchingFindCandidatesTool(railsClient: RailsClient): McpTool<typeof inputSchema, CandidateResult[]> {
  const toolName = "matching.find_candidates";
  const riskLevel = "R1";

  return {
    name: toolName,
    description: "Computes and returns canonical matching candidate operators for a mission via Rails Matching Domain Service.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<CandidateResult[]> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<CandidateResult[]>(
          `/missions/${encodeURIComponent(input.mission_id)}/candidates`,
          {},
          context
        );

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
          data,
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
