# frozen_string_literal: true

require "openssl"

module Webhooks
  class HmacSignerService
    HEADER_NAME = "X-DroneHub-Signature-256"

    def self.compute_header(payload:, secret_key:, timestamp: Time.current.to_i)
      new(secret_key).compute_header(payload: payload, timestamp: timestamp)
    end

    def self.verify(payload:, secret_key:, header:, tolerance_seconds: 300)
      new(secret_key).verify(payload: payload, header: header, tolerance_seconds: tolerance_seconds)
    end

    def initialize(secret_key)
      @secret_key = secret_key.to_s
    end

    def compute_header(payload:, timestamp: Time.current.to_i)
      canonical_string = "#{timestamp}.#{payload_to_string(payload)}"
      signature = OpenSSL::HMAC.hexdigest("SHA256", @secret_key, canonical_string)
      "t=#{timestamp},v1=#{signature}"
    end

    def verify(payload:, header:, tolerance_seconds: 300)
      return false if header.blank?

      parts = header.split(",").to_h { |part| part.split("=", 2) }
      timestamp_str = parts["t"]
      signature = parts["v1"]

      return false if timestamp_str.blank? || signature.blank?

      timestamp = timestamp_str.to_i
      return false if tolerance_seconds.positive? && (Time.current.to_i - timestamp).abs > tolerance_seconds

      expected_sig = OpenSSL::HMAC.hexdigest("SHA256", @secret_key, "#{timestamp}.#{payload_to_string(payload)}")
      Rack::Utils.secure_compare(expected_sig, signature)
    end

    private

    def payload_to_string(payload)
      payload.is_a?(String) ? payload : payload.to_json
    end
  end
end
