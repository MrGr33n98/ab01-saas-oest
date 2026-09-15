# frozen_string_literal: true

module Api
  module V1
    module Operator
      module Fleet
        class PayloadsController < BaseController
          def index
            skip_authorization
            payloads = Operators::Payload
              .where(organization_id: current_organization.id)
              .order(created_at: :desc)
            render_data(payloads.map { |p| serialize(p) })
          end

          def create
            skip_authorization
            payload = Operators::Payload.new(payload_params.merge(organization_id: current_organization.id))
            if payload.save
              render_data(serialize(payload), status: :created)
            else
              render_error(status: 422, code: "PAYLOAD_INVALID", title: "Validation error",
                           errors: payload.errors.map { |e| { field: e.attribute, message: e.message } })
            end
          end

          def update
            skip_authorization
            payload = Operators::Payload.find_by!(id: params[:id], organization_id: current_organization.id)
            if payload.update(payload_params)
              render_data(serialize(payload))
            else
              render_error(status: 422, code: "PAYLOAD_INVALID", title: "Validation error",
                           errors: payload.errors.map { |e| { field: e.attribute, message: e.message } })
            end
          end

          def destroy
            skip_authorization
            payload = Operators::Payload.find_by!(id: params[:id], organization_id: current_organization.id)
            payload.destroy!
            render json: { data: { id: payload.id } }, status: :ok
          end

          private

          def payload_params
            params.permit(:name, :sensor_type, :manufacturer, :model, :resolution, :weight_grams, :status, :notes)
          end

          def serialize(p)
            {
              id: p.id,
              name: p.name,
              sensor_type: p.sensor_type,
              manufacturer: p.try(:manufacturer),
              model: p.try(:model),
              status: p.try(:status) || "active",
              resolution: p.try(:resolution)
            }
          end
        end
      end
    end
  end
end
