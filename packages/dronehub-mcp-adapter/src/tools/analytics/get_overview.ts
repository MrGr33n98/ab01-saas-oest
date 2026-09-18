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

export interface AnalyticsOverviewResult {
  summary: {
    total_events: number;
    active_days: number;
  };
  metrics: {
    missions_created: number;
    missions_published: number;
    quotes_submitted: number;
    quotes_accepted: number;
    deliveries_completed: number;
    revenue_cents: number;
  };
  range: {
    start_date: string;
    end_date: string;
  };
}

export function createAnalyticsOverviewTool(railsClient: RailsClient): McpTool<typeof inputSchema, AnalyticsOverviewResult> {
  const toolName = "analytics.get_overview";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Fetches canonical SaaS product analytics overview for the authenticated organization.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<AnalyticsOverviewResult> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<AnalyticsOverviewResult>(
          "/analytics/overview",
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
