export type AnalyticsPeriod = {
  start_date: string;
  end_date: string;
};

export type AnalyticsSummary = {
  missions_created: number;
  missions_published: number;
  quotes_created: number;
  quotes_accepted: number;
  orders_created: number;
  orders_completed: number;
  webhooks_succeeded: number;
  webhooks_failed: number;
};

export type AnalyticsOverviewResponse = {
  period: AnalyticsPeriod;
  organization_id?: string;
  summary: AnalyticsSummary;
  time_series: Record<string, Record<string, number>>;
};

export type FunnelStep = {
  step: "mission_created" | "mission_published" | "quote_accepted" | "order_created" | string;
  count: number;
  conversion_rate: number;
};

export type AnalyticsFunnelResponse = {
  period: AnalyticsPeriod;
  steps: FunnelStep[];
};

export type AnalyticsWebhooksResponse = {
  period: AnalyticsPeriod;
  organization_id?: string;
  total_deliveries: number;
  succeeded: number;
  failed: number;
  success_rate_percentage: number;
};

export type DateRangeOption = "7d" | "30d" | "90d";
