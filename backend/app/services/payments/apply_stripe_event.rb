# frozen_string_literal: true

module Payments
  # Idempotent application of Stripe webhook events to orders/payments.
  class ApplyStripeEvent
    def self.call(event)
      new(event).call
    end

    def initialize(event)
      @event = event
      @type = event["type"] || event.type
      @data = event["data"] || event.data
      @object = @data.is_a?(Hash) ? (@data["object"] || @data[:object]) : @data.object
    end

    def call
      case type.to_s
      when "checkout.session.completed"
        handle_checkout_completed
      when "payment_intent.succeeded"
        handle_payment_intent_succeeded
      when "checkout.session.expired"
        handle_session_expired
      when "charge.refunded"
        handle_refund
      else
        Rails.logger.info({ event: "stripe_unhandled", type: type }.to_json)
        { handled: false, type: type }
      end
    end

    private

    attr_reader :event, :type, :object

    def handle_checkout_completed
      meta = hashish(object["metadata"] || object.metadata)
      order_id = meta["order_id"] || object["client_reference_id"] || object.client_reference_id
      return { handled: false, reason: "no_order" } if order_id.blank?

      order = Orders::Order.find_by(id: order_id)
      return { handled: false, reason: "order_not_found" } unless order
      return { handled: true, reason: "already_paid" } if order.payment_status == "paid"

      session_id = object["id"] || object.id
      payment_intent = object["payment_intent"] || object.try(:payment_intent)

      ActiveRecord::Base.transaction do
        order.lock!
        return { handled: true, reason: "already_paid" } if order.payment_status == "paid"

        payment = Billing::Payment.find_or_initialize_by(
          provider: "stripe",
          provider_payment_id: session_id
        )
        payment.assign_attributes(
          order_id: order.id,
          payer_organization_id: order.customer_organization_id,
          status: "paid",
          amount: order.total,
          currency: order.currency,
          method: "stripe_checkout",
          paid_at: Time.current
        )
        payment.save!

        order.update!(
          payment_status: "paid",
          paid_at: Time.current,
          status: order.status == "pending_payment" ? "paid" : order.status
        )

        DomainOutboxEvent.create!(
          aggregate_type: "payment",
          aggregate_id: payment.id,
          event_type: "payment.authorized",
          payload: {
            order_id: order.id,
            payment_id: payment.id,
            provider: "stripe",
            session_id: session_id,
            payment_intent: payment_intent
          },
          occurred_at: Time.current
        )
      end

      # Email after commit
      begin
        mission = order.mission
        if mission
          OrganizationMembership.where(
            organization_id: order.customer_organization_id,
            status: "active",
            role: %w[owner admin billing]
          ).find_each do |m|
            Mail::Deliver.call(:payment_confirmed, user: m.user, order: order, mission: mission) if m.user
          end
        end
      rescue StandardError => e
        Rails.logger.warn({ event: "payment_mail_failed", error: e.message }.to_json)
      end

      { handled: true, order_id: order.id }
    end

    def handle_payment_intent_succeeded
      { handled: true, note: "covered_by_checkout_session_completed" }
    end

    def handle_session_expired
      { handled: true, note: "session_expired" }
    end

    def handle_refund
      { handled: true, note: "refund_logged" }
    end

    def hashish(obj)
      return obj if obj.is_a?(Hash)
      return obj.to_hash if obj.respond_to?(:to_hash)
      {}
    end
  end
end
