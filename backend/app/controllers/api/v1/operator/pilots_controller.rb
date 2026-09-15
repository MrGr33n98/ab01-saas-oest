# frozen_string_literal: true

module Api
  module V1
    module Operator
      class PilotsController < BaseController
        def index
          skip_authorization
          pilots = Operators::Pilot.where(organization_id: current_organization.id).order(created_at: :desc)
          render_data(pilots.map { |p| serialize(p) })
        end

        def show
          skip_authorization
          pilot = Operators::Pilot.find_by!(id: params[:id], organization_id: current_organization.id)
          render_data(serialize(pilot))
        end

        def create
          skip_authorization
          pilot = Operators::Pilot.new(pilot_params.merge(organization_id: current_organization.id))
          if pilot.save
            render_data(serialize(pilot), status: :created)
          else
            render_error(status: 422, code: "PILOT_INVALID", title: "Validation error",
                         errors: pilot.errors.map { |e| { field: e.attribute, message: e.message } })
          end
        end

        def update
          skip_authorization
          pilot = Operators::Pilot.find_by!(id: params[:id], organization_id: current_organization.id)
          if pilot.update(pilot_params)
            render_data(serialize(pilot))
          else
            render_error(status: 422, code: "PILOT_INVALID", title: "Validation error",
                         errors: pilot.errors.map { |e| { field: e.attribute, message: e.message } })
          end
        end

        def destroy
          skip_authorization
          pilot = Operators::Pilot.find_by!(id: params[:id], organization_id: current_organization.id)
          pilot.destroy!
          render_data({ id: pilot.id, message: "Piloto removido" })
        end

        private

        def pilot_params
          params.permit(:full_name, :license_number, :anac_license, :phone, :email, :available, :flight_hours_logged)
        end

        def serialize(p)
          {
            id: p.id,
            full_name: p.full_name,
            license_number: p.license_number,
            anac_license: p.anac_license,
            phone: p.phone,
            email: p.email,
            verification_status: p.verification_status,
            available: p.available,
            flight_hours_logged: p.flight_hours_logged,
            created_at: p.created_at
          }
        end
      end
    end
  end
end
