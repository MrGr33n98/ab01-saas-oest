# frozen_string_literal: true

module Api
  module V1
    module Operator
      module Fleet
        class DronesController < BaseController
          def index
            skip_authorization
            drones = Operators::Drone
              .where(organization_id: current_organization.id)
              .order(created_at: :desc)
            render_data(drones.map { |d| serialize(d) })
          end

          def create
            authorize authorize_context, Operators::Drone
            drone = Operators::Drone.new(drone_params.merge(organization_id: current_organization.id))
            if drone.save
              render_data(serialize(drone), status: :created)
            else
              render_error(status: 422, code: "DRONE_INVALID", title: "Validation error",
                           errors: drone.errors.map { |e| { field: e.attribute, message: e.message } })
            end
          end

          def update
            skip_authorization
            drone = Operators::Drone.find_by!(id: params[:id], organization_id: current_organization.id)
            if drone.update(drone_params)
              render_data(serialize(drone))
            else
              render_error(status: 422, code: "DRONE_INVALID", title: "Validation error",
                           errors: drone.errors.map { |e| { field: e.attribute, message: e.message } })
            end
          end

          def destroy
            skip_authorization
            drone = Operators::Drone.find_by!(id: params[:id], organization_id: current_organization.id)
            drone.update!(status: "retired")
            render json: { data: { id: drone.id, status: "retired" } }
          end

          private

          def drone_params
            params.permit(:manufacturer, :model, :serial_number, :registration_number,
                          :max_flight_minutes, :max_payload_grams, :status, :acquisition_date,
                          :notes)
          end

          def serialize(d)
            {
              id: d.id,
              manufacturer: d.manufacturer,
              model: d.model,
              serial_number: d.serial_number,
              registration_number: d.registration_number,
              status: d.status,
              max_flight_minutes: d.max_flight_minutes,
              max_payload_grams: d.max_payload_grams,
              acquisition_date: d.try(:acquisition_date)
            }
          end
        end
      end
    end
  end
end
