# frozen_string_literal: true

module Api
  module V1
    module Orders
      class CheckoutsController < BaseController
        # POST /api/v1/orders/:order_id/checkout
        def create
          order = TenantScope.find_order!(params[:order_id], organization: current_organization)
          authorize authorize_context, order
          unless order.customer_organization_id == current_organization.id
            return render_error(status: 403, code: "FORBIDDEN", title: "Order not in your organization")
          end

          result = Payments::CreateStripeCheckout.call(
            order: order,
            customer_email: current_user.email,
            success_url: params[:success_url],
            cancel_url: params[:cancel_url]
          )

          if result.success?
            render json: {
              data: {
                provider: result.provider,
                checkout_url: result.checkout_url,
                session_id: result.session_id,
                message: result.errors.presence&.join(", ")
              },
              meta: { request_id: request.headers["X-Request-Id"] }
            }
          else
            render json: {
              title: "Checkout failed",
              detail: result.errors.join(", "),
              status: 422,
              code: "CHECKOUT_FAILED"
            }, status: :unprocessable_entity
          end
        end
      end
    end
  end
end
