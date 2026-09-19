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
    PII_KEY_FRAGMENTS = %w[
      email
      phone
      telephone
      mobile
      cpf
      cnpj
      address
      full_name
      first_name
      last_name
      ip_address
      cookie
      session
    ].freeze

    def self.sanitize_properties(properties)
      return {} unless properties.is_a?(Hash)

      properties.each_with_object({}) do |(key, value), acc|
        normalized_key = key.to_s.downcase
        next if prohibited_key?(normalized_key)

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

    def self.prohibited_key?(key)
      (BLOCKED_KEYS + PII_KEY_FRAGMENTS).any? { |fragment| key.include?(fragment) }
    end
  end
end
