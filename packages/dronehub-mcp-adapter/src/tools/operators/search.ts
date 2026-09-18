import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";

const inputSchema = z
  .object({
    service: z.string().max(100).optional().describe("Service category slug filter (e.g. 'topografia-aerofotogrametria')"),
    state: z.string().length(2, "State must be a 2-letter state code like 'SP' or 'MG'").optional().describe("Brazilian 2-letter state code"),
    min_rating: z.number().min(0).max(5).optional().describe("Minimum rating filter (0.0 - 5.0)"),
    limit: z.number().int().min(1).max(100).default(25).optional().describe("Maximum operators to return (1-100)"),
  })
  .strict();

export interface OperatorCard {
  id: string;
  slug: string;
  name: string;
  headline?: string | null;
  verification_status: string;
  verified: boolean;
  city?: string | null;
  state_code?: string | null;
  rating_average?: number | null;
  rating_count?: number;
  featured?: boolean;
}

export function createOperatorsSearchTool(railsClient: RailsClient): McpTool<typeof inputSchema, OperatorCard[]> {
  const toolName = "operators.search";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Searches verified drone operators in the marketplace using canonical filters. Never returns fabricated data.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<OperatorCard[]> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const params: Record<string, string | number | boolean | undefined> = {
          limit: input.limit ?? 25,
        };

        if (input.service) params["filter[service]"] = input.service;
        if (input.state) params["filter[state]"] = input.state;
        if (input.min_rating !== undefined) params["filter[min_rating]"] = input.min_rating;

        const { data, requestId, durationMs } = await railsClient.get<OperatorCard[]>(
          "/marketplace/operators",
          params,
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
            pagination: {
              per_page: input.limit ?? 25,
            },
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
