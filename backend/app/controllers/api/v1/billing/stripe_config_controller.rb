# frozen_string_literal: true

module Api
  module V1
    module Billing
      class StripeConfigController < BaseController
        skip_before_action :authenticate_user!, only: %i[show], raise: false
        skip_before_action :resolve_organization!, only: %i[show], raise: false

        # GET /api/v1/billing/stripe_config — publishable key for frontend
        def show
          cfg = Integrations::Stripe::Config
          render json: {
            data: {
              enabled: cfg.enabled?,
              publishable_key: cfg.enabled? ? cfg.publishable_key : nil,
              currency: cfg.currency,
              pix_enabled: ENV.fetch("STRIPE_ENABLE_PIX", "true") == "true",
              mode: cfg.status[:mode]
            }
          }
        end
      end
    end
  end
end
