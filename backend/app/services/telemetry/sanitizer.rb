# frozen_string_literal: true

module Telemetry
  class Sanitizer
    BLOCKED_KEYS = %w[
      password
      token
      jwt
      secret
      secret_key
      authorization
      api_key
      credit_card
      cvv
      card_number
      auth_token
      bearer
    ].freeze

    def self.sanitize_properties(properties)
      return {} unless properties.is_a?(Hash)

      properties.each_with_object({}) do |(key, value), acc|
        normalized_key = key.to_s.downcase
        next if BLOCKED_KEYS.any? { |blocked| normalized_key.include?(blocked) }

        acc[key.to_s] = sanitize_value(value)
      end
    end

    def self.sanitize_value(value)
      case value
      when Hash
        sanitize_properties(value)
      when Array
        value.map { |v| sanitize_value(v) }
      when Numeric, TrueClass, FalseClass, NilClass
        value
      when Time, DateTime, Date
        value.iso8601
      else
        value.to_s.truncate(500)
      end
    end
  end
end
