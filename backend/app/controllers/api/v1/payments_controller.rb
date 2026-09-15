# frozen_string_literal: true

module Api
  module V1
    class PaymentsController < BaseController
      def confirm
        order = TenantScope.find_order!(params[:order_id], organization: current_organization)

        unless current_user.platform_admin? || role_billing?
          return render_error(status: 403, code: "FORBIDDEN", title: "Not allowed to confirm payment")
        end

        unless current_user.platform_admin? || order.customer_organization_id == current_organization.id
          return render_error(status: 403, code: "FORBIDDEN", title: "Order not in organization")
        end

        result = Payments::ConfirmManual.call(
          order: order,
          actor: current_user,
          method: params[:method].presence || "pix",
          provider_payment_id: params[:provider_payment_id],
          idempotency_key: request.headers["Idempotency-Key"]
        )

        if result.success?
          render_data({
            order_id: result.order.id,
            payment_status: result.order.payment_status,
            payment_id: result.payment.id
          })
        else
          render_error(
            status: 422,
            code: "PAYMENT_FAILED",
            title: "Payment confirm failed",
            detail: result.errors.join(", ")
          )
        end
      end

      private

      def role_billing?
        current_membership&.role.to_s.in?(%w[owner admin billing])
      end
    end
  end
end
