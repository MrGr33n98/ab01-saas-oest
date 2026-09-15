# frozen_string_literal: true

module Api
  module V1
    module Operator
      # GET /api/v1/operator/missions — missions assigned to this operator
      # GET /api/v1/operator/missions/:id — mission detail for operator
      class MissionsController < BaseController
        def index
          skip_authorization
          missions = Missions::Mission
            .where(operator_organization_id: current_organization.id)
            .where.not(status: %w[draft published quoting cancelled])
            .order(updated_at: :desc)
            .limit(params.fetch(:limit, 50).to_i.clamp(1, 100))

          render_data(missions.map { |m| serialize_summary(m) })
        end

        def show
          skip_authorization
          mission = Missions::Mission.find_by!(
            id: params[:id],
            operator_organization_id: current_organization.id
          )
          products = mission.mission_products.includes(:data_product).map do |mp|
            {
              data_product_id: mp.data_product_id,
              quantity: mp.quantity,
              name: mp.data_product&.name,
              slug: mp.data_product&.slug
            }
          end

          render_data(serialize_summary(mission).merge(
            description: mission.description,
            products: products,
            geometry_present: mission.geometry.present? || mission.area_hectares.present?
          ))
        end

        private

        def serialize_summary(m)
          {
            id: m.id,
            title: m.title,
            status: m.status,
            mission_type: m.mission_type,
            area_hectares: m.area_hectares,
            deadline_at: m.deadline_at,
            preferred_start_at: m.preferred_start_at,
            currency: m.currency,
            customer_organization_id: m.organization_id
          }
        end
      end
    end
  end
end
