# frozen_string_literal: true

module Api
  module V1
    class OrdersController < BaseController
      def index
        authorize authorize_context, Orders::Order
        orders = policy_scope(authorize_context, Orders::Order).order(created_at: :desc).limit(50)
        render_data(orders.map { |o| serialize(o) })
      end

      def show
        order = TenantScope.find_order!(params[:id], organization: current_organization)
        authorize authorize_context, order
        render_data(serialize(order))
      end

      private

      def serialize(o)
        {
          id: o.id,
          mission_id: o.mission_id,
          status: o.status,
          payment_status: o.try(:payment_status),
          total: o.total,
          currency: o.currency,
          marketplace_fee: o.marketplace_fee,
          operator_amount: o.operator_amount,
          accepted_at: o.accepted_at,
          completed_at: o.completed_at
        }
      end
    end
  end
end
