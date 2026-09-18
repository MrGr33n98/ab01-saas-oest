import { apiFetch } from "./client";
import type {
  AnalyticsOverviewResponse,
  AnalyticsFunnelResponse,
  AnalyticsWebhooksResponse,
} from "@/types/analytics";

type QueryParams = {
  startDate?: string;
  endDate?: string;
  orgId?: string;
  token?: string;
};

function buildQueryString(params?: QueryParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.startDate) query.set("start_date", params.startDate);
  if (params.endDate) query.set("end_date", params.endDate);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function getAnalyticsOverview(
  params?: QueryParams
): Promise<AnalyticsOverviewResponse> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsOverviewResponse>(`/analytics/overview${qs}`, {
    orgId: params?.orgId,
    token: params?.token,
  });
}

export async function getAnalyticsFunnel(
  params?: QueryParams
): Promise<AnalyticsFunnelResponse> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsFunnelResponse>(`/analytics/funnel${qs}`, {
    orgId: params?.orgId,
    token: params?.token,
  });
}

export async function getAnalyticsWebhooks(
  params?: QueryParams
): Promise<AnalyticsWebhooksResponse> {
  const qs = buildQueryString(params);
  return apiFetch<AnalyticsWebhooksResponse>(`/analytics/webhooks${qs}`, {
    orgId: params?.orgId,
    token: params?.token,
  });
}
