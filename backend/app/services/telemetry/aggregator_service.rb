# frozen_string_literal: true

module Telemetry
  class AggregatorService
    METRIC_MAPPINGS = {
      "mission.created" => "missions.created_count",
      "mission.published" => "missions.published_count",
      "mission.completed" => "missions.completed_count",
      "quote.created" => "quotes.created_count",
      "quote.accepted" => "quotes.accepted_count",
      "quote.rejected" => "quotes.rejected_count",
      "order.created" => "orders.created_count",
      "order.completed" => "orders.completed_count",
      "order.cancelled" => "orders.cancelled_count",
      "webhook.delivery_succeeded" => "webhooks.success_count",
      "webhook.delivery_failed" => "webhooks.failure_count"
    }.freeze

    def self.aggregate_date(date = Date.current)
      new(date).call
    end

    def initialize(date = Date.current)
      @date = date.is_a?(String) ? Date.parse(date) : date
      @start_time = @date.beginning_of_day
      @end_time = @date.end_of_day
    end

    def call
      events_scope = TelemetryEvent.in_range(@start_time, @end_time)

      # 1. Tenant-level aggregation
      tenant_counts = events_scope
                      .where.not(organization_id: nil)
                      .group(:organization_id, :event_name)
                      .count

      tenant_counts.each do |(org_id, event_name), count|
        metric_name = METRIC_MAPPINGS[event_name] || "#{event_name}.count"

        metric = DailyTenantMetric.find_or_initialize_by(
          organization_id: org_id,
          date: @date,
          metric_name: metric_name
        )
        metric.value = count
        metric.metadata = { computed_at: Time.current.iso8601, source: "telemetry_events" }
        metric.save!
      end

      # 2. Platform-level aggregation
      platform_counts = events_scope
                        .group(:event_name)
                        .count

      platform_counts.each do |event_name, count|
        metric_name = METRIC_MAPPINGS[event_name] || "#{event_name}.count"

        metric = DailyPlatformMetric.find_or_initialize_by(
          date: @date,
          metric_name: metric_name
        )
        metric.value = count
        metric.metadata = { computed_at: Time.current.iso8601, source: "telemetry_events" }
        metric.save!
      end

      {
        date: @date,
        tenant_metrics_count: tenant_counts.size,
        platform_metrics_count: platform_counts.size
      }
    end
  end
end
