import { RailsClient } from "./client/rails_client.js";
import { McpTool } from "./types.js";
import { createAnalyticsOverviewTool } from "./tools/analytics/get_overview.js";
import { createAnalyticsFunnelTool } from "./tools/analytics/get_funnel.js";
import { createAnalyticsWebhooksHealthTool } from "./tools/analytics/get_webhooks_health.js";
import { createMissionsSearchTool } from "./tools/missions/search.js";
import { createMissionsGetTool } from "./tools/missions/get.js";
import { createOperatorsSearchTool } from "./tools/operators/search.js";
import { createMatchingFindCandidatesTool } from "./tools/matching/find_candidates.js";
import { createMatchingExplainCandidateTool } from "./tools/matching/explain_candidate.js";
import { createQuotesGetComparisonTool } from "./tools/quotes/get_comparison.js";

export function createToolRegistry(railsClient: RailsClient): Map<string, McpTool<any, any>> {
  const tools = [
    createAnalyticsOverviewTool(railsClient),
    createAnalyticsFunnelTool(railsClient),
    createAnalyticsWebhooksHealthTool(railsClient),
    createMissionsSearchTool(railsClient),
    createMissionsGetTool(railsClient),
    createOperatorsSearchTool(railsClient),
    createMatchingFindCandidatesTool(railsClient),
    createMatchingExplainCandidateTool(railsClient),
    createQuotesGetComparisonTool(railsClient),
  ];

  const registry = new Map<string, McpTool<any, any>>();
  for (const tool of tools) {
    registry.set(tool.name, tool);
  }
  return registry;
}
