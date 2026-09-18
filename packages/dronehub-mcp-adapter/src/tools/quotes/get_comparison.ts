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

export interface QuoteItem {
  id: string;
  operator_profile_id: string;
  operator_name?: string;
  operator_slug?: string;
  status: string;
  total_cents?: number;
  total?: number;
  currency: string;
  turnaround_days?: number;
  proposal_text?: string;
  created_at: string;
}

export interface QuoteComparisonResult {
  mission_id: string;
  quotes: QuoteItem[];
  quotes_count: number;
  min_price?: number | null;
  max_price?: number | null;
  currency?: string | null;
}

export function createQuotesGetComparisonTool(railsClient: RailsClient): McpTool<typeof inputSchema, QuoteComparisonResult> {
  const toolName = "quotes.get_comparison";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Fetches canonical commercial quote comparisons for a mission in read-only mode.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<QuoteComparisonResult> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<QuoteComparisonResult>(
          `/missions/${encodeURIComponent(input.mission_id)}/quote-comparison`,
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
