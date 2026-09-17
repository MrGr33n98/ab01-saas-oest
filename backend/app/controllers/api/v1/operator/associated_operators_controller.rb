# frozen_string_literal: true

module Api
  module V1
    module Operator
      class AssociatedOperatorsController < BaseController
        before_action :require_operator_manager!, except: :index

        def index
          records = operator_profile.associated_operators.order(created_at: :desc)
          render_data(records.map { |record| associate_payload(record) })
        end

        def create
          record = operator_profile.associated_operators.new(associate_attributes.merge(
            organization: current_organization,
            source: "manual"
          ))
          if record.save
            render_data(associate_payload(record), status: :created)
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid associated operator", detail: record.errors.full_messages.join(", "))
          end
        end

        def update
          record = operator_profile.associated_operators.find(params[:id])
          if record.update(associate_attributes)
            render_data(associate_payload(record))
          else
            render_error(status: 422, code: "VALIDATION", title: "Invalid associated operator", detail: record.errors.full_messages.join(", "))
          end
        end

        def destroy
          operator_profile.associated_operators.find(params[:id]).destroy!
          head :no_content
        end

        # POST /api/v1/operator/associated_operators/import
        # The browser parses CSV locally and sends typed rows; the server never
        # needs to retain a potentially sensitive source file.
        def import
          result = Operators::Associates::ImportRows.new(profile: operator_profile, rows: params.require(:rows)).call
          unless result.success?
            return render_error(status: 422, code: "CSV_IMPORT_FAILED", title: "Associated operators import failed", detail: result.errors.join(", "))
          end

          render_data({ imported: result.records.size, records: result.records.map { |record| associate_payload(record) } }, status: :created)
        end

        private

        def operator_profile
          @operator_profile ||= current_organization.operator_profile || raise(ActiveRecord::RecordNotFound)
        end

        def require_operator_manager!
          return if current_user.platform_admin? || current_membership&.role.in?(%w[owner admin manager operator_manager])

          render_error(status: 403, code: "FORBIDDEN", title: "Operator manager permission required")
        end

        def associate_attributes
          params.permit(:full_name, :email, :phone_e164, :company_name, :country_code, :state_code, :city, :license_number, :status).to_h
        end

        def associate_payload(record)
          {
            id: record.id,
            full_name: record.full_name,
            email: record.email,
            phone_e164: record.phone_e164,
            company_name: record.company_name,
            country_code: record.country_code,
            state_code: record.state_code,
            city: record.city,
            license_number: record.license_number,
            status: record.status,
            source: record.source,
            created_at: record.created_at
          }
        end
      end
    end
  end
end
