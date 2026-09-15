# frozen_string_literal: true

module Api
  module V1
    module Webhooks
      class StripeController < ActionController::API
        # POST /api/v1/webhooks/stripe
        # Raw body required for signature verification.
        def create
          payload = request.body.read
          sig = request.env["HTTP_STRIPE_SIGNATURE"]

          unless Integrations::Stripe::Config.enabled?
            return render json: { error: "stripe_disabled" }, status: :service_unavailable
          end

          secret = Integrations::Stripe::Config.webhook_secret
          if secret.blank?
            return render json: { error: "webhook_secret_missing" }, status: :service_unavailable
          end

          Integrations::Stripe::Config.configure!
          require "stripe"

          event = ::Stripe::Webhook.construct_event(payload, sig, secret)
          result = Payments::ApplyStripeEvent.call(event)

          render json: { received: true, result: result }, status: :ok
        rescue ::Stripe::SignatureVerificationError => e
          render json: { error: "invalid_signature", detail: e.message }, status: :bad_request
        rescue JSON::ParserError
          render json: { error: "invalid_payload" }, status: :bad_request
        rescue StandardError => e
          Rails.logger.error({ event: "stripe_webhook_error", error: e.message }.to_json)
          render json: { error: "processing_failed" }, status: :internal_server_error
        end
      end
    end
  end
end
