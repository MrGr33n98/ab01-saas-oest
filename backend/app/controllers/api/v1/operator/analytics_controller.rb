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
          render_data({
            plan: Entitlements::Resolver.new(current_organization).current_plan&.slug,
            profile_id: profile&.id,
            metrics: {
              jobs_visible: "—",
              quotes_submitted: "—",
              win_rate: "—",
              note: "Counters wire to aggregates when reporting tables exist"
            }
          })
        end
      end
    end
  end
end
