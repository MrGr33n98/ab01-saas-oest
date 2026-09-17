# frozen_string_literal: true

module Api
  module V1
    module Operator
      class OnboardingController < BaseController
        before_action :require_operator_manager!, only: :update_section

        # GET /api/v1/operator/onboarding
        def show
          onboarding = current_onboarding
          render_data(onboarding_payload(onboarding))
        end

        # PATCH /api/v1/operator/onboarding/:section
        def update_section
          result = Operators::Onboarding::UpsertSection.new(
            profile: operator_profile,
            section: params[:section],
            attributes: section_attributes
          ).call

          unless result.success?
            return render_error(
              status: 422,
              code: "VALIDATION",
              title: "Invalid onboarding section",
              detail: result.errors.join(", ")
            )
          end

          render_data(onboarding_payload(result.record))
        end

        private

        def operator_profile
          @operator_profile ||= current_organization.operator_profile || raise(ActiveRecord::RecordNotFound)
        end

        def current_onboarding
          operator_profile.operator_onboarding_profile || Operators::OnboardingProfile.new(operator_profile: operator_profile)
        end

        def require_operator_manager!
          return if current_user.platform_admin? || current_membership&.role.in?(%w[owner admin manager operator_manager])

          render_error(status: 403, code: "FORBIDDEN", title: "Operator manager permission required")
        end

        def section_attributes
          params.permit(
            :full_name, :company_address, :country_code, :state_code, :city, :phone_e164,
            :postal_code, :max_travel_distance_km, :camera_resolution, :flight_hours,
            :gcp_experience, :ground_capture_equipment, :base_station, :mapping_software,
            :legal_name, :company_registration, :tax_id, :has_insurance,
            :has_operator_authorization, :insurance_provider, :authorization_reference,
            :years_operating, :notes, :insurance_document_status,
            :operator_authorization_document_status, :pilot_license_document_status,
            :currency, :daily_rate, :thermal_daily_rate, :lidar_daily_rate, :minimum_job_value,
            available_countries: [], drone_models: [], sensors: [], industries: [], skills: []
          ).to_h
        end

        def onboarding_payload(onboarding)
          sections = Operators::OnboardingProfile::SECTIONS.index_with do |section|
            {
              complete: onboarding.section_complete?(section),
              data: onboarding.data_for(section)
            }
          end
          {
            status: onboarding.onboarding_status,
            completion_percentage: onboarding.completion_percentage,
            completed_sections: onboarding.completed_sections,
            ready_to_submit: onboarding.ready_to_submit?,
            sections: sections
          }
        end
      end
    end
  end
end
