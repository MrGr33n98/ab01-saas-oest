import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAnalyticsOverview, getAnalyticsFunnel, getAnalyticsWebhooks } from "../analytics";
import * as client from "../client";

describe("Analytics API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls /analytics/overview with correct query parameters", async () => {
    const mockOverview = {
      period: { start_date: "2026-09-01", end_date: "2026-09-18" },
      organization_id: "org-123",
      summary: {
        missions_created: 10,
        missions_published: 8,
        quotes_created: 6,
        quotes_accepted: 5,
        orders_created: 5,
        orders_completed: 4,
        webhooks_succeeded: 20,
        webhooks_failed: 1,
      },
      time_series: {},
    };

    const spy = vi.spyOn(client, "apiFetch").mockResolvedValueOnce(mockOverview);

    const result = await getAnalyticsOverview({
      startDate: "2026-09-01",
      endDate: "2026-09-18",
      orgId: "org-123",
    });

    expect(spy).toHaveBeenCalledWith(
      "/analytics/overview?start_date=2026-09-01&end_date=2026-09-18",
      { orgId: "org-123", token: undefined }
    );
    expect(result.summary.missions_created).toBe(10);
    expect(result.summary.quotes_accepted).toBe(5);
  });

  it("calls /analytics/funnel with date parameters", async () => {
    const mockFunnel = {
      period: { start_date: "2026-09-01", end_date: "2026-09-18" },
      steps: [
        { step: "mission_created", count: 10, conversion_rate: 100 },
        { step: "mission_published", count: 8, conversion_rate: 80 },
        { step: "quote_accepted", count: 5, conversion_rate: 62.5 },
        { step: "order_created", count: 5, conversion_rate: 100 },
      ],
    };

    const spy = vi.spyOn(client, "apiFetch").mockResolvedValueOnce(mockFunnel);

    const result = await getAnalyticsFunnel({
      startDate: "2026-09-01",
      endDate: "2026-09-18",
    });

    expect(spy).toHaveBeenCalledWith(
      "/analytics/funnel?start_date=2026-09-01&end_date=2026-09-18",
      { orgId: undefined, token: undefined }
    );
    expect(result.steps).toHaveLength(4);
    expect(result.steps[1].conversion_rate).toBe(80);
  });

  it("calls /analytics/webhooks and returns health statistics", async () => {
    const mockWebhooks = {
      period: { start_date: "2026-09-01", end_date: "2026-09-18" },
      organization_id: "org-123",
      total_deliveries: 100,
      succeeded: 95,
      failed: 5,
      success_rate_percentage: 95.0,
    };

    const spy = vi.spyOn(client, "apiFetch").mockResolvedValueOnce(mockWebhooks);

    const result = await getAnalyticsWebhooks({
      startDate: "2026-09-01",
      endDate: "2026-09-18",
      orgId: "org-123",
    });

    expect(spy).toHaveBeenCalledWith(
      "/analytics/webhooks?start_date=2026-09-01&end_date=2026-09-18",
      { orgId: "org-123", token: undefined }
    );
    expect(result.total_deliveries).toBe(100);
    expect(result.success_rate_percentage).toBe(95.0);
  });
});
