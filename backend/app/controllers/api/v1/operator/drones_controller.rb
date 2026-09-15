# frozen_string_literal: true

module Api
  module V1
    module Operator
      class DronesController < BaseController
        def index
          drones = Operators::Drone.where(organization_id: current_organization.id).order(:created_at)
          render json: { data: drones.map { |d| serialize(d) } }
        end

        def create
          drone = Operators::Drone.new(drone_params.merge(organization_id: current_organization.id, status: "active"))
          if drone.save
            render json: { data: serialize(drone) }, status: :created
          else
            render json: { title: "Validation", detail: drone.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def update
          drone = Operators::Drone.where(organization_id: current_organization.id).find(params[:id])
          if drone.update(drone_params)
            render json: { data: serialize(drone) }
          else
            render json: { title: "Validation", detail: drone.errors.full_messages.join(", "), status: 422 }, status: 422
          end
        end

        def destroy
          drone = Operators::Drone.where(organization_id: current_organization.id).find(params[:id])
          drone.update!(status: "retired")
          render json: { data: serialize(drone) }
        end

        private

        def drone_params
          params.require(:drone).permit(:manufacturer, :model, :aircraft_type, :weight_class, :serial_number, :status)
        end

        def serialize(d)
          {
            id: d.id,
            manufacturer: d.manufacturer,
            model: d.model,
            aircraft_type: d.aircraft_type,
            weight_class: d.weight_class,
            status: d.status
          }
        end
      end
    end
  end
end
