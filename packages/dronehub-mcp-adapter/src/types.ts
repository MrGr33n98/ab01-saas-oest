import { z } from "zod";

export type RiskLevel = "R0" | "R1";

export interface TenantContext {
  token: string;
  organizationId?: string;
  userId?: string;
  correlationId?: string;
}

export interface McpResponseMeta {
  request_id?: string;
  correlation_id?: string;
  duration_ms?: number;
  pagination?: {
    total?: number;
    page?: number;
    per_page?: number;
    has_more?: boolean;
  };
}

export interface McpSuccessResponse<T> {
  data: T;
  meta?: McpResponseMeta;
}

export interface McpErrorPayload {
  code: string;
  message: string;
  request_id?: string;
  details?: unknown;
}

export interface McpErrorResponse {
  error: McpErrorPayload;
}

export interface McpTool<TParams extends z.ZodTypeAny, TResult> {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  parameters: TParams;
  execute: (input: z.infer<TParams>, context: TenantContext) => Promise<McpSuccessResponse<TResult> | McpErrorResponse>;
}
