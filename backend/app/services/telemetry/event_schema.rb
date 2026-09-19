# frozen_string_literal: true

module Telemetry
  class EventSchema
    OPERATIONAL_IDENTIFIERS = %w[
      organization_id
      project_id
      mission_id
      deliverable_id
    ].freeze

    ALLOWED_PROPERTIES = {
      "mission.created" => %w[project_id mission_type],
      "mission.published" => %w[mission_type],
      "mission.completed" => %w[deliverable_id],
      "quote.accepted" => %w[mission_id total],
      "order.created" => %w[mission_id total currency],
      "webhook.delivery_succeeded" => %w[status_code duration_ms],
      "webhook.delivery_failed" => %w[status_code attempt error_class]
    }.freeze

    def self.sanitize(event_name, properties)
      allowed_keys = ALLOWED_PROPERTIES.fetch(event_name.to_s, [])
      return {} unless properties.respond_to?(:to_h)

      properties.to_h.each_with_object({}) do |(key, value), sanitized|
        key = key.to_s
        next unless allowed_keys.include?(key)
        next unless scalar?(value)

        sanitized_value = Sanitizer.sanitize_properties(key => value)[key]
        sanitized[key] = sanitized_value if sanitized_value.present? || value.in?([false, 0])
      end
    end

    def self.allowed_properties_for(event_name)
      ALLOWED_PROPERTIES.fetch(event_name.to_s, [])
    end

    def self.scalar?(value)
      !value.is_a?(Hash) && !value.is_a?(Array)
    end
    private_class_method :scalar?
  end
end
