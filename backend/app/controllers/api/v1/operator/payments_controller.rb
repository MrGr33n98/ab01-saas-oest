# frozen_string_literal: true

module Api
  module V1
    module Operator
      # GET /api/v1/operator/payments
      class PaymentsController < BaseController
        def index
          skip_authorization
          orders = Orders::Order
            .where(operator_organization_id: current_organization.id)
            .order(created_at: :desc)
            .limit(50)

          render_data(orders.map { |o|
            {
              id: o.id,
              mission_id: o.try(:mission_id),
              status: o.status,
              payment_status: o.respond_to?(:payment_status) ? o.payment_status : nil,
              total: o.total&.to_f,
              currency: o.currency,
              placed_at: o.try(:placed_at),
              operator_payout: nil # Stripe Connect payout — future
            }
          })
        end
      end
    end
  end
end
