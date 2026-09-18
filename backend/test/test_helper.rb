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
  end
end
