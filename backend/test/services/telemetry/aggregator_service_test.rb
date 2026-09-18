# frozen_string_literal: true

require "test_helper"

class TelemetryAggregatorServiceTest < ActiveSupport::TestCase
  def setup
    @organization = Organization.create!(
      name: "Aggregator Test Org",
      slug: "aggregator-test-#{SecureRandom.hex(4)}",
      organization_type: "customer",
      country_code: "BR",
      status: "active"
    )

    @date = Date.current

    # Create telemetry events for today
    3.times do
      TelemetryEvent.create!(
        organization: @organization,
        event_name: "mission.created",
        source: "web",
        occurred_at: Time.current,
        received_at: Time.current
      )
    end

    2.times do
      TelemetryEvent.create!(
        organization: @organization,
        event_name: "quote.accepted",
        source: "web",
        occurred_at: Time.current,
        received_at: Time.current
      )
    end
  end

  test "aggregates daily tenant and platform metrics accurately" do
    result = Telemetry::AggregatorService.aggregate_date(@date)

    assert_equal @date, result[:date]

    # Verify tenant metrics
    mission_metric = DailyTenantMetric.find_by(
      organization: @organization,
      date: @date,
      metric_name: "missions.created_count"
    )
    assert_not_nil mission_metric
    assert_equal 3, mission_metric.value

    quote_metric = DailyTenantMetric.find_by(
      organization: @organization,
      date: @date,
      metric_name: "quotes.accepted_count"
    )
    assert_not_nil quote_metric
    assert_equal 2, quote_metric.value

    # Verify platform metric
    platform_metric = DailyPlatformMetric.find_by(
      date: @date,
      metric_name: "missions.created_count"
    )
    assert_not_nil platform_metric
    assert_equal 3, platform_metric.value
  end

  test "is idempotent on repeated runs for the same date" do
    Telemetry::AggregatorService.aggregate_date(@date)
    initial_tenant_count = DailyTenantMetric.count

    # Second run should update in-place without adding duplicate rows
    Telemetry::AggregatorService.aggregate_date(@date)
    assert_equal initial_tenant_count, DailyTenantMetric.count
  end
end
