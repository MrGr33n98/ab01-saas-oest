import { McpErrorResponse } from "../types.js";

export class RailsApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code?: string, requestId?: string, details?: unknown) {
    super(message);
    this.name = "RailsApiError";
    this.status = status;
    this.code = code || `HTTP_${status}`;
    this.requestId = requestId;
    this.details = details;
  }
}

export function normalizeError(err: unknown, requestId?: string): McpErrorResponse {
  if (err instanceof RailsApiError) {
    return {
      error: {
        code: err.code,
        message: err.message,
        request_id: err.requestId || requestId,
        details: err.details,
      },
    };
  }

  if (err instanceof Error) {
    if (err.name === "AbortError" || err.message.includes("timeout")) {
      return {
        error: {
          code: "TIMEOUT",
          message: "Request to canonical Rails API timed out.",
          request_id: requestId,
        },
      };
    }

    if (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed")) {
      return {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Unable to connect to canonical Rails backend service.",
          request_id: requestId,
        },
      };
    }

    return {
      error: {
        code: "INTERNAL_ERROR",
        message: err.message,
        request_id: requestId,
      },
    };
  }

  return {
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred in the DroneHub MCP adapter.",
      request_id: requestId,
    },
  };
}
