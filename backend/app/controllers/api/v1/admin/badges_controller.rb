# frozen_string_literal: true

module Api
  module V1
    module Admin
      class BadgesController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          render json: {
            data: VerificationBadge.order(:position).map { |b|
              { id: b.id, key: b.key, name: b.name, name_en: b.name_en, icon: b.icon, active: b.active }
            }
          }
        end

        def grant
          profile = Operators::OperatorProfile.find(params[:operator_profile_id])
          badge = VerificationBadge.find(params[:verification_badge_id] || params[:badge_id])
          ob = Operators::OperatorBadge.find_or_initialize_by(
            operator_profile_id: profile.id,
            verification_badge_id: badge.id
          )
          ob.granted_by_id = current_user.id
          ob.granted_at = Time.current
          ob.status = "active"
          ob.note = params[:note]
          ob.save!
          render json: { data: { operator_badge_id: ob.id, badge: badge.key } }, status: :created
        end

        def revoke
          ob = Operators::OperatorBadge.find(params[:id])
          ob.update!(status: "revoked")
          render json: { data: { id: ob.id, status: ob.status } }
        end

        private
        # require_platform_admin! from AdminAuthorization
      end
    end
  end
end
