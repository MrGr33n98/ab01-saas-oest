# frozen_string_literal: true

module Integrations
  module Stripe
    # Central Stripe configuration. Safe to boot without keys (disabled mode).
    module Config
      module_function

      def enabled?
        secret_key.present? && ENV.fetch("STRIPE_ENABLED", "false") == "true"
      end

      def secret_key
        ENV["STRIPE_SECRET_KEY"].presence
      end

      def publishable_key
        ENV["STRIPE_PUBLISHABLE_KEY"].presence
      end

      def webhook_secret
        ENV["STRIPE_WEBHOOK_SECRET"].presence
      end

      def currency
        ENV.fetch("STRIPE_CURRENCY", "brl").downcase
      end

      # Platform fee in basis points (e.g. 1000 = 10%) for Connect destination charges later
      def platform_fee_bps
        ENV.fetch("STRIPE_PLATFORM_FEE_BPS", "1000").to_i
      end

      def success_url(order_id)
        base = ENV.fetch("APP_URL", "http://localhost:3000")
        ENV.fetch(
          "STRIPE_CHECKOUT_SUCCESS_URL",
          "#{base}/app/missions?payment=success&order_id=#{order_id}"
        )
      end

      def cancel_url(order_id)
        base = ENV.fetch("APP_URL", "http://localhost:3000")
        ENV.fetch(
          "STRIPE_CHECKOUT_CANCEL_URL",
          "#{base}/app/missions?payment=cancel&order_id=#{order_id}"
        )
      end

      def subscription_success_url
        "#{ENV.fetch('APP_URL', 'http://localhost:3000')}/app/billing?checkout=success"
      end

      def subscription_cancel_url
        "#{ENV.fetch('APP_URL', 'http://localhost:3000')}/app/billing?checkout=cancel"
      end

      def configure!
        return unless secret_key

        require "stripe"
        ::Stripe.api_key = secret_key
        ::Stripe.api_version = ENV.fetch("STRIPE_API_VERSION", "2024-11-20.acacia")
      end

      def status
        {
          enabled: enabled?,
          configured: secret_key.present?,
          publishable_key_present: publishable_key.present?,
          webhook_secret_present: webhook_secret.present?,
          currency: currency,
          mode: secret_key.to_s.start_with?("sk_live") ? "live" : (secret_key.present? ? "test" : "off")
        }
      end
    end
  end
end
