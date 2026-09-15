# frozen_string_literal: true

module Payments
  # Creates a Stripe Checkout Session for a marketplace Order (mission payment).
  # Fallback: if Stripe disabled, returns instructions for manual/Pix concierge.
  class CreateStripeCheckout
    Result = Struct.new(:success?, :checkout_url, :session_id, :provider, :errors, keyword_init: true)

    def self.call(order:, customer_email: nil, success_url: nil, cancel_url: nil)
      new(
        order: order,
        customer_email: customer_email,
        success_url: success_url,
        cancel_url: cancel_url
      ).call
    end

    def initialize(order:, customer_email:, success_url:, cancel_url:)
      @order = order
      @customer_email = customer_email
      @success_url = success_url
      @cancel_url = cancel_url
    end

    def call
      return fail!("order already paid") if order.payment_status == "paid"
      return fail!("order total invalid") if order.total.to_d <= 0

      unless Integrations::Stripe::Config.enabled?
        return Result.new(
          success?: true,
          checkout_url: nil,
          session_id: nil,
          provider: "manual",
          errors: ["Stripe disabled — use confirm_payment manual/Pix"]
        )
      end

      Integrations::Stripe::Config.configure!
      require "stripe"

      amount_cents = (order.total.to_d * 100).round.to_i
      currency = (order.currency.presence || Integrations::Stripe::Config.currency).downcase

      session_params = {
          mode: "payment",
          customer_email: customer_email,
          client_reference_id: order.id,
          payment_method_types: payment_method_types,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: currency,
                unit_amount: amount_cents,
                product_data: {
                  name: "Missão DroneHub — pedido #{order.id.to_s[0, 8]}",
                  metadata: {
                    order_id: order.id,
                    mission_id: order.mission_id.to_s
                  }
                }
              }
            }
          ],
          metadata: {
            order_id: order.id,
            mission_id: order.mission_id.to_s,
            customer_organization_id: order.customer_organization_id.to_s,
            kind: "mission_order"
          },
          success_url: success_url.presence || Integrations::Stripe::Config.success_url(order.id),
          cancel_url: cancel_url.presence || Integrations::Stripe::Config.cancel_url(order.id),
          locale: "pt-BR"
        }

      # Stripe Connect: split to operator Express account when onboarded
      operator_org = Organization.find_by(id: order.operator_organization_id)
      if operator_org&.respond_to?(:stripe_account_id) && operator_org.stripe_account_id.present?
        fee_bps = Integrations::Stripe::Config.platform_fee_bps
        application_fee = (amount_cents * fee_bps / 10_000.0).round
        session_params[:payment_intent_data] = {
          application_fee_amount: application_fee,
          transfer_data: { destination: operator_org.stripe_account_id }
        }
        session_params[:metadata][:operator_stripe_account] = operator_org.stripe_account_id
        session_params[:metadata][:application_fee_cents] = application_fee.to_s
      end

      session = ::Stripe::Checkout::Session.create(
        session_params,
        { idempotency_key: "checkout-order-#{order.id}" }
      )

      order.update_columns(
        payment_provider: "stripe",
        payment_provider_ref: session.id
      ) if order.respond_to?(:payment_provider)

      # Soft-store session on a pending payment row when schema allows
      begin
        Billing::Payment.create!(
          order_id: order.id,
          payer_organization_id: order.customer_organization_id,
          provider: "stripe",
          provider_payment_id: session.id,
          status: "pending",
          amount: order.total,
          currency: order.currency,
          method: "card",
          metadata: { checkout_session_id: session.id }
        )
      rescue StandardError
        # schema may not have metadata — ignore duplicate pending
      end

      Result.new(
        success?: true,
        checkout_url: session.url,
        session_id: session.id,
        provider: "stripe",
        errors: []
      )
    rescue ::Stripe::StripeError => e
      fail!("Stripe: #{e.message}")
    rescue StandardError => e
      fail!(e.message)
    end

    private

    attr_reader :order, :customer_email, :success_url, :cancel_url

    def payment_method_types
      # Card always; Pix if enabled in Stripe Dashboard (Brazil)
      types = ["card"]
      types << "pix" if ENV.fetch("STRIPE_ENABLE_PIX", "true") == "true"
      types
    end

    def fail!(msg)
      Result.new(success?: false, checkout_url: nil, session_id: nil, provider: nil, errors: [msg])
    end
  end
end
