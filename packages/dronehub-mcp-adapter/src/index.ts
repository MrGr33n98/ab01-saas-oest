export * from "./types.js";
export * from "./client/rails_client.js";
export * from "./client/errors.js";
export * from "./security/auth_context.js";
export * from "./security/tool_policy.js";
export * from "./observability/telemetry.js";
export * from "./registry.js";
export * from "./server.js";

import { createDroneHubMcpServer } from "./server.js";

// Auto-run if executed directly as entrypoint
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const adapter = createDroneHubMcpServer();
  adapter.startStdio().catch((err) => {
    console.error("Failed to start DroneHub MCP Server:", err);
    process.exit(1);
  });
}
