import { TenantContext } from "../types.js";
import { RailsApiError } from "./errors.js";

export interface RailsClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class RailsClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options: RailsClientOptions = {}) {
    this.baseUrl = (options.baseUrl || process.env.RAILS_API_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  public async get<T>(
    path: string,
    params: Record<string, string | number | boolean | undefined> = {},
    context: TenantContext
  ): Promise<{ data: T; requestId: string; durationMs: number }> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }

    const requestId = crypto.randomUUID();
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    };

    if (context.token) {
      headers["Authorization"] = `Bearer ${context.token}`;
    }

    if (context.organizationId) {
      headers["X-Organization-Id"] = context.organizationId;
    }

    if (context.correlationId) {
      headers["X-Correlation-Id"] = context.correlationId;
    }

    const start = performance.now();
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const durationMs = Math.round(performance.now() - start);

        if (response.ok) {
          const body = (await response.json()) as { data: T } | T;
          const data = (body && typeof body === "object" && "data" in body) ? (body as { data: T }).data : (body as T);
          return { data, requestId, durationMs };
        }

        // Handle Non-2xx
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch {
          // ignore non-json response
        }

        const message = errorBody?.error?.message || errorBody?.errors?.[0]?.message || errorBody?.detail || response.statusText;
        const code = errorBody?.error?.code || `HTTP_${response.status}`;

        // Never retry client-side policy errors (401, 403, 404, 422)
        if ([401, 403, 404, 422].includes(response.status)) {
          throw new RailsApiError(response.status, message, code, requestId, errorBody);
        }

        // Retry rate limit (429) if Retry-After is specified and within limit
        if (response.status === 429 && attempt < this.maxRetries) {
          const retryAfterSec = parseInt(response.headers.get("Retry-After") || "1", 10);
          await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterSec * 1000, 3000)));
          attempt++;
          continue;
        }

        // Retry transient server errors (502, 503, 504)
        if ([502, 503, 504].includes(response.status) && attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
          attempt++;
          continue;
        }

        throw new RailsApiError(response.status, message, code, requestId, errorBody);
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof RailsApiError) {
          throw err;
        }

        // Retry on network abort/timeout if attempts remaining
        if (attempt < this.maxRetries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          continue;
        }

        throw err;
      }
    }

    throw new RailsApiError(504, "Max retries exceeded connecting to canonical Rails API", "GATEWAY_TIMEOUT", requestId);
  }
}
