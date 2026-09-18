# frozen_string_literal: true

require "test_helper"

class TelemetrySanitizerTest < ActiveSupport::TestCase
  test "redacts sensitive fields like passwords, tokens and secrets" do
    raw_payload = {
      "user_name" => "DronePilot",
      "password" => "supersecret123",
      "auth_token" => "bearer abcdef123456",
      "api_key" => "pk_live_12345",
      "credit_card" => "4111222233334444",
      "allowed_metric" => 42
    }

    sanitized = Telemetry::Sanitizer.sanitize_properties(raw_payload)

    assert_equal "DronePilot", sanitized["user_name"]
    assert_equal 42, sanitized["allowed_metric"]
    assert_nil sanitized["password"]
    assert_nil sanitized["auth_token"]
    assert_nil sanitized["api_key"]
    assert_nil sanitized["credit_card"]
  end

  test "truncates excessively long strings" do
    long_string = "a" * 1000
    sanitized = Telemetry::Sanitizer.sanitize_properties({ "detail" => long_string })
    assert_equal 500, sanitized["detail"].length
  end
end
