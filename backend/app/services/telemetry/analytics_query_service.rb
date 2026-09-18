# frozen_string_literal: true

module Telemetry
  class AnalyticsQueryService
    def self.overview(organization: nil, start_date: 30.days.ago.to_date, end_date: Date.current)
      new(organization: organization, start_date: start_date, end_date: end_date).overview
    end

    def self.funnel(organization: nil, start_date: 30.days.ago.to_date, end_date: Date.current)
      new(organization: organization, start_date: start_date, end_date: end_date).funnel
    end

    def self.webhooks_health(organization: nil, start_date: 30.days.ago.to_date, end_date: Date.current)
      new(organization: organization, start_date: start_date, end_date: end_date).webhooks_health
    end

    def initialize(organization: nil, start_date: 30.days.ago.to_date, end_date: Date.current)
      @organization = organization
      @start_date = start_date.is_a?(String) ? Date.parse(start_date) : start_date
      @end_date = end_date.is_a?(String) ? Date.parse(end_date) : end_date
    end

    def overview
      metrics_scope = if @organization
                        DailyTenantMetric.for_organization(@organization.id).for_period(@start_date, @end_date)
                      else
                        DailyPlatformMetric.for_period(@start_date, @end_date)
                      end

      grouped = metrics_scope.group(:metric_name).sum(:value)

      {
        period: { start_date: @start_date, end_date: @end_date },
        organization_id: @organization&.id,
        summary: {
          missions_created: grouped["missions.created_count"] || 0,
          missions_published: grouped["missions.published_count"] || 0,
          quotes_created: grouped["quotes.created_count"] || 0,
          quotes_accepted: grouped["quotes.accepted_count"] || 0,
          orders_created: grouped["orders.created_count"] || 0,
          orders_completed: grouped["orders.completed_count"] || 0,
          webhooks_succeeded: grouped["webhooks.success_count"] || 0,
          webhooks_failed: grouped["webhooks.failure_count"] || 0
        },
        time_series: build_time_series(metrics_scope)
      }
    end

    def funnel
      ov = overview[:summary]
      created = ov[:missions_created]
      published = ov[:missions_published]
      accepted = ov[:quotes_accepted]
      orders = ov[:orders_created]

      {
        period: { start_date: @start_date, end_date: @end_date },
        steps: [
          { step: "mission_created", count: created, conversion_rate: 100.0 },
          {
            step: "mission_published",
            count: published,
            conversion_rate: created.positive? ? ((published.to_f / created) * 100).round(2) : 0.0
          },
          {
            step: "quote_accepted",
            count: accepted,
            conversion_rate: published.positive? ? ((accepted.to_f / published) * 100).round(2) : 0.0
          },
          {
            step: "order_created",
            count: orders,
            conversion_rate: accepted.positive? ? ((orders.to_f / accepted) * 100).round(2) : 0.0
          }
        ]
      }
    end

    def webhooks_health
      ov = overview[:summary]
      succeeded = ov[:webhooks_succeeded]
      failed = ov[:webhooks_failed]
      total = succeeded + failed

      success_rate = total.positive? ? ((succeeded.to_f / total) * 100).round(2) : 100.0

      {
        period: { start_date: @start_date, end_date: @end_date },
        organization_id: @organization&.id,
        total_deliveries: total,
        succeeded: succeeded,
        failed: failed,
        success_rate_percentage: success_rate
      }
    end

    private

    def build_time_series(scope)
      scope.chronological.group_by(&:date).transform_values do |records|
        records.each_with_object({}) { |r, h| h[r.metric_name] = r.value }
      end
    end
  end
end
