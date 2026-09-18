import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";

const inputSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format")
      .optional()
      .describe("Start date filter in YYYY-MM-DD format"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be in YYYY-MM-DD format")
      .optional()
      .describe("End date filter in YYYY-MM-DD format"),
  })
  .strict();

export interface AnalyticsFunnelStep {
  step: string;
  name: string;
  count: number;
  conversion_rate?: number;
}

export interface AnalyticsFunnelResult {
  steps: AnalyticsFunnelStep[];
  overall_conversion_rate: number;
  range: {
    start_date: string;
    end_date: string;
  };
}

export function createAnalyticsFunnelTool(railsClient: RailsClient): McpTool<typeof inputSchema, AnalyticsFunnelResult> {
  const toolName = "analytics.get_funnel";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Fetches canonical SaaS conversion funnel metrics for the authenticated organization.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<AnalyticsFunnelResult> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<AnalyticsFunnelResult>(
          "/analytics/funnel",
          {
            start_date: input.start_date,
            end_date: input.end_date,
          },
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
