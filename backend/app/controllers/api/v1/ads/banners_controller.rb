# frozen_string_literal: true

module Api
  module V1
    module Ads
      class BannersController < BaseController
        skip_before_action :authenticate_user!, only: %i[index track]
        skip_before_action :resolve_organization!, only: %i[index track]

        # GET /api/v1/ads/banners?placement=category.top&category=mapping
        def index
          audience = current_user ? audience_for(current_user) : "anonymous"
          data = ::Ads::ServeBanners.call(
            placement_key: params.require(:placement),
            category_slug: params[:category],
            audience: audience,
            limit: params.fetch(:limit, 1)
          )
          render_data(data)
        rescue ActionController::ParameterMissing
          render_error(status: 400, code: "BAD_REQUEST", title: "placement required")
        end

        # POST /api/v1/ads/banners/:id/track
        # { event_type: impression|click, placement: "...", page_path, category_slug, session_id }
        def track
          banner = ::Ads::Banner.find(params[:id])
          event_type = params.require(:event_type)
          raise ActionController::ParameterMissing, "event_type" unless %w[impression click].include?(event_type)

          placement = ::Ads::BannerPlacement.find_by(key: params[:placement]) if params[:placement].present?

          ::Ads::BannerEvent.create!(
            banner_id: banner.id,
            banner_placement_id: placement&.id,
            event_type: event_type,
            user_id: current_user&.id,
            organization_id: current_organization&.id,
            page_path: params[:page_path].to_s.truncate(500),
            category_slug: params[:category_slug],
            session_id: params[:session_id].to_s.truncate(100),
            request_id: request.headers["X-Request-Id"],
            occurred_at: Time.current,
            meta: {}
          )

          if event_type == "impression"
            ::Ads::Banner.where(id: banner.id).update_all("impression_count = impression_count + 1")
          else
            ::Ads::Banner.where(id: banner.id).update_all("click_count = click_count + 1")
          end

          head :no_content
        rescue ActiveRecord::RecordNotFound
          render_error(status: 404, code: "NOT_FOUND", title: "Banner not found")
        rescue ActionController::ParameterMissing => e
          render_error(status: 400, code: "BAD_REQUEST", title: e.message)
        end

        private

        def audience_for(user)
          # Best-effort: if any membership is drone_operator org
          if user.respond_to?(:organization_memberships)
            types = Organization.joins(:organization_memberships)
              .where(organization_memberships: { user_id: user.id, status: "active" })
              .distinct
              .pluck(:organization_type)
            return "operator" if types.include?("drone_operator")
            return "customer" if types.include?("customer")
          end
          "customer"
        rescue StandardError
          "anonymous"
        end

        def render_data(data, status: :ok, meta: {})
          render json: {
            data: data,
            meta: meta.merge(request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid)
          }, status: status
        end

        def render_error(status:, code:, title:, detail: nil)
          render json: {
            type: "https://api.dronehub.example/problems/#{code.downcase.tr('_', '-')}",
            title: title,
            status: status,
            code: code,
            detail: detail,
            request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid
          }, status: status
        end
      end
    end
  end
end
