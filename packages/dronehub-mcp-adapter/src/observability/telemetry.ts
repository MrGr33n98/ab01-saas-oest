import { RiskLevel, TenantContext } from "../types.js";

export interface ToolExecutionLog {
  tool: string;
  risk_level: RiskLevel;
  organization_id?: string;
  user_id?: string;
  request_id?: string;
  correlation_id?: string;
  duration_ms: number;
  status: "success" | "error";
  error_code?: string;
  error_class?: string;
}

export function logToolExecution(entry: ToolExecutionLog): void {
  // Redact any potentially sensitive info - keep high-signal telemetry log
  const sanitized = {
    timestamp: new Date().toISOString(),
    event: "mcp.tool_execution",
    tool: entry.tool,
    risk_level: entry.risk_level,
    organization_id: entry.organization_id || "unspecified",
    user_id: entry.user_id || "anonymous",
    request_id: entry.request_id || "none",
    correlation_id: entry.correlation_id || "none",
    duration_ms: entry.duration_ms,
    status: entry.status,
    error_code: entry.error_code,
    error_class: entry.error_class,
  };

  // Structured JSON stdout log for collector integration
  console.log(JSON.stringify(sanitized));
}
