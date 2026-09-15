# frozen_string_literal: true

module Api
  module V1
    module Marketplace
      class OperatorsController < BaseController
        skip_before_action :resolve_organization!, only: %i[index show]
        skip_before_action :authenticate_user!, only: %i[index show]

        def index
          scope = Operators::OperatorProfile
            .where(searchable: true, accepting_jobs: true, verification_status: "verified")
            .includes(:organization)

          if params.dig(:filter, :min_rating).present?
            scope = scope.where("rating_count > 0 AND rating_average >= ?", params.dig(:filter, :min_rating).to_f)
          end

          if params.dig(:filter, :service).present?
            cat = ::Marketplace::ServiceCategory.find_by(slug: params.dig(:filter, :service))
            if cat
              ids = ::Marketplace::ServiceOffering.where(service_category_id: cat.id, active: true).select(:operator_profile_id)
              scope = scope.where(id: ids)
            end
          end

          if params.dig(:filter, :state).present?
            ids = Operators::CoverageArea.where(active: true, state_code: params.dig(:filter, :state)).select(:operator_profile_id)
            scope = scope.where(id: ids)
          end

          limit = params.fetch(:limit, 25).to_i.clamp(1, 100)
          operators = scope
            .order(Arel.sql("CASE WHEN rating_count > 0 THEN 0 ELSE 1 END"))
            .order(rating_average: :desc)
            .order(:slug)
            .limit(limit)

          render_data(operators.map { |p| serialize_card(p) })
        end

        def show
          payload = ::Marketplace::OperatorProfileQuery.call(slug: params[:slug])
          render_data(payload)
        rescue ActiveRecord::RecordNotFound
          render_error(status: 404, code: "NOT_FOUND", title: "Operator not found")
        end

        private

        def serialize_card(profile)
          org = profile.organization
          {
            id: profile.id,
            slug: profile.slug,
            headline: profile.headline,
            verification_status: profile.verification_status,
            verified: profile.verification_status == "verified",
            rating_average: profile.rating_count.to_i.positive? ? profile.rating_average&.to_f : nil,
            rating_count: profile.rating_count.to_i,
            missions_completed: profile.missions_completed.to_i,
            response_time_minutes: profile.response_time_minutes,
            accepting_jobs: profile.accepting_jobs,
            organization_name: org&.name,
            city: org&.city,
            state_code: org&.state_code,
            logo_url: logo_url_for(org)
          }
        end

        def logo_url_for(org)
          return nil unless org&.logo_asset_id
          asset = Deliverables::Asset.find_by(id: org.logo_asset_id)
          return nil unless asset
          Integrations::Storage::S3Presigner.new.public_object_url(asset.storage_key)
        rescue StandardError
          nil
        end

        def render_data(data, status: :ok, meta: {})
          render json: {
            data: data,
            meta: meta.merge(request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid)
          }, status: status
        end

        def render_error(status:, code:, title:, detail: nil, errors: nil)
          body = {
            type: "https://api.dronehub.example/problems/#{code.downcase.tr('_', '-')}",
            title: title,
            status: status,
            code: code,
            detail: detail,
            request_id: request.headers["X-Request-Id"].presence || SecureRandom.uuid
          }
          body[:errors] = errors if errors
          render json: body, status: status
        end
      end
    end
  end
end
