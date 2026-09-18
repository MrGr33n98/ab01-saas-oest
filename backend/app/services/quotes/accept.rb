# frozen_string_literal: true

module Quotes
  class Accept
    Result = Struct.new(:success?, :order, :quote, :errors, keyword_init: true)

    def self.call(**args)
      new(**args).call
    end

    def initialize(quote:, user:, expected_lock_version:, idempotency_key:)
      @quote = quote
      @user = user
      @expected_lock_version = expected_lock_version
      @idempotency_key = idempotency_key
    end

    def call
      return Result.new(success?: false, errors: ["Quote is not submittable for accept"]) unless quote.status.in?(%w[submitted viewed negotiating])

      ActiveRecord::Base.transaction do
        quote.lock!
        if expected_lock_version && quote.lock_version != expected_lock_version
          return Result.new(success?: false, errors: ["Concurrent modification"], quote: quote)
        end

        # Reject other open quotes for this mission
        Quotes::Quote
          .where(mission_id: quote.mission_id, status: %w[submitted viewed negotiating draft])
          .where.not(id: quote.id)
          .update_all(status: "rejected", rejected_at: Time.current, updated_at: Time.current)

        quote.update!(
          status: "accepted",
          accepted_at: Time.current
        )

        fee = Pricing::MarketplaceFeeCalculator.call(subtotal: quote.subtotal, organization: quote.customer_organization)
        order = Orders::Order.create!(
          mission_id: quote.mission_id,
          quote_id: quote.id,
          customer_organization_id: quote.customer_organization_id,
          operator_organization_id: quote.operator_organization_id,
          status: "pending_payment",
          subtotal: quote.subtotal,
          marketplace_fee: fee,
          operator_amount: quote.subtotal - fee,
          taxes: quote.taxes,
          total: quote.total,
          currency: quote.currency,
          accepted_at: Time.current
        )

        mission = quote.mission
        mission.update!(status: "operator_selected")

        DomainOutboxEvent.create!(
          aggregate_type: "quote",
          aggregate_id: quote.id,
          event_type: "quote.accepted",
          payload: {
            quote_id: quote.id,
            order_id: order.id,
            mission_id: mission.id
          },
          occurred_at: Time.current
        )

        DomainOutboxEvent.create!(
          aggregate_type: "order",
          aggregate_id: order.id,
          event_type: "order.created",
          payload: { order_id: order.id, mission_id: mission.id },
          occurred_at: Time.current
        )

        Telemetry::Collector.track(
          "quote.accepted",
          organization: quote.customer_organization,
          actor: user,
          entity: quote,
          properties: { mission_id: mission.id, total: quote.total },
          source: "backend"
        )

        Telemetry::Collector.track(
          "order.created",
          organization: order.customer_organization,
          actor: user,
          entity: order,
          properties: { mission_id: mission.id, total: order.total, currency: order.currency },
          source: "backend"
        )

        # Notify customer owners + operator org owners
        begin
          OrganizationMembership.where(organization_id: order.customer_organization_id, status: "active", role: %w[owner admin]).find_each do |m|
            Mail::Deliver.call(:quote_accepted, user: m.user, mission: mission, quote: quote, order: order) if m.user
          end
          OrganizationMembership.where(organization_id: order.operator_organization_id, status: "active", role: %w[owner admin]).find_each do |m|
            Mail::Deliver.call(:quote_accepted, user: m.user, mission: mission, quote: quote, order: order) if m.user
          end
        rescue StandardError => e
          Rails.logger.warn({ event: "quote_accepted_mail_failed", error: e.message }.to_json)
        end

        Result.new(success?: true, order: order, quote: quote, errors: [])
      end
    rescue ActiveRecord::RecordInvalid => e
      Result.new(success?: false, errors: e.record.errors.full_messages)
    end

    private

    attr_reader :quote, :user, :expected_lock_version, :idempotency_key
  end
end
