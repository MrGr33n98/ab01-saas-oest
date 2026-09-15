# frozen_string_literal: true

module Api
  module V1
    module Admin
      class EntitlementsController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        # GET /api/v1/admin/feature_definitions
        def index
          render json: {
            data: FeatureDefinition.order(:category, :key).map { |f|
              { id: f.id, key: f.key, name: f.name, category: f.category, min_plan: f.min_plan, active: f.active }
            }
          }
        end

        # POST /api/v1/admin/organizations/:organization_id/entitlements
        def create
          org = Organization.find(params[:organization_id])
          ent = OrganizationEntitlement.find_or_initialize_by(
            organization_id: org.id,
            feature_key: params.require(:feature_key)
          )
          ent.enabled = params.fetch(:enabled, true)
          ent.expires_at = params[:expires_at]
          ent.source = "admin"
          ent.granted_by_id = current_user.id
          ent.note = params[:note]
          ent.save!
          render json: { data: { id: ent.id, feature_key: ent.feature_key, enabled: ent.enabled } }, status: :created
        end

        private
        # require_platform_admin! from AdminAuthorization
      end
    end
  end
end
