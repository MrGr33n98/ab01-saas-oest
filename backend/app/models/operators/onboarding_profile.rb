# frozen_string_literal: true

module Operators
  # Aggregate root for the six-step Operator registration flow. Each step keeps
  # its own schema-shaped JSON document so a user can save and resume safely.
  class OnboardingProfile < ApplicationRecord
    self.table_name = "operator_onboarding_profiles"

    STATUSES = %w[draft ready submitted approved rejected].freeze
    SECTIONS = %w[address equipment business experience documents pricing].freeze
    SECTION_DATA_FIELDS = {
      "address" => :contact_data,
      "equipment" => :equipment_data,
      "business" => :business_data,
      "experience" => :experience_data,
      "documents" => :documents_data,
      "pricing" => :pricing_data
    }.freeze
    SECTION_DEFAULTS = SECTIONS.index_with { {} }.freeze

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :reviewed_by, class_name: "User", optional: true

    validates :onboarding_status, inclusion: { in: STATUSES }
    validate :section_data_is_an_object

    def data_for(section)
      public_send(SECTION_DATA_FIELDS.fetch(section.to_s)) || {}
    end

    def section_complete?(section)
      data = data_for(section).with_indifferent_access

      case section.to_s
      when "address"
        %i[full_name company_address country_code city phone_e164 max_travel_distance_km].all? { |key| data[key].present? } &&
          data[:max_travel_distance_km].to_f.positive?
      when "equipment"
        data[:drone_models].is_a?(Array) && data[:drone_models].present? &&
          data[:sensors].is_a?(Array) && data[:sensors].present? && data[:flight_hours].to_f.positive?
      when "business"
        data[:legal_name].present? && data[:company_registration].present? &&
          %i[has_insurance has_operator_authorization].all? { |key| data.key?(key) }
      when "experience"
        data[:industries].is_a?(Array) && data[:industries].present? &&
          data[:skills].is_a?(Array) && data[:skills].present?
      when "documents"
        data[:insurance_document_status].in?(%w[provided verified]) &&
          data[:operator_authorization_document_status].in?(%w[provided verified])
      when "pricing"
        data[:currency].present? && data[:daily_rate].to_f.positive?
      else
        false
      end
    end

    def completed_sections
      SECTIONS.select { |section| section_complete?(section) }
    end

    def completion_percentage
      (completed_sections.size.fdiv(SECTIONS.size) * 100).round
    end

    def ready_to_submit?
      completed_sections.size == SECTIONS.size
    end

    private

    def section_data_is_an_object
      SECTION_DATA_FIELDS.each_value do |field|
        errors.add(field, "must be an object") unless public_send(field).is_a?(Hash)
      end
    end
  end
end
