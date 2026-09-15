# frozen_string_literal: true

module Api
  module V1
    module Admin
      class VerificationsController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          pending_profiles = Operators::OperatorProfile
                             .where(verification_status: "pending")
                             .includes(:organization)
                             .order(created_at: :asc)

          render_data(pending_profiles.map { |p|
            {
              id: p.id,
              slug: p.slug,
              headline: p.headline,
              verification_status: p.verification_status,
              created_at: p.created_at,
              organization: {
                id: p.organization&.id,
                name: p.organization&.name,
                legal_name: p.organization&.legal_name,
                tax_id: p.organization&.tax_id,
                city: p.organization&.city,
                state_code: p.organization&.state_code
              }
            }
          })
        end
      end
    end
  end
end
