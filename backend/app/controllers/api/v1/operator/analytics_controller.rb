# frozen_string_literal: true

module Api
  module V1
    module Operator
      class AnalyticsController < BaseController
        def show
          unless Entitlements::Resolver.enabled?(current_organization, "analytics.advanced") || current_user.platform_admin?
            return render_error(status: 402, code: "FEATURE_REQUIRED", title: "Analytics requires Pro+")
          end
          profile = Operators::OperatorProfile.find_by(organization_id: current_organization.id)
          overview = Telemetry::AnalyticsQueryService.overview(
            organization: current_organization,
            start_date: 30.days.ago.to_date,
            end_date: Date.current
          )

          summary = overview[:summary]
          submitted = summary[:quotes_created]
          accepted = summary[:quotes_accepted]
          win_rate = submitted.positive? ? ((accepted.to_f / submitted) * 100).round(1) : 0.0

          render_data({
            plan: Entitlements::Resolver.new(current_organization).current_plan&.slug,
            profile_id: profile&.id,
            metrics: {
              jobs_visible: summary[:missions_created],
              quotes_submitted: submitted,
              quotes_accepted: accepted,
              win_rate_percentage: win_rate,
              source: "telemetry_canonical"
            }
          })
        end
      end
    end
  end
end
