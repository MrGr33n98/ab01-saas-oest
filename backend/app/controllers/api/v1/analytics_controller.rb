# frozen_string_literal: true

module Api
  module V1
    class AnalyticsController < BaseController
      def overview
        authorize :analytics, :overview?, policy_class: AnalyticsPolicy

        start_date = params[:start_date].presence || 30.days.ago.to_date
        end_date = params[:end_date].presence || Date.current

        data = Telemetry::AnalyticsQueryService.overview(
          organization: current_organization,
          start_date: start_date,
          end_date: end_date
        )

        render_data(data)
      end

      def funnel
        authorize :analytics, :funnel?, policy_class: AnalyticsPolicy

        start_date = params[:start_date].presence || 30.days.ago.to_date
        end_date = params[:end_date].presence || Date.current

        data = Telemetry::AnalyticsQueryService.funnel(
          organization: current_organization,
          start_date: start_date,
          end_date: end_date
        )

        render_data(data)
      end

      def webhooks
        authorize :analytics, :webhooks?, policy_class: AnalyticsPolicy

        start_date = params[:start_date].presence || 30.days.ago.to_date
        end_date = params[:end_date].presence || Date.current

        data = Telemetry::AnalyticsQueryService.webhooks_health(
          organization: current_organization,
          start_date: start_date,
          end_date: end_date
        )

        render_data(data)
      end
    end
  end
end
