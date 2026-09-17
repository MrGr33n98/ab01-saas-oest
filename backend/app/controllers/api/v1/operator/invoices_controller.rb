# frozen_string_literal: true

module Api
  module V1
    module Operator
      class InvoicesController < BaseController
        # GET /api/v1/operator/invoices
        # This is an operator payout ledger projection. Payment credentials and
        # provider documents remain outside the marketplace database.
        def index
          orders = Orders::Order.where(operator_organization_id: current_organization.id).order(completed_at: :desc, created_at: :desc)
          render_data(orders.limit(params.fetch(:limit, 50).to_i.clamp(1, 100)).map { |order| invoice_payload(order) })
        end

        private

        def invoice_payload(order)
          {
            id: order.id,
            reference: "OP-#{order.id.to_s.delete('-').first(10).upcase}",
            order_id: order.id,
            mission_id: order.mission_id,
            amount: order.operator_amount&.to_f,
            currency: order.currency,
            status: order.status == "completed" ? "available" : order.status,
            issued_at: order.created_at,
            available_at: order.completed_at
          }
        end
      end
    end
  end
end
