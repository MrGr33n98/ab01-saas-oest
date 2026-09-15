# frozen_string_literal: true

module Payments
  # MVP payment: Pix/boleto/manual concierge confirmation by platform_admin or billing role.
  class ConfirmManual
    Result = Struct.new(:success?, :order, :payment, :errors, keyword_init: true)

    def self.call(order:, actor:, method: "manual", provider_payment_id: nil, idempotency_key: nil)
      new(order: order, actor: actor, method: method, provider_payment_id: provider_payment_id, idempotency_key: idempotency_key).call
    end

    def initialize(order:, actor:, method:, provider_payment_id:, idempotency_key:)
      @order = order
      @actor = actor
      @method = method
      @provider_payment_id = provider_payment_id
      @idempotency_key = idempotency_key
    end

    def call
      return fail!("order already paid") if order.payment_status == "paid"

      payment = nil
      ActiveRecord::Base.transaction do
        order.lock!
        return fail!("order already paid") if order.payment_status == "paid"

        payment = Billing::Payment.create!(
          order_id: order.id,
          payer_organization_id: order.customer_organization_id,
          provider: "manual",
          provider_payment_id: provider_payment_id || "manual-#{order.id}",
          status: "paid",
          amount: order.total,
          currency: order.currency,
          idempotency_key: idempotency_key,
          method: method,
          paid_at: Time.current,
          confirmed_by_id: actor.id
        )

        order.update!(
          payment_status: "paid",
          paid_at: Time.current,
          status: order.status == "pending_payment" ? "paid" : order.status
        )

        DomainOutboxEvent.create!(
          aggregate_type: "payment",
          aggregate_id: payment.id,
          event_type: "payment.authorized",
          payload: { order_id: order.id, payment_id: payment.id, method: method },
          occurred_at: Time.current
        )

        AuditLog.create!(
          organization_id: order.customer_organization_id,
          actor_id: actor.id,
          action: "payment.confirmed",
          auditable_type: "Order",
          auditable_id: order.id,
          after_data: { payment_status: "paid", method: method },
          created_at: Time.current
        )
      end

      begin
        mission = order.mission
        if mission
          OrganizationMembership.where(organization_id: order.customer_organization_id, status: "active", role: %w[owner admin billing]).find_each do |m|
            Mail::Deliver.call(:payment_confirmed, user: m.user, order: order, mission: mission) if m.user
          end
        end
      rescue StandardError => e
        Rails.logger.warn({ event: "payment_confirmed_mail_failed", error: e.message }.to_json)
      end

      Result.new(success?: true, order: order.reload, payment: payment, errors: [])
    rescue ActiveRecord::RecordInvalid => e
      fail!(e.record.errors.full_messages.join(", "))
    end

    private

    attr_reader :order, :actor, :method, :provider_payment_id, :idempotency_key

    def fail!(msg)
      Result.new(success?: false, order: order, payment: nil, errors: [msg])
    end
  end
end
