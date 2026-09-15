# frozen_string_literal: true

module Api
  module V1
    module Billing
      # SaaS plan subscription checkout (Starter/Pro) — separate from mission order payment.
      class CheckoutController < BaseController
        def create
          unless Integrations::Stripe::Config.enabled?
            return render json: {
              data: {
                provider: "manual",
                message: "Stripe desabilitado. Ative STRIPE_ENABLED=true e configure as keys."
              },
              meta: { request_id: request.request_id }
            }, status: :ok
          end

          price_id = params.require(:price_id)
          Integrations::Stripe::Config.configure!
          require "stripe"

          session = ::Stripe::Checkout::Session.create(
            mode: "subscription",
            customer_email: current_user.email,
            line_items: [{ price: price_id, quantity: 1 }],
            success_url: Integrations::Stripe::Config.subscription_success_url,
            cancel_url: Integrations::Stripe::Config.subscription_cancel_url,
            metadata: {
              organization_id: current_organization.id,
              user_id: current_user.id,
              kind: "saas_subscription"
            },
            locale: "pt-BR"
          )

          render json: {
            data: { checkout_url: session.url, session_id: session.id, provider: "stripe" },
            meta: { request_id: request.request_id }
          }
        rescue ::Stripe::StripeError => e
          render json: {
            title: "Stripe error",
            detail: e.message,
            status: 422,
            code: "STRIPE_ERROR"
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
