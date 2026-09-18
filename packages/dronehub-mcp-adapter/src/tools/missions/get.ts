import { z } from "zod";
import { McpTool, TenantContext, McpSuccessResponse, McpErrorResponse } from "../../types.js";
import { RailsClient } from "../../client/rails_client.js";
import { normalizeError } from "../../client/errors.js";
import { assertToolAllowed } from "../../security/tool_policy.js";
import { logToolExecution } from "../../observability/telemetry.js";

const inputSchema = z
  .object({
    id: z.string().uuid("id must be a valid UUID").describe("Mission UUID"),
  })
  .strict();

export interface MissionWorkspace {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  mission_type: string;
  priority?: string | null;
  area_hectares?: number | null;
  deadline_at?: string | null;
  published_at?: string | null;
  completed_at?: string | null;
  currency?: string | null;
  estimated_budget_min?: number | null;
  estimated_budget_max?: number | null;
  project_id?: string | null;
  geometry?: unknown;
  products?: Array<{
    data_product_id: string;
    quantity: number;
    name: string;
    slug: string;
  }>;
  quotes_summary?: {
    open_count: number;
  };
  order?: {
    id: string;
    status: string;
    payment_status: string;
    total: number;
    currency: string;
  } | null;
  operator?: {
    slug: string;
    name: string;
    verified: boolean;
    headline?: string | null;
  } | null;
  deliverables?: Array<{
    id: string;
    title: string;
    status: string;
    version: number;
    data_product_id?: string | null;
    file_format?: string | null;
    download_ready?: boolean;
  }>;
  version: number;
}

export function createMissionsGetTool(railsClient: RailsClient): McpTool<typeof inputSchema, MissionWorkspace> {
  const toolName = "missions.get";
  const riskLevel = "R0";

  return {
    name: toolName,
    description: "Fetches one complete mission workspace with canonical order, operator, products, and deliverables.",
    riskLevel,
    parameters: inputSchema,
    execute: async (input: z.infer<typeof inputSchema>, context: TenantContext): Promise<McpSuccessResponse<MissionWorkspace> | McpErrorResponse> => {
      const start = performance.now();
      try {
        assertToolAllowed(toolName, riskLevel);

        const { data, requestId, durationMs } = await railsClient.get<MissionWorkspace>(
          `/missions/${encodeURIComponent(input.id)}`,
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
