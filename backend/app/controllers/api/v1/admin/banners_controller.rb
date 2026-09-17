# frozen_string_literal: true

module Api
  module V1
    module Admin
      class BannersController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          scope = ::Ads::Banner.order(updated_at: :desc)
          scope = scope.where(status: params[:status]) if params[:status].present?
          render_data(scope.limit(100).map { |b| serialize(b) })
        end

        def show
          banner = ::Ads::Banner.find(params[:id])
          render_data(serialize(banner, detailed: true))
        end

        def create
          banner = ::Ads::Banner.new(banner_params)
          banner.created_by_id = current_user.id
          banner.status = params.dig(:banner, :status).presence || "draft"
          if banner.save
            sync_placements!(banner)
            render_data(serialize(banner, detailed: true), status: :created)
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid banner", detail: banner.errors.full_messages.join(", "))
          end
        end

        def update
          banner = ::Ads::Banner.find(params[:id])
          if banner.update(banner_params)
            sync_placements!(banner) if params.dig(:banner, :placement_keys)
            render_data(serialize(banner, detailed: true))
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid banner", detail: banner.errors.full_messages.join(", "))
          end
        end

        def destroy
          banner = ::Ads::Banner.find(params[:id])
          banner.update!(status: "ended")
          render_data(serialize(banner))
        end

        def placements
          ::Ads::BannerPlacement.seed_catalog!
          render_data(::Ads::BannerPlacement.order(:page_context, :key).map { |p|
            {
              id: p.id,
              key: p.key,
              name: p.name,
              page_context: p.page_context,
              width_hint: p.width_hint,
              height_hint: p.height_hint,
              active: p.active
            }
          })
        end

        private
        # require_platform_admin! from AdminAuthorization

        def banner_params
          params.require(:banner).permit(
            :name, :status, :format_type, :eyebrow, :title, :subtitle, :cta_label, :cta_url, :image_url,
            :background_color, :text_color, :starts_at, :ends_at, :priority, :weight,
            :target_audience, :geo_scope, :organization_id,
            targeting: { category_slugs: [], states: [] }
          )
        end

        def sync_placements!(banner)
          keys = Array(params.dig(:banner, :placement_keys)).map(&:to_s)
          return if keys.nil? && !params.dig(:banner)&.key?(:placement_keys)

          ::Ads::BannerPlacement.seed_catalog!
          placement_ids = ::Ads::BannerPlacement.where(key: keys).pluck(:id)
          banner.banner_placement_assignments.where.not(banner_placement_id: placement_ids).delete_all
          placement_ids.each do |pid|
            ::Ads::BannerPlacementAssignment.find_or_create_by!(banner_id: banner.id, banner_placement_id: pid) do |a|
              a.active = true
            end
          end
        end

        def serialize(banner, detailed: false)
          h = {
            id: banner.id,
            name: banner.name,
            status: banner.status,
            format_type: banner.format_type,
            eyebrow: banner.eyebrow,
            title: banner.title,
            subtitle: banner.subtitle,
            cta_label: banner.cta_label,
            cta_url: banner.cta_url,
            image_url: banner.image_url,
            background_color: banner.background_color,
            text_color: banner.text_color,
            starts_at: banner.starts_at,
            ends_at: banner.ends_at,
            priority: banner.priority,
            weight: banner.weight,
            target_audience: banner.target_audience,
            geo_scope: banner.geo_scope,
            targeting: banner.targeting,
            impression_count: banner.impression_count,
            click_count: banner.click_count,
            updated_at: banner.updated_at
          }
          if detailed
            h[:placement_keys] = banner.placements.pluck(:key)
            h[:ctr] = banner.impression_count.positive? ? (banner.click_count.to_f / banner.impression_count).round(4) : 0
          end
          h
        end

        def render_data(data, status: :ok)
          render json: { data: data, meta: { request_id: request.headers["X-Request-Id"] || SecureRandom.uuid } }, status: status
        end

        def render_error(status:, code:, title:, detail: nil)
          render json: {
            type: "https://api.dronehub.example/problems/#{code.downcase}",
            title: title, status: status, code: code, detail: detail,
            request_id: request.headers["X-Request-Id"] || SecureRandom.uuid
          }, status: status
        end
      end
    end
  end
end
