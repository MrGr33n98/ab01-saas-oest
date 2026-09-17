# frozen_string_literal: true

module Operators
  module Onboarding
    class UpsertSection
      Result = Struct.new(:record, :errors, keyword_init: true) do
        def success?
          errors.blank?
        end

        def failure?
          !success?
        end
      end

      def initialize(profile:, section:, attributes:)
        @profile = profile
        @section = section.to_s
        @attributes = attributes.to_h.deep_stringify_keys
      end

      def call
        return Result.new(record: nil, errors: ["Unknown onboarding section"]) unless valid_section?

        onboarding = nil
        @profile.with_lock do
          onboarding = @profile.operator_onboarding_profile || @profile.build_operator_onboarding_profile
          onboarding.public_send("#{data_field}=", normalized_attributes)
          onboarding.onboarding_status = onboarding.ready_to_submit? ? "ready" : "draft" if onboarding.onboarding_status.in?(%w[draft ready])
          onboarding.save!
        end

        Result.new(record: onboarding, errors: [])
      rescue ActiveRecord::RecordInvalid => e
        Result.new(record: onboarding, errors: e.record.errors.full_messages)
      end

      private

      def valid_section?
        Operators::OnboardingProfile::SECTIONS.include?(@section)
      end

      def data_field
        Operators::OnboardingProfile::SECTION_DATA_FIELDS.fetch(@section)
      end

      def normalized_attributes
        case @section
        when "address"
          @attributes.slice(
            "full_name", "company_address", "country_code", "state_code", "city",
            "available_countries", "phone_e164", "postal_code", "max_travel_distance_km"
          ).tap do |payload|
            payload["available_countries"] = Array(payload["available_countries"]).compact_blank.uniq
            payload["max_travel_distance_km"] = payload["max_travel_distance_km"].to_f
          end
        when "equipment"
          @attributes.slice(
            "drone_models", "sensors", "camera_resolution", "flight_hours", "gcp_experience",
            "ground_capture_equipment", "base_station", "mapping_software"
          ).tap do |payload|
            payload["drone_models"] = Array(payload["drone_models"]).compact_blank.uniq
            payload["sensors"] = Array(payload["sensors"]).compact_blank.uniq
            payload["flight_hours"] = payload["flight_hours"].to_f
            payload["gcp_experience"] = boolean(payload["gcp_experience"])
          end
        when "business"
          @attributes.slice(
            "legal_name", "company_registration", "tax_id", "has_insurance",
            "has_operator_authorization", "insurance_provider", "authorization_reference"
          ).transform_values { |value| value.is_a?(String) ? value.strip : value }.tap do |payload|
            %w[has_insurance has_operator_authorization].each { |key| payload[key] = boolean(payload[key]) }
          end
        when "experience"
          @attributes.slice("industries", "skills", "years_operating", "notes").tap do |payload|
            payload["industries"] = Array(payload["industries"]).compact_blank.uniq
            payload["skills"] = Array(payload["skills"]).compact_blank.uniq
            payload["years_operating"] = payload["years_operating"].to_f
          end
        when "documents"
          @attributes.slice(
            "insurance_document_status", "operator_authorization_document_status",
            "pilot_license_document_status", "notes"
          )
        when "pricing"
          @attributes.slice(
            "currency", "daily_rate", "thermal_daily_rate", "lidar_daily_rate", "minimum_job_value"
          ).tap do |payload|
            %w[daily_rate thermal_daily_rate lidar_daily_rate minimum_job_value].each do |key|
              payload[key] = payload[key].to_f if payload[key].present?
            end
            payload["currency"] = payload["currency"].to_s.upcase
          end
        end
      end

      def boolean(value)
        ActiveModel::Type::Boolean.new.cast(value)
      end
    end
  end
end
