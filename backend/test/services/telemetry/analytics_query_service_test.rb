# frozen_string_literal: true

require "test_helper"

class TelemetryAnalyticsQueryServiceTest < ActiveSupport::TestCase
  def setup
    @org_a = Organization.create!(
      name: "Tenant A Org",
      slug: "tenant-a-#{SecureRandom.hex(4)}",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )

    @org_b = Organization.create!(
      name: "Tenant B Org",
      slug: "tenant-b-#{SecureRandom.hex(4)}",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )

    @date = Date.current

    # Org A metrics
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "missions.created_count", value: 10)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "missions.published_count", value: 8)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "quotes.accepted_count", value: 6)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "orders.created_count", value: 6)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "webhooks.success_count", value: 95)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "webhooks.failure_count", value: 5)

    # Org B metrics
    DailyTenantMetric.create!(organization: @org_b, date: @date, metric_name: "missions.created_count", value: 50)
  end

  test "returns scoped overview for tenant without leaking another tenant's metrics" do
    overview = Telemetry::AnalyticsQueryService.overview(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    assert_equal 10, overview[:summary][:missions_created]
    assert_equal 8, overview[:summary][:missions_published]
    assert_equal 6, overview[:summary][:quotes_accepted]
    assert_equal 6, overview[:summary][:orders_created]
  end

  test "calculates funnel conversion rates accurately" do
    funnel = Telemetry::AnalyticsQueryService.funnel(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    steps = funnel[:steps]
    assert_equal 4, steps.size

    step_created = steps.find { |s| s[:step] == "mission_created" }
    step_published = steps.find { |s| s[:step] == "mission_published" }
    step_accepted = steps.find { |s| s[:step] == "quote_accepted" }

    assert_equal 10, step_created[:count]
    assert_equal 8, step_published[:count]
    assert_equal 80.0, step_published[:conversion_rate]
    assert_equal 6, step_accepted[:count]
    assert_equal 75.0, step_accepted[:conversion_rate]
  end

  test "calculates webhook delivery health accurately" do
    health = Telemetry::AnalyticsQueryService.webhooks_health(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    assert_equal 100, health[:total_deliveries]
    assert_equal 95, health[:succeeded]
    assert_equal 5, health[:failed]
    assert_equal 95.0, health[:success_rate_percentage]
  end
end
