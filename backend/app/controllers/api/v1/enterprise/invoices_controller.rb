# frozen_string_literal: true

module Api
  module V1
    module Enterprise
      # Billing::Payment is the source of truth. The response exposes a stable
      # invoice-like list for the UI without pretending to be a fiscal invoice.
      class InvoicesController < BaseController
        def index
          status = params[:status].presence
          payments = Billing::Payment.joins(:order)
                                     .where(orders: { customer_organization_id: current_organization.id })
                                     .includes(:order)
                                     .order(created_at: :desc)
          payments = payments.where(status: status) if status.present? && status != "all"

          render_data(payments.limit(100).map { |payment| serialize(payment) })
        end

        private

        def serialize(payment)
          {
            id: payment.id,
            reference: "PAY-#{payment.id.to_s.delete('-').first(8).upcase}",
            order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            issued_at: payment.created_at,
            paid_at: payment.respond_to?(:paid_at) ? payment.paid_at : nil
          }
        end
      end
    end
  end
end
