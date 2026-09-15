# frozen_string_literal: true

module Api
  module V1
    module Admin
      class PlansController < BaseController
        include AdminAuthorization
        before_action :require_platform_admin!

        def index
          render json: { data: Billing::Plan.order(:price_monthly_cents).map { |p| serialize(p) } }
        end

        def update
          plan = Billing::Plan.find(params[:id])
          plan.update!(params.require(:plan).permit(:name, :active, :price_monthly_cents, :stripe_price_id, features_json: {}))
          render json: { data: serialize(plan) }
        end

        private
        # require_platform_admin! from AdminAuthorization

        def serialize(p)
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            audience: p.try(:audience),
            price_monthly_cents: p.try(:price_monthly_cents),
            active: p.try(:active),
            features_json: p.try(:features_json)
          }
        end
      end
    end
  end
end
