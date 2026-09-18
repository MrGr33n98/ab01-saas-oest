# frozen_string_literal: true

require "test_helper"

class AnalyticsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @org_a = create_test_org(name: "Org Alpha Analytics #{SecureRandom.hex(4)}")
    @org_b = create_test_org(name: "Org Beta Analytics #{SecureRandom.hex(4)}")

    @date = Date.current

    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "missions.created_count", value: 15)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "missions.published_count", value: 10)
    DailyTenantMetric.create!(organization: @org_b, date: @date, metric_name: "missions.created_count", value: 99)
  end

  test "AnalyticsQueryService returns tenant A metrics isolated from tenant B" do
    data = Telemetry::AnalyticsQueryService.overview(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    assert_equal 15, data[:summary][:missions_created]
    assert_equal 10, data[:summary][:missions_published]

    # Check Org B
    data_b = Telemetry::AnalyticsQueryService.overview(
      organization: @org_b,
      start_date: @date,
      end_date: @date
    )
    assert_equal 99, data_b[:summary][:missions_created]
    assert_equal 0, data_b[:summary][:missions_published]
  end

  test "conversion funnel returns computed step metrics" do
    funnel = Telemetry::AnalyticsQueryService.funnel(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    steps = funnel[:steps]
    created = steps.find { |s| s[:step] == "mission_created" }
    published = steps.find { |s| s[:step] == "mission_published" }

    assert_equal 15, created[:count]
    assert_equal 10, published[:count]
    assert_equal 66.67, published[:conversion_rate]
  end

  test "webhooks health endpoint aggregates success and failure counts" do
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "webhooks.success_count", value: 45)
    DailyTenantMetric.create!(organization: @org_a, date: @date, metric_name: "webhooks.failure_count", value: 5)

    health = Telemetry::AnalyticsQueryService.webhooks_health(
      organization: @org_a,
      start_date: @date,
      end_date: @date
    )

    assert_equal 50, health[:total_deliveries]
    assert_equal 45, health[:succeeded]
    assert_equal 5, health[:failed]
    assert_equal 90.0, health[:success_rate_percentage]
  end
end
