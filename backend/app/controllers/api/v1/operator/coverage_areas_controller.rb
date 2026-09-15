# frozen_string_literal: true

module Api
  module V1
    module Operator
      class CoverageAreasController < BaseController
        def index
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          areas = Operators::CoverageArea.where(operator_profile_id: profile.id, active: true)
          render json: {
            data: areas.map { |a|
              {
                id: a.id,
                name: a.name,
                country_code: a.country_code,
                state_code: a.state_code,
                city: a.city,
                active: a.active
              }
            }
          }
        end

        def create
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          area = Operators::CoverageArea.new(
            coverage_params.merge(
              operator_profile_id: profile.id,
              active: true,
              country_code: coverage_params[:country_code].presence || "BR"
            )
          )
          if area.save
            render json: {
              data: {
                id: area.id,
                name: area.name,
                state_code: area.state_code,
                city: area.city
              }
            }, status: :created
          else
            render json: { title: "Validation", detail: area.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def destroy
          profile = Operators::OperatorProfile.find_by!(organization_id: current_organization.id)
          area = Operators::CoverageArea.find_by!(id: params[:id], operator_profile_id: profile.id)
          area.destroy!
          render json: { data: { id: area.id, message: "Área removida" } }
        end

        private

        def coverage_params
          params.require(:coverage_area).permit(:name, :country_code, :state_code, :city)
        end
      end
    end
  end
end
