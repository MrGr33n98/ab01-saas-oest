import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";

const inputSchema = z
  .object({
    status: z
      .enum(["draft", "published", "in_progress", "completed", "cancelled", "disputed"])
      .optional()
      .describe("Filter missions by lifecycle status"),
    limit: z
      .number()
      .int()
      .min(1, "limit must be at least 1")
      .max(100, "limit cannot exceed 100")
      .default(25)
      .optional()
      .describe("Maximum number of records to return (1-100)"),
    offset: z
      .number()
      .int()
      .min(0, "offset cannot be negative")
      .default(0)
      .optional()
      .describe("Pagination offset"),
  })
  .strict();

export interface MissionSummary {
  id: string;
  title: string;
  status: string;
  mission_type: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  published_at?: string | null;
  version: number;
}

export function createMissionsSearchTool(railsClient: RailsClient): McpTool<typeof inputSchema, MissionSummary[]> {
  const toolName = "missions.search";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Lists and searches missions for the authenticated organization with bounded pagination.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<MissionSummary[]> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<MissionSummary[]>(
          "/missions",
          {
            status: input.status,
            limit: input.limit ?? 25,
            offset: input.offset ?? 0,
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
            pagination: {
              per_page: input.limit ?? 25,
              page: Math.floor((input.offset ?? 0) / (input.limit ?? 25)) + 1,
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
