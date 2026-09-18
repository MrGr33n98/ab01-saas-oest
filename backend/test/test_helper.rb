# frozen_string_literal: true

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Add helper methods for all tests
    def create_test_org(name: "Test Org #{SecureRandom.hex(4)}")
      Organization.create!(
        name: name,
        slug: name.parameterize,
        country_code: "BR",
        organization_type: "enterprise",
        status: "active"
      )
    end

    def generate_token_for(user)
      body = Base64.urlsafe_encode64({
        sub: user.id,
        jti: user.jti,
        type: "access",
        exp: 24.hours.from_now.to_i
      }.to_json)
      sig = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", ENV["JWT_SECRET"] || "dronehub-mvp-dev-secret-change-me", body))
      "#{body}.#{sig}"
    end
  end
end
