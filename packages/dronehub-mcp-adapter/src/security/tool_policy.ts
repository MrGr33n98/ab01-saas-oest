import { RiskLevel } from "../types.js";

const ALLOWED_RISK_LEVELS: ReadonlySet<RiskLevel> = new Set(["R0", "R1"]);

export class SecurityPolicyViolationError extends Error {
  public readonly code = "SECURITY_POLICY_VIOLATION";
  constructor(message: string) {
    super(message);
    this.name = "SecurityPolicyViolationError";
  }
}

export function assertToolAllowed(toolName: string, riskLevel: RiskLevel): void {
  if (!ALLOWED_RISK_LEVELS.has(riskLevel)) {
    throw new SecurityPolicyViolationError(
      `Execution of tool '${toolName}' with risk level '${riskLevel}' is blocked in DroneHub MCP V1. Only R0 (READ) and R1 (ANALYZE) are permitted.`
    );
  }
}
