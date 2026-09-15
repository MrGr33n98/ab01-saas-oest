# frozen_string_literal: true

module Pricing
  class MarketplaceFeeCalculator
    DEFAULT_RATE = BigDecimal("0.12") # 12% take rate V1

    def self.call(subtotal:, organization: nil)
      new(subtotal: subtotal, organization: organization).call
    end

    def initialize(subtotal:, organization:)
      @subtotal = BigDecimal(subtotal.to_s)
      @organization = organization
    end

    def call
      rate = DEFAULT_RATE
      # Future: plan-based or negotiated rates via FeatureGate / subscriptions
      (@subtotal * rate).round(2)
    end
  end
end
